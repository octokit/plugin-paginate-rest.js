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

describe("https://github.com/octokit/plugin-paginate-rest.js/issues/647", () => {
  test("paginate compareCommits when link header is missing", async () => {
    const mock = fetchMock
      .createInstance()
      .get(
        "https://api.github.com/repos/owner/repo/compare/base...head?per_page=2",
        {
          body: {
            commits: [{ sha: "commit1" }, { sha: "commit2" }],
          },
          headers: {}, // omit link header
        },
      )
      .get(
        "https://api.github.com/repos/owner/repo/compare/base...head?per_page=2&page=2",
        {
          body: {
            commits: [{ sha: "commit3" }],
          },
          headers: {}, // omit link header  
        },
      );

    const TestOctokit = Octokit.plugin(paginateRest);
    const octokit = new TestOctokit({
      request: {
        fetch: mock.fetchHandler,
      },
    });

    const allCommits = await octokit.paginate(
      "GET /repos/{owner}/{repo}/compare/{basehead}",
      {
        owner: "owner",
        repo: "repo",
        basehead: "base...head",
        per_page: 2,
      },
    );

    // Should contain 3 commits despite missing link headers
    expect(allCommits).toHaveLength(3);
    expect(allCommits.map((c) => c.sha)).toEqual([
      "commit1",
      "commit2",
      "commit3",
    ]);
  });
});
