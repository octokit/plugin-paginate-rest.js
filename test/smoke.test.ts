import { Octokit } from "@octokit/core";

import { paginateRest } from "../src";

describe("Smoke test", () => {
  it("is a function", () => {
    expect(paginateRest).toBeInstanceOf(Function);
  });

  it("${answers.exportName}.VERSION is set", () => {
    expect(paginateRest.VERSION).toEqual("0.0.0-development");
  });

  it("Loads plugin", () => {
    const TestOctokit = Octokit.plugin(paginateRest);
    const testOctokit = new TestOctokit();
    expect(testOctokit).toHaveProperty("paginate");
  });
});
