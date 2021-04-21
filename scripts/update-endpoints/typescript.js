/**
 * We do not want to have `@octokit/openapi` as a production dependency due to
 * its huge size. We are only interested in the REST API endpoint paths that
 * trigger notifications. So instead we automatically generate a file that
 * only contains these paths when @octokit/openapi has a new release.
 */
const { writeFileSync } = require("fs");

const prettier = require("prettier");

const ENDPOINTS = require("./generated/endpoints.json");
const endpoints = [];

for (const endpoint of ENDPOINTS) {
  // All paginating endpoints have an operation ID starting with "list",
  // with the exception of search endpoints
  if (!/^list\b/.test(endpoint.id) && endpoint.scope !== "search") {
    continue;
  }

  if (endpoint.renamed) {
    continue;
  }

  const successResponses = endpoint.responses.filter(
    (response) => response.code < 300
  );

  if (successResponses.length === 0) {
    continue;
  }
  if (!successResponses[0].schema) {
    continue;
  }

  const schemaObj = JSON.parse(successResponses[0].schema);
  const schema = schemaObj.anyOf ? schemaObj.anyOf[0] : schemaObj;
  const url = endpoint.url;

  if (!schema.type || (schema.type === "object" && !schema.properties)) {
    continue;
  }

  endpoints.push({
    url,
    resultsKey: schema.type === "array" ? null : findResultsKey(schema),
    documentationUrl: endpoint.documentationUrl,
  });
}

function findResultsKey(schema) {
  for (const [key, value] of Object.entries(schema.properties)) {
    if (key === "schemas") {
      // e.g. https://docs.github.com/en/free-pro-team@latest/rest/reference/enterprise-admin#list-scim-provisioned-identities-for-an-enterprise
      continue;
    }
    if (value.type === "array") {
      return key;
    }
  }
}

function sortEndpoints(endpoints) {
  return endpoints.sort((a, b) => {
    return a.url > b.url ? 1 : -1;
  });
}

function endpointToTypes(endpoint) {
  const response = endpoint.resultsKey
    ? `Endpoints["GET ${endpoint.url}"]["response"] & { data: Endpoints["GET ${endpoint.url}"]["response"]["data"]["${endpoint.resultsKey}"] }`
    : `Endpoints["GET ${endpoint.url}"]["response"]`;

  return `
  /**
   * @see ${endpoint.documentationUrl}
   */
  "GET ${endpoint.url}": {
    parameters: Endpoints["GET ${endpoint.url}"]["parameters"];
    response: ${response};
  };
  `;
}

function endpointToKey(endpoint) {
  return `"GET ${endpoint.url}"`;
}

writeFileSync(
  "./src/generated/paginating-endpoints.ts",
  prettier.format(
    `import { Endpoints } from "@octokit/types";

    export interface PaginatingEndpoints {
      ${sortEndpoints(endpoints).map(endpointToTypes).join("\n\n")}
    }

    export const paginatingEndpoints: (keyof PaginatingEndpoints)[] = [
      ${sortEndpoints(endpoints).map(endpointToKey).join(",\n")}
    ]
    `,
    {
      parser: "typescript",
    }
  )
);
