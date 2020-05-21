import fetchMock from "fetch-mock";
import { Octokit } from "@octokit/core";
import { restEndpointMethods } from "@octokit/plugin-rest-endpoint-methods";

import { paginateRest } from "../src";

describe("https://github.com/octokit/plugin-paginate-rest.js/issues/46", () => {
  it("octokit.paginate('GET /projects/columns/:column/cards', { column })", async () => {
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
      "GET /projects/columns/:column_id/cards",
      {
        column_id: 123,
        mediaType: {
          previews: ["inertia"],
        },
      }
    );

    expect(result).toStrictEqual([{ id: 123 }]);
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

    const result = await octokit.paginate(octokit.projects.listCards, {
      column_id: 123,
    });

    expect(result).toStrictEqual([{ id: 123 }]);
  });
});
