/**
 * Some “list” response that can be paginated have a different response structure
 *
 * They have a `total_count` key in the response (search also has `incomplete_results`,
 * /installation/repositories also has `repository_selection`), as well as a key with
 * the list of the items which name varies from endpoint to endpoint.
 *
 * Octokit normalizes these responses so that paginated results are always returned following
 * the same structure. One challenge is that if the list response has only one page, no Link
 * header is provided, so this header alone is not sufficient to check wether a response is
 * paginated or not. For the exceptions with the namespace, a fallback check for the route
 * paths has to be added in order to normalize the response. We cannot check for the total_count
 * property because it also exists in the response of Get the combined status for a specific ref.
 */

import { Octokit } from "@octokit/core";

import { OctokitResponse } from "./types";

const REGEX = [
  // all search endpoints: https://developer.github.com/v3/search/
  /^\/search\//,

  // All list endpoints for check suites and check runs
  // - https://developer.github.com/v3/checks/runs/#list-check-runs-for-a-specific-ref
  // - https://developer.github.com/v3/checks/runs/#list-check-runs-in-a-check-suite
  // - https://developer.github.com/v3/checks/suites/#list-check-suites-for-a-specific-ref
  /^\/repos\/[^/]+\/[^/]+\/commits\/[^/]+\/(check-runs|check-suites)([^/]|$)/,

  // List installation repositories
  // - https://developer.github.com/v3/apps/installations/#list-repositories
  // - https://developer.github.com/v3/apps/installations/#list-installations-for-a-user
  // - https://developer.github.com/v3/apps/installations/#list-repositories-accessible-to-the-user-for-an-installation
  /^\/installation\/repositories$/,
  /^\/user\/installations([^/]|$)/,

  // - https://developer.github.com/v3/actions/secrets/#list-secrets-for-a-repository
  /^\/repos\/[^/]+\/[^/]+\/actions\/secrets$/,

  // - https://developer.github.com/v3/actions/workflows/#list-repository-workflows
  // - https://developer.github.com/v3/actions/workflow_runs/#list-workflow-runs
  /^\/repos\/[^/]+\/[^/]+\/actions\/workflows(\/[^/]+\/runs)?$/,

  // - https://developer.github.com/v3/actions/artifacts/#list-workflow-run-artifacts
  // - https://developer.github.com/v3/actions/workflow_jobs/#list-jobs-for-a-workflow-run
  /^\/repos\/[^/]+\/[^/]+\/actions\/runs(\/[^/]+\/(artifacts|jobs))?$/
];

export function normalizePaginatedListResponse(
  octokit: Octokit,
  url: string,
  response: OctokitResponse<any>
) {
  const path = url
    .replace(octokit.request.endpoint.DEFAULTS.baseUrl, "")
    .replace(/\?.*$/, "");
  const responseNeedsNormalization = REGEX.find(regex => regex.test(path));
  if (!responseNeedsNormalization) return;

  // keep the additional properties intact as there is currently no other way
  // to retrieve the same information.
  const incompleteResults = response.data.incomplete_results;
  const repositorySelection = response.data.repository_selection;
  const totalCount = response.data.total_count;
  delete response.data.incomplete_results;
  delete response.data.repository_selection;
  delete response.data.total_count;

  const namespaceKey = Object.keys(response.data)[0];
  const data = response.data[namespaceKey];
  response.data = data;

  if (typeof incompleteResults !== "undefined") {
    response.data.incomplete_results = incompleteResults;
  }

  if (typeof repositorySelection !== "undefined") {
    response.data.repository_selection = repositorySelection;
  }

  response.data.total_count = totalCount;
}
