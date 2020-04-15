import { Octokit } from "@octokit/core";

import { iterator } from "./iterator";
import {
  MapFunction,
  PaginationResults,
  RequestParameters,
  Route,
  RequestInterface,
} from "./types";

export function paginate(
  octokit: Octokit,
  route: Route | RequestInterface,
  parameters?: RequestParameters,
  mapFn?: MapFunction
) {
  if (typeof parameters === "function") {
    mapFn = parameters;
    parameters = undefined;
  }

  return gather(
    octokit,
    [],
    iterator(octokit, route, parameters)[
      Symbol.asyncIterator
    ]() as AsyncIterableIterator<any>,
    mapFn
  );
}

function gather(
  octokit: Octokit,
  results: PaginationResults,
  iterator: AsyncIterableIterator<any>,
  mapFn?: MapFunction
): Promise<PaginationResults> {
  return iterator.next().then((result) => {
    if (result.done) {
      return results;
    }

    let earlyExit = false;
    function done() {
      earlyExit = true;
    }

    results = results.concat(
      mapFn ? mapFn(result.value, done) : result.value.data
    );

    if (earlyExit) {
      return results;
    }

    return gather(octokit, results, iterator, mapFn);
  });
}
