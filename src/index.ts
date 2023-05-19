import type { Octokit } from "@octokit/core";

import { VERSION } from "./version";
import { paginate } from "./paginate";
import { iterator } from "./iterator";
import type { PaginateInterface } from "./types";

export type { PaginateInterface, PaginatingEndpoints } from "./types";
export { composePaginateRest } from "./compose-paginate";
export {
  isPaginatingEndpoint,
  paginatingEndpoints,
} from "./paginating-endpoints";

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
