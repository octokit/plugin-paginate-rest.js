import fetchMock from "fetch-mock";
import { Octokit } from "@octokit/core";
import { restEndpointMethods } from "@octokit/plugin-rest-endpoint-methods";

import { paginateRest } from "../src";

const ORG1 = { id: 1 };
const ORG2 = { id: 2 };

const TestOctokit = Octokit.plugin(paginateRest, restEndpointMethods);
describe("pagination", () => {
  it(".paginate()", async () => {
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

    const octokit = new TestOctokit({
      request: {
        fetch: mock,
      },
    });

    const organizations = await octokit.paginate("GET /orgs/{org}/repos", {
      org: "octokit",
      per_page: 1,
    });
    expect(organizations.map((o) => o.id)).toStrictEqual([1, 2]);

    await octokit
      .paginate(
        "GET /orgs/{org}/repos",
        { org: "octokit", per_page: 1 },
        (response: any) => response.data.map((org: any) => org.id)
      )
      .then((organizations: any) => {
        expect(organizations).toStrictEqual([1, 2]);
      });
    await octokit
      .paginate<typeof ORG1, number>(
        {
          method: "GET",
          url: "/orgs/{org}/repos",
          org: "octokit",
          per_page: 1,
        },
        (response) => response.data.map((org) => org.id)
      )
      .then((organizations) => {
        expect(organizations).toStrictEqual([1, 2]);
      });
  });

  it(".paginate(request)", async () => {
    const mock = fetchMock
      .sandbox()
      .getOnce("https://api.github.com/organizations", {
        body: [ORG1],
        headers: {
          link: '<https://pagination-test.com/orgs/octokit/repos?page=2>; rel="next"',
          "X-GitHub-Media-Type": "github.v3; format=json",
        },
      })
      .getOnce("https://pagination-test.com/orgs/octokit/repos?page=2", {
        body: [ORG2],
        headers: {},
      });

    const octokit = new TestOctokit({
      request: {
        fetch: mock,
      },
    });

    const organizations = await octokit.paginate(octokit.rest.orgs.list);
    expect(organizations.map((o) => o.id)).toStrictEqual([1, 2]);
  });

  it(".paginate(request, options)", async () => {
    const mock = fetchMock
      .sandbox()
      .getOnce("https://api.github.com/orgs/octokit/repos?per_page=1", {
        body: [ORG1],
        headers: {
          link: '<https://pagination-test.com/orgs/octokit/repos?page=2&per_page=1>; rel="next"',
          "X-GitHub-Media-Type": "github.v3; format=json",
        },
      })
      .getOnce(
        "https://pagination-test.com/orgs/octokit/repos?page=2&per_page=1",
        {
          body: [ORG2],
          headers: {},
        }
      );

    const octokit = new TestOctokit({
      request: {
        fetch: mock,
      },
    });

    const organizations = await octokit.paginate(
      octokit.rest.repos.listForOrg,
      {
        org: "octokit",
        per_page: 1,
      }
    );
    expect(organizations.map((o) => o.id)).toStrictEqual([1, 2]);
  });

  it(".paginate(request, options, mapFunction)", async () => {
    const mock = fetchMock
      .sandbox()
      .getOnce("https://api.github.com/orgs/octokit/repos?per_page=1", {
        body: [ORG1],
        headers: {
          link: '<https://pagination-test.com/orgs/octokit/repos?page=2&per_page=1>; rel="next"',
          "X-GitHub-Media-Type": "github.v3; format=json",
        },
      })
      .getOnce(
        "https://pagination-test.com/orgs/octokit/repos?page=2&per_page=1",
        {
          body: [ORG2],
          headers: {},
        }
      );

    const octokit = new TestOctokit({
      request: {
        fetch: mock,
      },
    });

    const organizations = await octokit.paginate(
      octokit.rest.repos.listForOrg,
      {
        org: "octokit",
        per_page: 1,
      },
      (response) => response.data.map((org) => org.id)
    );
    expect(organizations).toStrictEqual([1, 2]);
  });

  it(".paginate() with map function returning undefined", () => {
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

    const octokit = new TestOctokit({
      request: {
        fetch: mock,
      },
    });

    return octokit
      .paginate(
        "GET /orgs/{org}/repos",
        { org: "octokit", per_page: 1 },
        () => [undefined]
      )
      .then((results) => {
        expect(results).toStrictEqual([undefined, undefined]);
      });
  });

  it(".paginate() with early exit", () => {
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

    const octokit = new TestOctokit({
      request: {
        fetch: mock,
      },
    });

    return octokit
      .paginate(
        "GET /orgs/{org}/repos",
        { org: "octokit", per_page: 1 },
        (response, done) => {
          done();
          return response.data.map((org) => org.id);
        }
      )
      .then((organizations) => {
        expect(organizations).toStrictEqual([1]);
      });
  });

  it(".paginate() with Link header pointing to different path", () => {
    const mock = fetchMock
      .sandbox()
      .get("https://api.github.com/orgs/octokit/repos?per_page=1", {
        body: [{ id: 1 }],
        headers: {
          link: '<https://pagination-test.com/foobar?page=2&per_page=1>; rel="next"',
          "X-GitHub-Media-Type": "github.v3; format=json",
        },
      })
      .get("https://pagination-test.com/foobar?page=2&per_page=1", {
        body: [{ id: 2 }],
        headers: {},
      });

    const octokit = new TestOctokit({
      request: {
        fetch: mock,
      },
    });

    return octokit
      .paginate("GET /orgs/{org}/repos", { org: "octokit", per_page: 1 })
      .then((repos) => {
        expect(repos.map((o) => o.id)).toStrictEqual([1, 2]);
      });
  });

  it("autopagination", () => {
    const mock = fetchMock
      .sandbox()
      .get("https://api.github.com/orgs/octokit/repos?per_page=1", {
        body: [{ id: 1 }],
        headers: {
          link: '<https://pagination-test.com/orgs/octokit/repos?page=2&per_page=1>; rel="next"',
          "X-GitHub-Media-Type": "github.v3; format=json",
        },
      })
      .get("https://pagination-test.com/orgs/octokit/repos?page=2&per_page=1", {
        body: [{ id: 2 }],
        headers: {},
      });

    const octokit = new TestOctokit({
      request: {
        fetch: mock,
      },
    });

    // @ts-expect-error we change the form of the response object. We probably shouldn't do that :)
    octokit.hook.wrap("request", (request, options) => {
      if (!options.request.paginate) {
        return request(options);
      }

      delete options.request.paginate;
      return octokit.paginate(options);
    });

    return octokit
      .request("GET /orgs/{org}/repos", {
        org: "octokit",
        per_page: 1,
        request: { paginate: true },
      })
      .then((organizations) => {
        // @ts-ignore
        expect(organizations).toStrictEqual([{ id: 1 }, { id: 2 }]);
      });
  });

  it(".paginate.iterator for endpoints that don’t paginate", () => {
    const mock = fetchMock.sandbox().get("https://api.github.com/orgs/myorg", {
      body: ORG1,
    });

    const octokit = new TestOctokit({
      request: {
        fetch: mock,
      },
    });

    const iterator = octokit.paginate
      .iterator({
        method: "GET",
        url: "/orgs/{org}",
        org: "myorg",
      })
      [Symbol.asyncIterator]();

    return iterator.next().then((result) => {
      expect(result.value.data).toStrictEqual(ORG1);
    });
  });

  it("paginate.iterator(route)", () => {
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

    const octokit = new TestOctokit({
      request: {
        fetch: mock,
      },
    });

    const iterator = octokit.paginate
      .iterator("GET /organizations")
      [Symbol.asyncIterator]();

    return iterator
      .next()
      .then((result) => {
        expect(result.value.data[0].id).toEqual(1);

        return iterator.next();
      })
      .then((result) => {
        expect(result.value.data[0].id).toEqual(2);
      });
  });

  it("paginate.iterator(route, parameters)", () => {
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

    const octokit = new TestOctokit({
      request: {
        fetch: mock,
      },
    });

    const iterator = octokit.paginate
      .iterator("GET /orgs/{org}/repos", {
        org: "octokit",
        per_page: 1,
      })
      [Symbol.asyncIterator]();

    return iterator
      .next()
      .then((result) => {
        expect(result.value.data[0].id).toEqual(1);

        return iterator.next();
      })
      .then((result) => {
        expect(result.value.data[0].id).toEqual(2);
      });
  });

  it("paginate.iterator(options)", () => {
    const mock = fetchMock
      .sandbox()
      .getOnce("https://api.github.com/organizations", {
        body: [ORG1],
        headers: {
          link: '<https://pagination-test.com/orgs/octokit/repos?page=2>; rel="next"',
          "X-GitHub-Media-Type": "github.v3; format=json",
        },
      })
      .getOnce("https://pagination-test.com/orgs/octokit/repos?page=2", {
        body: [ORG2],
        headers: {},
      });

    const octokit = new TestOctokit({
      request: {
        fetch: mock,
      },
    });

    const iterator = octokit.paginate
      .iterator({
        method: "GET",
        url: "/organizations",
      })
      [Symbol.asyncIterator]();

    return iterator
      .next()
      .then((result) => {
        expect(result.value.data[0].id).toEqual(1);

        return iterator.next();
      })
      .then((result) => {
        expect(result.value.data[0].id).toEqual(2);
      });
  });

  it("paginate.iterator(request)", () => {
    const mock = fetchMock
      .sandbox()
      .getOnce("https://api.github.com/organizations", {
        body: [ORG1],
        headers: {
          link: '<https://pagination-test.com/orgs/octokit/repos?page=2>; rel="next"',
          "X-GitHub-Media-Type": "github.v3; format=json",
        },
      })
      .getOnce("https://pagination-test.com/orgs/octokit/repos?page=2", {
        body: [ORG2],
        headers: {},
      });

    const octokit = new TestOctokit({
      request: {
        fetch: mock,
      },
    });

    const iterator = octokit.paginate
      .iterator(octokit.rest.orgs.list)
      [Symbol.asyncIterator]();

    return iterator
      .next()
      .then((result) => {
        expect(result.value.data[0].id).toEqual(1);

        return iterator.next();
      })
      .then((result) => {
        expect(result.value.data[0].id).toEqual(2);
      });
  });

  it(".paginate() with results namespace (search)", () => {
    const result1 = {
      total_count: 2,
      incomplete_results: false,
      items: [
        {
          id: "123",
        },
      ],
    };
    const result2 = {
      total_count: 2,
      incomplete_results: false,
      items: [
        {
          id: "456",
        },
      ],
    };

    const query = encodeURIComponent(
      "repo:web-platform-tests/wpt is:pr is:open updated:>2019-02-26"
    );
    const mock = fetchMock
      .sandbox()
      .get(`https://api.github.com/search/issues?q=${query}&per_page=1`, {
        body: result1,
        headers: {
          link: `<https://api.github.com/search/issues?q=${query}&per_page=1&page=2>; rel="next"`,
          "X-GitHub-Media-Type": "github.v3; format=json",
        },
      })
      .get(
        `https://api.github.com/search/issues?q=${query}&per_page=1&page=2`,
        {
          body: result2,
          headers: {
            link: `<https://api.github.com/search/issues?q=${query}&per_page=1&page=1>; rel="prev", <https://api.github.com/search/issues?q=${query}&per_page=1&page=1>; rel="first"`,
            "X-GitHub-Media-Type": "github.v3; format=json",
          },
        }
      );

    const octokit = new TestOctokit({
      request: {
        fetch: mock,
      },
    });

    return octokit
      .paginate({
        method: "GET",
        url: "/search/issues",
        q: "repo:web-platform-tests/wpt is:pr is:open updated:>2019-02-26",
        per_page: 1,
        headers: {
          "accept-encoding": "",
        },
      })
      .then((results) => {
        expect(results).toStrictEqual([...result1.items, ...result2.items]);
      });
  });

  it(".paginate() with results namespace (GET /installation/repositories)", () => {
    const result1 = {
      total_count: 2,
      repositories: [
        {
          id: "123",
        },
      ],
    };
    const result2 = {
      total_count: 2,
      repository_selection: "all",
      repositories: [
        {
          id: "456",
        },
      ],
    };

    const mock = fetchMock
      .sandbox()
      .get(`https://api.github.com/installation/repositories?per_page=1`, {
        body: result1,
        headers: {
          link: `<https://api.github.com/installation/repositories?per_page=1&page=2>; rel="next"`,
          "X-GitHub-Media-Type": "github.v3; format=json",
        },
      })
      .get(
        `https://api.github.com/installation/repositories?per_page=1&page=2`,
        {
          body: result2,
          headers: {
            link: `<https://api.github.com/installation/repositories?per_page=1>; rel="prev", <https://api.github.com/installation/repositories?per_page=1>; rel="first"`,
            "X-GitHub-Media-Type": "github.v3; format=json",
          },
        }
      );

    const octokit = new TestOctokit({
      request: {
        fetch: mock,
      },
    });

    return octokit
      .paginate({
        method: "GET",
        url: "/installation/repositories",
        per_page: 1,
      })
      .then((results) => {
        expect(results).toStrictEqual([
          ...result1.repositories,
          ...result2.repositories,
        ]);
      });
  });

  it(".paginate() with results namespace (GET /user/installations)", () => {
    const result1 = {
      total_count: 2,
      repositories: [
        {
          id: "123",
        },
      ],
    };
    const result2 = {
      total_count: 2,
      repository_selection: "all",
      repositories: [
        {
          id: "456",
        },
      ],
    };

    const mock = fetchMock
      .sandbox()
      .get(`https://api.github.com/user/installations?per_page=1`, {
        body: result1,
        headers: {
          link: `<https://api.github.com/user/installations?per_page=1&page=2>; rel="next"`,
          "X-GitHub-Media-Type": "github.v3; format=json",
        },
      })
      .get(`https://api.github.com/user/installations?per_page=1&page=2`, {
        body: result2,
        headers: {
          link: `<https://api.github.com/user/installations?per_page=1>; rel="prev", <https://api.github.com/user/installations?per_page=1>; rel="first"`,
          "X-GitHub-Media-Type": "github.v3; format=json",
        },
      });

    const octokit = new TestOctokit({
      request: {
        fetch: mock,
      },
    });

    return octokit
      .paginate({
        method: "GET",
        url: "/user/installations",
        per_page: 1,
      })
      .then((results) => {
        expect(results).toStrictEqual([
          ...result1.repositories,
          ...result2.repositories,
        ]);
      });
  });

  it(".paginate() with results namespace (GET /repos/{owner}/{repo}/actions/runs/{run_id}/artifacts)", () => {
    const result1 = {
      total_count: 2,
      artifacts: [
        {
          id: "123",
        },
      ],
    };
    const result2 = {
      total_count: 2,
      repository_selection: "all",
      artifacts: [
        {
          id: "456",
        },
      ],
    };

    const mock = fetchMock
      .sandbox()
      .get(
        `https://api.github.com/repos/octocat/hello-world/actions/runs/123/artifacts?per_page=1`,
        {
          body: result1,
          headers: {
            link: `<https://api.github.com/repos/octocat/hello-world/actions/runs/123/artifacts?per_page=1&page=2>; rel="next"`,
            "X-GitHub-Media-Type": "github.v3; format=json",
          },
        }
      )
      .get(
        `https://api.github.com/repos/octocat/hello-world/actions/runs/123/artifacts?per_page=1&page=2`,
        {
          body: result2,
          headers: {
            link: `<https://api.github.com/repos/octocat/hello-world/actions/runs/123/artifacts?per_page=1>; rel="prev", <https://api.github.com/repos/octocat/hello-world/actions/runs/123/artifacts?per_page=1>; rel="first"`,
            "X-GitHub-Media-Type": "github.v3; format=json",
          },
        }
      );

    const octokit = new TestOctokit({
      request: {
        fetch: mock,
      },
    });

    return octokit
      .paginate({
        method: "GET",
        url: "/repos/{owner}/{repo}/actions/runs/{run_id}/artifacts",
        owner: "octocat",
        repo: "hello-world",
        run_id: 123,
        per_page: 1,
      })
      .then((results) => {
        expect(results).toStrictEqual([
          ...result1.artifacts,
          ...result2.artifacts,
        ]);
      });
  });

  it(".paginate() with results namespace (GET /repos/{owner}/{repo}/actions/secrets)", () => {
    const result1 = {
      total_count: 2,
      secrets: [
        {
          id: "123",
        },
      ],
    };
    const result2 = {
      total_count: 2,
      repository_selection: "all",
      secrets: [
        {
          id: "456",
        },
      ],
    };

    const mock = fetchMock
      .sandbox()
      .get(
        `https://api.github.com/repos/octocat/hello-world/actions/secrets?per_page=1`,
        {
          body: result1,
          headers: {
            link: `<https://api.github.com/repos/octocat/hello-world/actions/secrets?per_page=1&page=2>; rel="next"`,
            "X-GitHub-Media-Type": "github.v3; format=json",
          },
        }
      )
      .get(
        `https://api.github.com/repos/octocat/hello-world/actions/secrets?per_page=1&page=2`,
        {
          body: result2,
          headers: {
            link: `<https://api.github.com/repos/octocat/hello-world/actions/secrets?per_page=1>; rel="prev", <https://api.github.com/repos/octocat/hello-world/actions/secrets?per_page=1>; rel="first"`,
            "X-GitHub-Media-Type": "github.v3; format=json",
          },
        }
      );

    const octokit = new TestOctokit({
      request: {
        fetch: mock,
      },
    });

    return octokit
      .paginate({
        method: "GET",
        url: "/repos/{owner}/{repo}/actions/secrets",
        owner: "octocat",
        repo: "hello-world",
        per_page: 1,
      })
      .then((results) => {
        expect(results).toStrictEqual([...result1.secrets, ...result2.secrets]);
      });
  });

  it(".paginate() with results namespace (GET /repos/{owner}/{repo}/actions/workflows)", () => {
    const result1 = {
      total_count: 2,
      workflows: [
        {
          id: "123",
        },
      ],
    };
    const result2 = {
      total_count: 2,
      repository_selection: "all",
      workflows: [
        {
          id: "456",
        },
      ],
    };

    const mock = fetchMock
      .sandbox()
      .get(
        `https://api.github.com/repos/octocat/hello-world/actions/workflows?per_page=1`,
        {
          body: result1,
          headers: {
            link: `<https://api.github.com/repos/octocat/hello-world/actions/workflows?per_page=1&page=2>; rel="next"`,
            "X-GitHub-Media-Type": "github.v3; format=json",
          },
        }
      )
      .get(
        `https://api.github.com/repos/octocat/hello-world/actions/workflows?per_page=1&page=2`,
        {
          body: result2,
          headers: {
            link: `<https://api.github.com/repos/octocat/hello-world/actions/workflows?per_page=1>; rel="prev", <https://api.github.com/repos/octocat/hello-world/actions/workflows?per_page=1>; rel="first"`,
            "X-GitHub-Media-Type": "github.v3; format=json",
          },
        }
      );

    const octokit = new TestOctokit({
      request: {
        fetch: mock,
      },
    });

    return octokit
      .paginate({
        method: "GET",
        url: "/repos/{owner}/{repo}/actions/workflows",
        owner: "octocat",
        repo: "hello-world",
        per_page: 1,
      })
      .then((results) => {
        expect(results).toStrictEqual([
          ...result1.workflows,
          ...result2.workflows,
        ]);
      });
  });
  it(".paginate() with results namespace (GET /repos/{owner}/{repo}/actions/runs/{run_id}/jobs)", () => {
    const result1 = {
      total_count: 2,
      jobs: [
        {
          id: "123",
        },
      ],
    };
    const result2 = {
      total_count: 2,
      repository_selection: "all",
      jobs: [
        {
          id: "456",
        },
      ],
    };

    const mock = fetchMock
      .sandbox()
      .get(
        `https://api.github.com/repos/octocat/hello-world/actions/runs/123/jobs?per_page=1`,
        {
          body: result1,
          headers: {
            link: `<https://api.github.com/repos/octocat/hello-world/actions/runs/123/jobs?per_page=1&page=2>; rel="next"`,
            "X-GitHub-Media-Type": "github.v3; format=json",
          },
        }
      )
      .get(
        `https://api.github.com/repos/octocat/hello-world/actions/runs/123/jobs?per_page=1&page=2`,
        {
          body: result2,
          headers: {
            link: `<https://api.github.com/repos/octocat/hello-world/actions/runs/123/jobs?per_page=1>; rel="prev", <https://api.github.com/repos/octocat/hello-world/actions/secrets?per_page=1>; rel="first"`,
            "X-GitHub-Media-Type": "github.v3; format=json",
          },
        }
      );

    const octokit = new TestOctokit({
      request: {
        fetch: mock,
      },
    });

    return octokit
      .paginate({
        method: "GET",
        url: "/repos/{owner}/{repo}/actions/runs/{run_id}/jobs",
        owner: "octocat",
        repo: "hello-world",
        run_id: 123,
        per_page: 1,
      })
      .then((results) => {
        expect(results).toStrictEqual([...result1.jobs, ...result2.jobs]);
      });
  });
  it(".paginate() with results namespace (GET /repos/{owner}/{repo}/actions/workflows/{workflow_id}/runs)", () => {
    const result1 = {
      total_count: 2,
      workflow_runs: [
        {
          id: "123",
        },
      ],
    };
    const result2 = {
      total_count: 2,
      repository_selection: "all",
      workflow_runs: [
        {
          id: "456",
        },
      ],
    };

    const mock = fetchMock
      .sandbox()
      .get(
        `https://api.github.com/repos/octocat/hello-world/actions/workflows/123/runs?per_page=1`,
        {
          body: result1,
          headers: {
            link: `<https://api.github.com/repos/octocat/hello-world/actions/workflows/123/runs?per_page=1&page=2>; rel="next"`,
            "X-GitHub-Media-Type": "github.v3; format=json",
          },
        }
      )
      .get(
        `https://api.github.com/repos/octocat/hello-world/actions/workflows/123/runs?per_page=1&page=2`,
        {
          body: result2,
          headers: {
            link: `<https://api.github.com/repos/octocat/hello-world/actions/workflows/123/runs?per_page=1>; rel="prev", <https://api.github.com/repos/octocat/hello-world/actions/secrets?per_page=1>; rel="first"`,
            "X-GitHub-Media-Type": "github.v3; format=json",
          },
        }
      );

    const octokit = new TestOctokit({
      request: {
        fetch: mock,
      },
    });

    return octokit
      .paginate({
        method: "GET",
        url: "/repos/{owner}/{repo}/actions/workflows/{workflow_id}/runs",
        owner: "octocat",
        repo: "hello-world",
        workflow_id: 123,
        per_page: 1,
      })
      .then((results) => {
        expect(results).toStrictEqual([
          ...result1.workflow_runs,
          ...result2.workflow_runs,
        ]);
      });
  });
  it(".paginate() with results namespace (GET /repos/{owner}/{repo}/actions/runs)", () => {
    const result1 = {
      total_count: 2,
      workflow_runs: [
        {
          id: "123",
        },
      ],
    };
    const result2 = {
      total_count: 2,
      repository_selection: "all",
      workflow_runs: [
        {
          id: "456",
        },
      ],
    };

    const mock = fetchMock
      .sandbox()
      .get(
        `https://api.github.com/repos/octocat/hello-world/actions/runs?per_page=1`,
        {
          body: result1,
          headers: {
            link: `<https://api.github.com/repos/octocat/hello-world/actions/runs?per_page=1&page=2>; rel="next"`,
            "X-GitHub-Media-Type": "github.v3; format=json",
          },
        }
      )
      .get(
        `https://api.github.com/repos/octocat/hello-world/actions/runs?per_page=1&page=2`,
        {
          body: result2,
          headers: {
            link: `<https://api.github.com/repos/octocat/hello-world/actions/runs?per_page=1>; rel="prev", <https://api.github.com/repos/octocat/hello-world/actions/secrets?per_page=1>; rel="first"`,
            "X-GitHub-Media-Type": "github.v3; format=json",
          },
        }
      );

    const octokit = new TestOctokit({
      request: {
        fetch: mock,
      },
    });

    return octokit
      .paginate({
        method: "GET",
        url: "/repos/{owner}/{repo}/actions/runs",
        owner: "octocat",
        repo: "hello-world",
        per_page: 1,
      })
      .then((results) => {
        expect(results).toStrictEqual([
          ...result1.workflow_runs,
          ...result2.workflow_runs,
        ]);
      });
  });

  it(".paginate() with results namespace (GET /installation/repositories, single page response)", () => {
    const result = {
      total_count: 2,
      repositories: [
        {
          id: "123",
        },
      ],
    };

    const mock = fetchMock
      .sandbox()
      .get(`https://api.github.com/installation/repositories?per_page=1`, {
        body: result,
      });

    const octokit = new TestOctokit({
      request: {
        fetch: mock,
      },
    });

    return octokit
      .paginate({
        method: "GET",
        url: "/installation/repositories",
        per_page: 1,
      })
      .then((results) => {
        expect(results).toStrictEqual([...result.repositories]);
      });
  });

  it("does not paginate non-paginated response with total_count property", () => {
    const result = {
      state: "success",
      total_count: 2,
      statuses: [{ id: 1 }, { id: 2 }],
      commit_url: "https://api.github.com/...",
      url: "https://api.github.com/...",
      repository: {},
      sha: "sha123",
    };
    const mock = fetchMock
      .sandbox()
      .get(
        "https://api.github.com/repos/octokit/rest.js/commits/abc4567/status",
        {
          body: result,
        }
      );

    const octokit = new TestOctokit({
      request: {
        fetch: mock,
      },
    });

    return octokit
      .paginate<typeof result>({
        method: "GET",
        url: "/repos/{owner}/{repo}/commits/{ref}/status",
        owner: "octokit",
        repo: "rest.js",
        ref: "abc4567",
      })
      .then((results) => {
        expect(results[0].state).toEqual("success");
      });
  });

  it("Does correctly flatten the response from the 2nd page (octokit/rest.js#1632)", async () => {
    const result1 = {
      total_count: 2,
      workflow_runs: [
        {
          id: "123",
        },
      ],
    };
    const result2 = {
      total_count: 2,
      repository_selection: "all",
      workflow_runs: [
        {
          id: "456",
        },
      ],
    };

    const mock = fetchMock
      .sandbox()
      .get(
        `https://api.github.com/repos/octocat/hello-world/actions/runs?per_page=1`,
        {
          body: result1,
          headers: {
            link: `<https://api.github.com/repositories/1/actions/runs?per_page=1&page=2>; rel="next"`,
            "X-GitHub-Media-Type": "github.v3; format=json",
          },
        }
      )
      .get(
        `https://api.github.com/repositories/1/actions/runs?per_page=1&page=2`,
        {
          body: result2,
          headers: {
            link: `<https://api.github.com/repos/octocat/hello-world/actions/runs?per_page=1>; rel="prev", <https://api.github.com/repos/octocat/hello-world/actions/secrets?per_page=1>; rel="first"`,
            "X-GitHub-Media-Type": "github.v3; format=json",
          },
        }
      );

    const octokit = new TestOctokit({
      request: {
        fetch: mock,
      },
    });

    return octokit
      .paginate({
        method: "GET",
        url: "/repos/{owner}/{repo}/actions/runs",
        owner: "octocat",
        repo: "hello-world",
        per_page: 1,
      })
      .then((results) => {
        expect(results).toStrictEqual([
          ...result1.workflow_runs,
          ...result2.workflow_runs,
        ]);
      });
  });

  it("404 error", async () => {
    const mock = fetchMock
      .sandbox()
      .get("https://api.github.com/repos/owner/non-existing-repo/issues", {
        status: 404,
        body: {
          message: "Not Found",
          documentation_url:
            "https://docs.github.com/en/rest/reference/issues#list-repository-issues",
        },
      });

    const TestOctokit = Octokit.plugin(paginateRest);
    const octokit = new TestOctokit({
      request: {
        fetch: mock,
      },
    });

    await expect(
      async () =>
        await octokit.paginate("GET /repos/{owner}/{repo}/issues", {
          owner: "owner",
          repo: "non-existing-repo",
        })
    ).rejects.toThrow("Not Found");
  });
});
