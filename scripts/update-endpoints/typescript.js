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

// All of these cases have been reported to the relevant team in GitHub.
const ENDPOINTS_WITH_UNDOCUMENTED_PER_PAGE_ATTRIBUTE = [
  { scope: 'users', id: 'list-blocked-by-authenticated-user' },
  { scope: 'orgs', id: 'list-blocked-users' },
  { scope: 'packages', id: 'list-packages-for-authenticated-user' },
  { scope: 'packages', id: 'list-packages-for-user' },
  { scope: 'packages', id: 'list-packages-for-organization' }
];

// Endpoints with a documented `per_page` query parameter that are, in fact,
// not paginated (or are paginated in an unusual way)
const ENDPOINTS_WITH_PER_PAGE_ATTRIBUTE_THAT_BEHAVE_DIFFERENTLY = [
  // Only the `files` key inside the commit is paginated. The rest is duplicated across
  // all pages. Handling this case properly requires custom code.
  { scope: 'repos', id: 'get-commit' },
  // The [docs](https://docs.github.com/en/rest/commits/commits#compare-two-commits) make
  // these ones sound like a special case too - they must be because they support pagination
  // but doesn't return an array.
  { scope: 'repos', id: 'compare-commits' },
  { scope: 'repos', id: 'compare-commits-with-basehead' }
]

const hasMatchingEndpoint = (list, id, scope) => list.some(endpoint => endpoint.id === id && endpoint.scope === scope);

const hasPerPageParameter = (endpoint) => {
  const parameterNames = endpoint.parameters.map(parameter => parameter.name);
  return parameterNames.includes("per_page");
}

const isPaginatedEndpoint = (endpoint) => {
  const { id, scope } = endpoint;

  return (hasPerPageParameter(endpoint) && !hasMatchingEndpoint(ENDPOINTS_WITH_PER_PAGE_ATTRIBUTE_THAT_BEHAVE_DIFFERENTLY, id, scope)) ||
    hasMatchingEndpoint(ENDPOINTS_WITH_UNDOCUMENTED_PER_PAGE_ATTRIBUTE, id, scope) ||
    // The "List public repos" API paginates with the `since` parameter, but otherwise
    // behaves normally in its use of the `Link` header.
    (endpoint.id === 'list-public' && endpoint.url === '/repositories')
}

for (const endpoint of ENDPOINTS) {
  if (!isPaginatedEndpoint(endpoint)) {
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
  const key = endpointToKey(endpoint);
  const response = endpoint.resultsKey
    ? `Endpoints[${key}]["response"] & { data: Endpoints[${key}]["response"]["data"]["${endpoint.resultsKey}"] }`
    : `Endpoints[${key}]["response"]`;

  return `
  /**
   * @see ${endpoint.documentationUrl}
   */
  ${key}: {
    parameters: Endpoints[${key}]["parameters"];
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
