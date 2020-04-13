import { Octokit } from "@octokit/core";

import { normalizePaginatedListResponse } from "./normalize-paginated-list-response";
import { OctokitResponse, RequestParameters, Route } from "./types";

export function iterator(
  octokit: Octokit,
  route: Route,
  parameters?: RequestParameters
) {
  const options = octokit.request.endpoint(route, parameters);
  const method = options.method;
  const headers = options.headers;
  let url = options.url;

  return {
    [Symbol.asyncIterator]: () => ({
      next() {
        if (!url) {
          return Promise.resolve({ done: true });
        }

        return octokit
          .request({ method, url, headers })

          .then(normalizePaginatedListResponse)

          .then((response: OctokitResponse<any>) => {
            // `response.headers.link` format:
            // '<https://api.github.com/users/aseemk/followers?page=2>; rel="next", <https://api.github.com/users/aseemk/followers?page=2>; rel="last"'
            // sets `url` to undefined if "next" URL is not present or `link` header is not set
            url = ((response.headers.link || "").match(
              /<([^>]+)>;\s*rel="next"/
            ) || [])[1];

            return { value: response };
          });
      },
    }),
  };
}
