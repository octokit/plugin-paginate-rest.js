// This code is not exectude, only run with `tsc` to make sure the types are valid

import { Octokit } from "@octokit/core";
import { restEndpointMethods } from "@octokit/plugin-rest-endpoint-methods";

import { paginateRest } from "../src";

const MyOctokit = Octokit.plugin(paginateRest, restEndpointMethods);
const octokit = new MyOctokit();

export async function knownRoute() {
  const results = await octokit.paginate("GET /repositories");
  for (const result of results) {
    console.log(result.owner.login);
  }
}

export async function knownRouteWithParameters() {
  const results = await octokit.paginate("GET /orgs/:org/repos", {
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
    { per_page: 1 },
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

export async function unknownRouteWitParameters() {
  const results = await octokit.paginate<{ foo: { bar: number } }>(
    "GET /foo/bar/:baz",
    {
      baz: "daz",
    }
  );
  for (const result of results) {
    console.log(result.foo.bar);
  }
}

export async function requestMethod() {
  const results = await octokit.paginate(octokit.repos.listPublic);
  for (const result of results) {
    console.log(result.owner.login);
  }
}

export async function requestMethodAndMapFunction() {
  const results = await octokit.paginate(octokit.repos.listPublic, (response) =>
    response.data.map((repository) => repository.owner)
  );
  for (const result of results) {
    console.log(result.login);
  }
}

export async function requestMethodWithParameters() {
  const results = await octokit.paginate(octokit.issues.listLabelsForRepo, {
    owner: "owner",
    repo: "repo",
  });
  for (const result of results) {
    console.log(result.id);
  }
}

export async function requestMethodWithParametersAndMapFunction() {
  const results = await octokit.paginate(octokit.orgs.list, (response) =>
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
