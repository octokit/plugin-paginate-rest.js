import fetchMock from "fetch-mock";
import { Octokit } from "@octokit/core";
import { restEndpointMethods } from "@octokit/plugin-rest-endpoint-methods";

import { paginateRest } from "../src";

describe("https://github.com/octokit/plugin-paginate-rest.js/issues/46", () => {
  it("octokit.paginate('GET /projects/columns/{column}/cards', { column })", async () => {
    const mock = fetchMock
      .sandbox()
      .get("https://api.github.com/projects/columns/123/cards", {
        body: [{ id: 123 }],
      });

    const TestOctokit = Octokit.plugin(paginateRest);
    const octokit = new TestOctokit({
      request: {
        fetch: mock,
      },
    });

    const result = await octokit.paginate(
      "GET /projects/columns/{column_id}/cards",
      {
        column_id: 123,
      }
    );

    expect(result[0].id).toEqual(123);
  });

  it("octokit.paginate(octokit.projects.listCards, { column })", async () => {
    const mock = fetchMock
      .sandbox()
      .get("https://api.github.com/projects/columns/123/cards", {
        body: [{ id: 123 }],
      });

    const TestOctokit = Octokit.plugin(paginateRest, restEndpointMethods);
    const octokit = new TestOctokit({
      request: {
        fetch: mock,
      },
    });

    const result = await octokit.paginate(octokit.rest.projects.listCards, {
      column_id: 123,
    });

    expect(result[0].id).toEqual(123);
  });
});

describe("https://github.com/octokit/plugin-paginate-rest.js/issues/158", () => {
  test("handle 204 response for `GET /repos/{owner}/{repo}/contributors` if repository is empty", async () => {
    const mock = fetchMock
      .sandbox()
      .get("https://api.github.com/repos/owner/empty-repo/contributors", {
        status: 204,
      });

    const TestOctokit = Octokit.plugin(paginateRest);
    const octokit = new TestOctokit({
      request: {
        fetch: mock,
      },
    });

    const result = await octokit.paginate(
      "GET /repos/{owner}/{repo}/contributors",
      {
        owner: "owner",
        repo: "empty-repo",
      }
    );

    expect(result.length).toEqual(0);
  });

  test("handle 409 response for `GET /repos/{owner}/{repo}/commits` if repository is empty", async () => {
    const mock = fetchMock
      .sandbox()
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
        fetch: mock,
      },
    });

    const result = await octokit.paginate("GET /repos/{owner}/{repo}/commits", {
      owner: "owner",
      repo: "empty-repo",
    });

    expect(result.length).toEqual(0);
  });
});
