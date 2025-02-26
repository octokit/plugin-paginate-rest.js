import type { Octokit } from "@octokit/core";

import { normalizePaginatedListResponse } from "./normalize-paginated-list-response.js";
import type {
  EndpointOptions,
  RequestInterface,
  RequestParameters,
  Route,
} from "./types.js";

export function iterator(
  octokit: Octokit,
  route: Route | RequestInterface,
  parameters?: RequestParameters,
) {
  const options =
    typeof route === "function"
      ? route.endpoint(parameters as EndpointOptions)
      : octokit.request.endpoint(route, parameters);
  const requestMethod = (
    typeof route === "function" ? route : octokit.request
  ) as RequestInterface;
  const method = options.method;
  const headers = options.headers;
  let url = options.url;

  return {
    [Symbol.asyncIterator]: () => ({
      async next() {
        if (!url) return { done: true };

        try {
          const response = await requestMethod({ method, url, headers });
          const normalizedResponse = normalizePaginatedListResponse(response);

          // `response.headers.link` format:
          // '<https://api.github.com/users/aseemk/followers?page=2>; rel="next", <https://api.github.com/users/aseemk/followers?page=2>; rel="last"'
          // sets `url` to undefined if "next" URL is not present or `link` header is not set
          url = ((normalizedResponse.headers.link || "").match(
            /<([^<>]+)>;\s*rel="next"/,
          ) || [])[1];

          return { value: normalizedResponse };
        } catch (error: any) {
          // `GET /repos/{owner}/{repo}/commits` throws a `409 Conflict` error for empty repositories
          // See https://github.com/github/rest-api-description/issues/385
          if (error.status !== 409) throw error;

          url = "";

          return {
            value: {
              status: 200,
              headers: {},
              data: [],
            },
          };
        }
      },
    }),
  } as AsyncIterable<any>;
}
