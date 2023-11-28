import type { Octokit } from "@octokit/core";

import { VERSION } from "./version.js";
import { paginate } from "./paginate.js";
import { iterator } from "./iterator.js";
import type { PaginateInterface } from "./types.js";

export type { PaginateInterface, PaginatingEndpoints } from "./types.js";
export { composePaginateRest } from "./compose-paginate.js";
export {
  isPaginatingEndpoint,
  paginatingEndpoints,
} from "./paginating-endpoints.js";

/**
 * @param octokit Octokit instance
 * @param options Options passed to Octokit constructor
 */
export function paginateRest(octokit: Octokit) {
  return {
    paginate: Object.assign(paginate.bind(null, octokit), {
      iterator: iterator.bind(null, octokit),
    }) as PaginateInterface,
  };
}
paginateRest.VERSION = VERSION;
