import fetchMock from "fetch-mock";
import { Octokit } from "@octokit/core";

import { paginateRest } from "../src";

const ORG1 = { id: 1 };
const ORG2 = { id: 2 };

const TestOctokit = Octokit.plugin(paginateRest);
describe("pagination", () => {
  it(".paginate()", async () => {
    const mock = fetchMock
      .sandbox()
      .get("https://api.github.com/organizations?per_page=1", {
        body: [ORG1],
        headers: {
          link:
            '<https://pagination-test.com/organizations?page=2&per_page=1>; rel="next"',
          "X-GitHub-Media-Type": "github.v3; format=json"
        }
      })
      .get("https://pagination-test.com/organizations?page=2&per_page=1", {
        body: [ORG2],
        headers: {}
      });

    const octokit = new TestOctokit({
      request: {
        fetch: mock
      }
    });

    const organizations = await octokit.paginate("GET /organizations", {
      per_page: 1
    });
    expect(organizations).toStrictEqual([ORG1, ORG2]);

    await octokit
      .paginate("GET /organizations", { per_page: 1 }, (response: any) =>
        response.data.map((org: any) => org.id)
      )
      .then((organizations: any) => {
        expect(organizations).toStrictEqual([1, 2]);
      });
    await octokit
      .paginate<typeof ORG1, number>(
        {
          method: "GET",
          url: "/organizations",
          per_page: 1
        },
        response => response.data.map(org => org.id)
      )
      .then(organizations => {
        expect(organizations).toStrictEqual([1, 2]);
      });
  });

  it(".paginate() with map function returning undefined", () => {
    const mock = fetchMock
      .sandbox()
      .get("https://api.github.com/organizations?per_page=1", {
        body: [ORG1],
        headers: {
          link:
            '<https://pagination-test.com/organizations?page=2&per_page=1>; rel="next"',
          "X-GitHub-Media-Type": "github.v3; format=json"
        }
      })
      .get("https://pagination-test.com/organizations?page=2&per_page=1", {
        body: [ORG2],
        headers: {}
      });

    const octokit = new TestOctokit({
      request: {
        fetch: mock
      }
    });

    return octokit
      .paginate<typeof ORG1, undefined>(
        "GET /organizations",
        { per_page: 1 },
        () => [undefined]
      )
      .then(results => {
        expect(results).toStrictEqual([undefined, undefined]);
      });
  });

  it(".paginate() with early exit", () => {
    const mock = fetchMock
      .sandbox()
      .get("https://api.github.com/organizations?per_page=1", {
        body: [ORG1],
        headers: {
          link:
            '<https://pagination-test.com/organizations?page=2&per_page=1>; rel="next"',
          "X-GitHub-Media-Type": "github.v3; format=json"
        }
      })
      .get("https://pagination-test.com/organizations?page=2&per_page=1", {
        body: [ORG2],
        headers: {}
      });

    const octokit = new TestOctokit({
      request: {
        fetch: mock
      }
    });

    return octokit
      .paginate<typeof ORG1, number>(
        "GET /organizations",
        { per_page: 1 },
        (response, done) => {
          done();
          return response.data.map(org => org.id);
        }
      )
      .then(organizations => {
        expect(organizations).toStrictEqual([1]);
      });
  });

  it(".paginate() with Link header pointing to different path", () => {
    const mock = fetchMock
      .sandbox()
      .get("https://api.github.com/organizations?per_page=1", {
        body: [ORG1],
        headers: {
          link:
            '<https://pagination-test.com/foobar?page=2&per_page=1>; rel="next"',
          "X-GitHub-Media-Type": "github.v3; format=json"
        }
      })
      .get("https://pagination-test.com/foobar?page=2&per_page=1", {
        body: [ORG2],
        headers: {}
      });

    const octokit = new TestOctokit({
      request: {
        fetch: mock
      }
    });

    return octokit
      .paginate("GET /organizations", { per_page: 1 })
      .then(organizations => {
        expect(organizations).toStrictEqual([{ id: 1 }, { id: 2 }]);
      });
  });

  it("autopagination", () => {
    const mock = fetchMock
      .sandbox()
      .get("https://api.github.com/organizations?per_page=1", {
        body: [ORG1],
        headers: {
          link:
            '<https://pagination-test.com/organizations?page=2&per_page=1>; rel="next"',
          "X-GitHub-Media-Type": "github.v3; format=json"
        }
      })
      .get("https://pagination-test.com/organizations?page=2&per_page=1", {
        body: [ORG2],
        headers: {}
      });

    const octokit = new TestOctokit({
      request: {
        fetch: mock
      }
    });

    octokit.hook.wrap("request", (request, options) => {
      if (!options.request.paginate) {
        return request(options);
      }

      delete options.request.paginate;
      return octokit.paginate(options);
    });

    return octokit
      .request("GET /organizations", {
        per_page: 1,
        request: { paginate: true }
      })
      .then(organizations => {
        expect(organizations).toStrictEqual([{ id: 1 }, { id: 2 }]);
      });
  });

  it(".paginate.iterator for endpoints that don’t paginate", () => {
    const mock = fetchMock.sandbox().get("https://api.github.com/orgs/myorg", {
      body: ORG1
    });

    const octokit = new TestOctokit({
      request: {
        fetch: mock
      }
    });

    const iterator = octokit.paginate
      .iterator({
        method: "GET",
        url: "/orgs/:org",
        org: "myorg"
      })
      [Symbol.asyncIterator]();

    return iterator.next().then(result => {
      expect(result.value.data).toStrictEqual([ORG1]);
    });
  });

  it("paginate.iterator(route, parameters)", () => {
    const mock = fetchMock.sandbox().get("https://api.github.com/orgs/myorg", {
      body: ORG1
    });

    const octokit = new TestOctokit({
      request: {
        fetch: mock
      }
    });

    const iterator = octokit.paginate
      .iterator("GET /orgs/:org", {
        org: "myorg"
      })
      [Symbol.asyncIterator]();

    return iterator.next().then(result => {
      expect(result.value.data).toStrictEqual([ORG1]);
    });
  });

  it(".paginate() with results namespace (search)", () => {
    const result1 = {
      total_count: 2,
      incomplete_results: false,
      items: [
        {
          id: "123"
        }
      ]
    };
    const result2 = {
      total_count: 2,
      incomplete_results: false,
      items: [
        {
          id: "456"
        }
      ]
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
          "X-GitHub-Media-Type": "github.v3; format=json"
        }
      })
      .get(
        `https://api.github.com/search/issues?q=${query}&per_page=1&page=2`,
        {
          body: result2,
          headers: {
            link: `<https://api.github.com/search/issues?q=${query}&per_page=1&page=1>; rel="prev", <https://api.github.com/search/issues?q=${query}&per_page=1&page=1>; rel="first"`,
            "X-GitHub-Media-Type": "github.v3; format=json"
          }
        }
      );

    const octokit = new TestOctokit({
      request: {
        fetch: mock
      }
    });

    return octokit
      .paginate({
        method: "GET",
        url: "/search/issues",
        q: "repo:web-platform-tests/wpt is:pr is:open updated:>2019-02-26",
        per_page: 1,
        headers: {
          "accept-encoding": ""
        }
      })
      .then(results => {
        expect(results).toStrictEqual([...result1.items, ...result2.items]);
      });
  });

  it(".paginate() with results namespace (GET /installation/repositories)", () => {
    const result1 = {
      total_count: 2,
      repositories: [
        {
          id: "123"
        }
      ]
    };
    const result2 = {
      total_count: 2,
      repository_selection: "all",
      repositories: [
        {
          id: "456"
        }
      ]
    };

    const mock = fetchMock
      .sandbox()
      .get(`https://api.github.com/installation/repositories?per_page=1`, {
        body: result1,
        headers: {
          link: `<https://api.github.com/installation/repositories?per_page=1&page=2>; rel="next"`,
          "X-GitHub-Media-Type": "github.v3; format=json"
        }
      })
      .get(
        `https://api.github.com/installation/repositories?per_page=1&page=2`,
        {
          body: result2,
          headers: {
            link: `<https://api.github.com/installation/repositories?per_page=1>; rel="prev", <https://api.github.com/installation/repositories?per_page=1>; rel="first"`,
            "X-GitHub-Media-Type": "github.v3; format=json"
          }
        }
      );

    const octokit = new TestOctokit({
      request: {
        fetch: mock
      }
    });

    return octokit
      .paginate({
        method: "GET",
        url: "/installation/repositories",
        per_page: 1
      })
      .then(results => {
        expect(results).toStrictEqual([
          ...result1.repositories,
          ...result2.repositories
        ]);
      });
  });

  it(".paginate() with results namespace (GET /user/installations)", () => {
    const result1 = {
      total_count: 2,
      repositories: [
        {
          id: "123"
        }
      ]
    };
    const result2 = {
      total_count: 2,
      repository_selection: "all",
      repositories: [
        {
          id: "456"
        }
      ]
    };

    const mock = fetchMock
      .sandbox()
      .get(`https://api.github.com/user/installations?per_page=1`, {
        body: result1,
        headers: {
          link: `<https://api.github.com/user/installations?per_page=1&page=2>; rel="next"`,
          "X-GitHub-Media-Type": "github.v3; format=json"
        }
      })
      .get(`https://api.github.com/user/installations?per_page=1&page=2`, {
        body: result2,
        headers: {
          link: `<https://api.github.com/user/installations?per_page=1>; rel="prev", <https://api.github.com/user/installations?per_page=1>; rel="first"`,
          "X-GitHub-Media-Type": "github.v3; format=json"
        }
      });

    const octokit = new TestOctokit({
      request: {
        fetch: mock
      }
    });

    return octokit
      .paginate({
        method: "GET",
        url: "/user/installations",
        per_page: 1
      })
      .then(results => {
        expect(results).toStrictEqual([
          ...result1.repositories,
          ...result2.repositories
        ]);
      });
  });

  it(".paginate() with results namespace (GET /installation/repositories, single page response)", () => {
    const result = {
      total_count: 2,
      repositories: [
        {
          id: "123"
        }
      ]
    };

    const mock = fetchMock
      .sandbox()
      .get(`https://api.github.com/installation/repositories?per_page=1`, {
        body: result
      });

    const octokit = new TestOctokit({
      request: {
        fetch: mock
      }
    });

    return octokit
      .paginate({
        method: "GET",
        url: "/installation/repositories",
        per_page: 1
      })
      .then(results => {
        expect(results).toStrictEqual([...result.repositories]);
      });
  });

  it("does not paginate non-paginated response with total_count property", () => {
    const result = {
      state: "success",
      total_count: 2,
      statuses: [{ id: 1 }, { id: 2 }]
    };
    const mock = fetchMock
      .sandbox()
      .get(
        "https://api.github.com/repos/octokit/rest.js/commits/abc4567/status",
        {
          body: result
        }
      );

    const octokit = new TestOctokit({
      request: {
        fetch: mock
      }
    });

    return octokit
      .paginate<typeof result>({
        method: "GET",
        url: "/repos/:owner/:repo/commits/:ref/status",
        owner: "octokit",
        repo: "rest.js",
        ref: "abc4567"
      })
      .then(results => {
        expect(results[0].state).toEqual("success");
      });
  });
});
