import { describe, it, test, expect } from "vitest";
import fetchMock from "fetch-mock";
import { Octokit } from "@octokit/core";

import { paginateRest } from "../src/index.ts";

describe("https://github.com/octokit/plugin-paginate-rest.js/issues/158", () => {
  test("handle 204 response for `GET /repos/{owner}/{repo}/contributors` if repository is empty", async () => {
    const mock = fetchMock
      .createInstance()
      .get("https://api.github.com/repos/owner/empty-repo/contributors", {
        status: 204,
      });

    const TestOctokit = Octokit.plugin(paginateRest);
    const octokit = new TestOctokit({
      request: {
        fetch: mock.fetchHandler,
      },
    });

    const result = await octokit.paginate(
      "GET /repos/{owner}/{repo}/contributors",
      {
        owner: "owner",
        repo: "empty-repo",
      },
    );

    expect(result.length).toEqual(0);
  });

  test("handle 409 response for `GET /repos/{owner}/{repo}/commits` if repository is empty", async () => {
    const mock = fetchMock
      .createInstance()
      .get("https://api.github.com/repos/owner/empty-repo/commits", {
        status: 409,
        body: {
          message: "Git Repository is empty.",
          documentation_url:
            "https://docs.github.com/rest/reference/repos#list-commits",
        },
      });

    const TestOctokit = Octokit.plugin(paginateRest);
    const octokit = new TestOctokit({
      request: {
        fetch: mock.fetchHandler,
      },
    });

    const result = await octokit.paginate("GET /repos/{owner}/{repo}/commits", {
      owner: "owner",
      repo: "empty-repo",
    });

    expect(result.length).toEqual(0);
  });
});
