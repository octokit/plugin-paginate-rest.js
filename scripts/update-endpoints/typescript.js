/**
 * We do not want to have `@octokit/routes` as a production dependency due to
 * its huge size. We are only interested in the REST API endpoint paths that
 * trigger notifications. So instead we automatically generate a file that
 * only contains these paths when @octokit/routes has a new release.
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

  if (endpoint.url === "/feeds") {
    debugger;
  }

  if (endpoint.responses.length === 0) {
    continue;
  }
  if (endpoint.responses[0].examples.length === 0) {
    continue;
  }

  const data = JSON.parse(endpoint.responses[0].examples[0].data);
  const url = endpoint.url.replace(/\{([^}]+)}/g, ":$1");

  endpoints.push({
    url,
    resultsKey: Array.isArray(data) ? null : findResultsKey(data),
    documentationUrl: endpoint.documentationUrl,
  });
}

function findResultsKey(data) {
  for (const [key, value] of Object.entries(data)) {
    if (Array.isArray(value)) {
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

writeFileSync(
  "./src/generated/paginating-endpoints.ts",
  prettier.format(
    `import { Endpoints } from "@octokit/types";

    export interface PaginatingEndpoints {
      ${sortEndpoints(endpoints).map(endpointToTypes).join("\n\n")}
    }`,
    {
      parser: "typescript",
    }
  )
);
