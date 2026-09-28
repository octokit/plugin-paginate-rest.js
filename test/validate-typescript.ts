// This code is not exectude, only run with `tsc` to make sure the types are valid

import { Octokit } from "@octokit/core";
import { restEndpointMethods } from "@octokit/plugin-rest-endpoint-methods";

import {
  paginateRest,
  composePaginateRest,
  PaginatingEndpoints,
} from "../src/index.ts";

const MyOctokit = Octokit.plugin(paginateRest, restEndpointMethods);
const octokit = new MyOctokit();

/**
 * Asserts that `Actual` and `Expected` are the exact same type. Unlike a
 * property access assertion this also fails when a return type collapses to
 * `unknown` or widens to `any`, so it detects inference regressions.
 */
function expectExactType<Expected, Actual>(
  ..._assert: Actual extends Expected
    ? Expected extends Actual
      ? []
      : ["types are not identical"]
    : ["types are not identical"]
) {
  /* type-level assertion only */
}

export async function knownRoute() {
  const results = await octokit.paginate("GET /repositories");
  for (const result of results) {
    console.log(result.owner.login);
  }
}

export async function knownRouteWithParameters() {
  const results = await octokit.paginate("GET /orgs/{org}/repos", {
    org: "octorg",
  });
  for (const result of results) {
    console.log(result.owner.login);
  }
}

export async function knownRouteWithMapFunction() {
  const results = await octokit.paginate("GET /repositories", (response) => {
    return response.data.map((repository) => {
      return {
        foo: {
          bar: repository.id,
        },
      };
    });
  });
  for (const result of results) {
    console.log(result.foo.bar);
  }
}
export async function knownRouteWithParametersAndMapFunction() {
  const results = await octokit.paginate(
    "GET /organizations",
    { since: 123 },
    (response, done) => {
      done();
      return response.data.map((org) => {
        return {
          foo: {
            bar: org.id,
          },
        };
      });
    },
  );
  for (const result of results) {
    console.log(result.foo.bar);
  }
}

export async function unknownRouteWithResultType() {
  const results = await octokit.paginate<{ id: number }>("GET /unknown");
  for (const result of results) {
    console.log(result.id);
  }
}

export async function unknownRouteWithParameters() {
  const results = await octokit.paginate<{ foo: { bar: number } }>(
    "GET /foo/bar/{baz}",
    {
      baz: "daz",
    },
  );
  for (const result of results) {
    console.log(result.foo.bar);
  }
}

export async function requestMethod() {
  const results = await octokit.paginate(octokit.rest.repos.listPublic);
  for (const result of results) {
    console.log(result.owner.login);
  }
}

export async function requestMethodAndMapFunction() {
  const results = await octokit.paginate(
    octokit.rest.repos.listPublic,
    (response) => response.data.map((repository) => repository.owner),
  );
  for (const result of results) {
    console.log(result.login);
  }
}

export async function requestMethodWithParameters() {
  const results = await octokit.paginate(
    octokit.rest.issues.listLabelsForRepo,
    {
      owner: "owner",
      repo: "repo",
    },
  );
  for (const result of results) {
    console.log(result.id);
  }
}

export async function requestMethodWithParametersAndMapFunction() {
  const results = await octokit.paginate(octokit.rest.orgs.list, (response) =>
    response.data.map((org) => {
      return {
        foo: {
          bar: org.id,
        },
      };
    }),
  );
  for (const result of results) {
    console.log(result.foo);
  }
}

export async function knownRouteIterator() {
  for await (const response of octokit.paginate.iterator("GET /repositories")) {
    console.log(response.data[0].owner.login);
  }
}

export async function unknownRouteIterator() {
  for await (const response of octokit.paginate.iterator<{ id: number }>(
    "GET /unknown",
  )) {
    console.log(response.data[0].id);
  }
}

export async function knownRouteWithParametersIterator() {
  for await (const response of octokit.paginate.iterator(
    "GET /orgs/{org}/repos",
    {
      org: "yo",
    },
  )) {
    console.log(response.data[0].owner.login);
  }
}

export async function unknownRouteWithParametersIterator() {
  for await (const response of octokit.paginate.iterator<{ id: number }>(
    "GET /foo/bar/{baz}",
    {
      baz: "daz",
    },
  )) {
    console.log(response.data[0].id);
  }
}

export async function requestMethodWithParametersIterator() {
  for await (const response of octokit.paginate.iterator(
    octokit.rest.issues.listLabelsForRepo,
    {
      owner: "owner",
      repo: "repo",
    },
  )) {
    console.log(response.data[0].id);
  }
}

// https://developer.github.com/v3/apps/installations/#list-repositories
export async function knownRouteWithNamespacedResponse() {
  const results = await octokit.paginate("GET /installation/repositories");
  for (const result of results) {
    console.log(result.owner.login);
  }
}

export async function knownRouteWithNamespacedResponseIterator() {
  for await (const response of octokit.paginate.iterator(
    "GET /installation/repositories",
  )) {
    console.log(response.data[0].owner.login);
  }
}

export async function requestMethodWithNamespacedResponse() {
  const results = await octokit.paginate(
    octokit.rest.apps.listReposAccessibleToInstallation,
  );
  for (const result of results) {
    console.log(result.owner.login);
  }
}

// https://github.com/octokit/plugin-paginate-rest.js/issues/661
// Ensure the endpoints that return an array don't have an extra `OctokitResponse` in the data
type Package =
  PaginatingEndpoints["GET /orgs/{org}/packages/{package_type}/{package_name}/versions"]["response"]["data"][0];
export async function requestWithArrayResponse() {
  const results = await octokit.paginate(
    "GET /orgs/{org}/packages/{package_type}/{package_name}/versions",
  );
  for (const result of results) {
    const pkg: Package = result;
    console.log(pkg.name);
  }
}

export async function paginatingEndpointKeyProvidedByUser<
  R extends keyof PaginatingEndpoints,
>(route: R) {
  console.log(await octokit.paginate(route));
}

/* -------------------------------------------------------------------------
 * Overload coverage
 *
 * Every call signature of `PaginateInterface` and `ComposePaginateInterface`
 * is exercised below. Deleting or reordering an overload in `src/types.ts`
 * must break this file, which is what makes the "is this overload still
 * needed?" question answerable instead of guesswork.
 * ---------------------------------------------------------------------- */

type Repository =
  PaginatingEndpoints["GET /repositories"]["response"]["data"][0];
type Label =
  PaginatingEndpoints["GET /repos/{owner}/{repo}/issues/{issue_number}/labels"]["response"]["data"][0];

// -- 1. endpoint options -------------------------------------------------

export async function paginateOptions() {
  const results = await octokit.paginate<Repository>({
    method: "GET",
    url: "/repositories",
  });
  expectExactType<Repository[], typeof results>();
  for (const result of results) {
    console.log(result.owner.login);
  }
}

export async function paginateOptionsWithMapFunction() {
  const results = await octokit.paginate<Repository, { name: string }>(
    { method: "GET", url: "/repositories" },
    (response) =>
      response.data.map((repository) => ({ name: repository.name })),
  );
  expectExactType<{ name: string }[], typeof results>();
  for (const result of results) {
    console.log(result.name);
  }
}

export async function composePaginateOptions() {
  const results = await composePaginateRest<Repository>(octokit, {
    method: "GET",
    url: "/repositories",
  });
  expectExactType<Repository[], typeof results>();
  for (const result of results) {
    console.log(result.owner.login);
  }
}

export async function composePaginateOptionsWithMapFunction() {
  const results = await composePaginateRest<Repository, { name: string }>(
    octokit,
    { method: "GET", url: "/repositories" },
    (response) =>
      response.data.map((repository) => ({ name: repository.name })),
  );
  expectExactType<{ name: string }[], typeof results>();
  for (const result of results) {
    console.log(result.name);
  }
}

export async function composePaginateOptionsIterator() {
  for await (const response of composePaginateRest.iterator<Repository>(
    octokit,
    { method: "GET", url: "/repositories" },
  )) {
    console.log(response.data[0].owner.login);
  }
}

// -- 2. known route string ----------------------------------------------

export async function composePaginateKnownRoute() {
  const results = await composePaginateRest(octokit, "GET /repositories");
  expectExactType<Repository[], typeof results>();
  for (const result of results) {
    console.log(result.owner.login);
  }
}

export async function composePaginateKnownRouteWithParameters() {
  const results = await composePaginateRest(octokit, "GET /orgs/{org}/repos", {
    org: "octorg",
  });
  for (const result of results) {
    console.log(result.owner.login);
  }
}

export async function composePaginateKnownRouteWithMapFunction() {
  const results = await composePaginateRest(
    octokit,
    "GET /repositories",
    (response) =>
      response.data.map((repository) => ({ foo: { bar: repository.id } })),
  );
  expectExactType<{ foo: { bar: number | bigint } }[], typeof results>();
  for (const result of results) {
    console.log(result.foo.bar);
  }
}

export async function composePaginateKnownRouteWithParametersAndMapFunction() {
  const results = await composePaginateRest(
    octokit,
    "GET /organizations",
    { since: 123 },
    (response, done) => {
      done();
      return response.data.map((org) => ({ foo: { bar: org.id } }));
    },
  );
  expectExactType<{ foo: { bar: number } }[], typeof results>();
  for (const result of results) {
    console.log(result.foo.bar);
  }
}

export async function composePaginateKnownRouteIterator() {
  for await (const response of composePaginateRest.iterator(
    octokit,
    "GET /repositories",
  )) {
    console.log(response.data[0].owner.login);
  }
}

export async function composePaginateKnownRouteWithParametersIterator() {
  for await (const response of composePaginateRest.iterator(
    octokit,
    "GET /orgs/{org}/repos",
    { org: "yo" },
  )) {
    console.log(response.data[0].owner.login);
  }
}

// -- 3. unknown route string ---------------------------------------------

export async function composePaginateUnknownRouteWithResultType() {
  const results = await composePaginateRest<{ id: number }>(
    octokit,
    "GET /unknown",
  );
  expectExactType<{ id: number }[], typeof results>();
  for (const result of results) {
    console.log(result.id);
  }
}

export async function composePaginateUnknownRouteWithParameters() {
  const results = await composePaginateRest<{ foo: { bar: number } }>(
    octokit,
    "GET /foo/bar/{baz}",
    { baz: "daz" },
  );
  for (const result of results) {
    console.log(result.foo.bar);
  }
}

export async function composePaginateUnknownRouteIterator() {
  for await (const response of composePaginateRest.iterator<{ id: number }>(
    octokit,
    "GET /unknown",
  )) {
    console.log(response.data[0].id);
  }
}

export async function composePaginateUnknownRouteWithParametersIterator() {
  for await (const response of composePaginateRest.iterator<{ id: number }>(
    octokit,
    "GET /foo/bar/{baz}",
    { baz: "daz" },
  )) {
    console.log(response.data[0].id);
  }
}

// -- 4. request method ---------------------------------------------------

export async function composePaginateRequestMethod() {
  const results = await composePaginateRest(
    octokit,
    octokit.rest.repos.listPublic,
  );
  expectExactType<Repository[], typeof results>();
  for (const result of results) {
    console.log(result.owner.login);
  }
}

export async function composePaginateRequestMethodAndMapFunction() {
  const results = await composePaginateRest(
    octokit,
    octokit.rest.repos.listPublic,
    (response) => response.data.map((repository) => repository.owner),
  );
  for (const result of results) {
    console.log(result.login);
  }
}

export async function composePaginateRequestMethodWithParameters() {
  const results = await composePaginateRest(
    octokit,
    octokit.rest.issues.listLabelsForRepo,
    { owner: "owner", repo: "repo" },
  );
  expectExactType<Label[], typeof results>();
  for (const result of results) {
    console.log(result.id);
  }
}

export async function composePaginateRequestMethodWithParametersAndMapFunction() {
  const results = await composePaginateRest(
    octokit,
    octokit.rest.orgs.list,
    { since: 123 },
    (response) => response.data.map((org) => ({ foo: { bar: org.id } })),
  );
  for (const result of results) {
    console.log(result.foo.bar);
  }
}

// NOTE: `requestMethodWithParametersAndMapFunction` above is misnamed upstream
// and only passes two arguments. This one covers the real three-argument form.
export async function requestMethodParametersAndMapFunction() {
  const results = await octokit.paginate(
    octokit.rest.orgs.list,
    { since: 123 },
    (response) => response.data.map((org) => ({ foo: { bar: org.id } })),
  );
  for (const result of results) {
    console.log(result.foo.bar);
  }
}

export async function paginateOptionsIterator() {
  for await (const response of octokit.paginate.iterator<Repository>({
    method: "GET",
    url: "/repositories",
  })) {
    console.log(response.data[0].owner.login);
  }
}

export async function composePaginateRequestMethodWithParametersIterator() {
  for await (const response of composePaginateRest.iterator(
    octokit,
    octokit.rest.issues.listLabelsForRepo,
    { owner: "owner", repo: "repo" },
  )) {
    console.log(response.data[0].id);
  }
}

export async function composePaginateRequestMethodIterator() {
  for await (const response of composePaginateRest.iterator(
    octokit,
    octokit.rest.repos.listPublic,
  )) {
    console.log(response.data[0].owner.login);
  }
}

// -- 5. namespaced / array responses -------------------------------------

export async function composePaginateKnownRouteWithNamespacedResponse() {
  const results = await composePaginateRest(
    octokit,
    "GET /installation/repositories",
  );
  for (const result of results) {
    console.log(result.owner.login);
  }
}

export async function composePaginateKnownRouteWithNamespacedResponseIterator() {
  for await (const response of composePaginateRest.iterator(
    octokit,
    "GET /installation/repositories",
  )) {
    console.log(response.data[0].owner.login);
  }
}

export async function composePaginateRequestMethodWithNamespacedResponse() {
  const results = await composePaginateRest(
    octokit,
    octokit.rest.apps.listReposAccessibleToInstallation,
  );
  for (const result of results) {
    console.log(result.owner.login);
  }
}

// -- 6. route key provided by the user -----------------------------------

export async function composePaginatingEndpointKeyProvidedByUser<
  R extends keyof PaginatingEndpoints,
>(route: R) {
  console.log(await composePaginateRest(octokit, route));
}

export async function composePaginatingEndpointKeyWithParametersProvidedByUser<
  R extends keyof PaginatingEndpoints,
>(route: R, parameters: PaginatingEndpoints[R]["parameters"]) {
  console.log(await composePaginateRest(octokit, route, parameters));
}

export async function paginatingEndpointKeyWithParametersProvidedByUser<
  R extends keyof PaginatingEndpoints,
>(route: R, parameters: PaginatingEndpoints[R]["parameters"]) {
  console.log(await octokit.paginate(route, parameters));
}

export async function requestMethodIteratorWithoutParameters() {
  for await (const response of octokit.paginate.iterator(
    octokit.rest.repos.listPublic,
  )) {
    console.log(response.data[0].owner.login);
  }
}
