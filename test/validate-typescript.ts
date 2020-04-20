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

export async function unknownRoute() {
  const results = await octokit.paginate<{ id: number }>("GET /unknown");
  for (const result of results) {
    console.log(result.id);
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
  const results = await octokit.paginate(
    octokit.issues.listLabelsForRepo,
    {
      owner: "owner",
      repo: "repo",
    },
    (response) =>
      response.data.map((data) => ({
        foo: {
          bar: data.id,
        },
      }))
  );
  for (const result of results) {
    console.log(result.foo.bar);
  }
}
