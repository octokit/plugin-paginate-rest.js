import { VERSION } from "./version";

import { paginate } from "./paginate";
import { iterator } from "./iterator";
import { PaginateInterface } from "./types";
export { PaginateInterface } from "./types";

import type { Octokit } from "@octokit/core";

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
