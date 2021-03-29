// This code is not exectude, only run with `tsc` to make sure the types are valid

import { Octokit } from "@octokit/core";
import { restEndpointMethods } from "@octokit/plugin-rest-endpoint-methods";

import { paginateRest, PaginatingEndpoints } from "../src";

const MyOctokit = Octokit.plugin(paginateRest, restEndpointMethods);
const octokit = new MyOctokit();

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
    }
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
    }
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
    (response) => response.data.map((repository) => repository.owner)
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
    }
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
    })
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
    "GET /unknown"
  )) {
    console.log(response.data[0].id);
  }
}

export async function knownRouteWithParametersIterator() {
  for await (const response of octokit.paginate.iterator(
    "GET /orgs/{org}/repos",
    {
      org: "yo",
    }
  )) {
    console.log(response.data[0].owner.login);
  }
}

export async function unknownRouteWithParametersIterator() {
  for await (const response of octokit.paginate.iterator<{ id: number }>(
    "GET /foo/bar/{baz}",
    {
      baz: "daz",
    }
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
    }
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
    "GET /installation/repositories"
  )) {
    console.log(response.data[0].owner.login);
  }
}

export async function requestMethodWithNamespacedResponse() {
  const results = await octokit.paginate(
    octokit.rest.apps.listReposAccessibleToInstallation
  );
  for (const result of results) {
    console.log(result.owner.login);
  }
}

export async function paginatingEndpointKeyProvidedByUser<
  R extends keyof PaginatingEndpoints
>(route: R) {
  console.log(await octokit.paginate(route));
}
