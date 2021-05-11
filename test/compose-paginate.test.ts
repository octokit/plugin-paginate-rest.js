import fetchMock from "fetch-mock";
import { Octokit } from "@octokit/core";

import { composePaginateRest } from "../src";

const ORG1 = { id: 1 };
const ORG2 = { id: 2 };

test("composePaginateRest(octokit, route)", async () => {
  const mock = fetchMock
    .sandbox()
    .get("https://api.github.com/orgs/octokit/repos?per_page=1", {
      body: [ORG1],
      headers: {
        link: '<https://pagination-test.com/orgs/octokit/repos?page=2&per_page=1>; rel="next"',
        "X-GitHub-Media-Type": "github.v3; format=json",
      },
    })
    .get("https://pagination-test.com/orgs/octokit/repos?page=2&per_page=1", {
      body: [ORG2],
      headers: {},
    });

  const octokit = new Octokit({
    request: {
      fetch: mock,
    },
  });

  const organizations = await composePaginateRest(
    octokit,
    "GET /orgs/{org}/repos",
    {
      org: "octokit",
      per_page: 1,
    }
  );
  expect(organizations.map((o) => o.id)).toStrictEqual([1, 2]);
});

test("composePaginateRest.iterator(octokit, route)", () => {
  const mock = fetchMock
    .sandbox()
    .getOnce("https://api.github.com/organizations", {
      body: [ORG1],
      headers: {
        link: '<https://pagination-test.com/organizations?since=2>; rel="next"',
        "X-GitHub-Media-Type": "github.v3; format=json",
      },
    })
    .getOnce("https://pagination-test.com/organizations?since=2", {
      body: [ORG2],
      headers: {},
    });

  const octokit = new Octokit({
    request: {
      fetch: mock,
    },
  });

  const iterator = composePaginateRest
    .iterator(octokit, "GET /organizations")
    [Symbol.asyncIterator]();

  return iterator
    .next()
    .then((result: any) => {
      expect(result.value.data[0].id).toEqual(1);

      return iterator.next();
    })
    .then((result: any) => {
      expect(result.value.data[0].id).toEqual(2);
    });
});
