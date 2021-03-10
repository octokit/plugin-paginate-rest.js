import { Octokit } from "@octokit/core";

import {
  paginateRest,
  composePaginateRest,
  isPaginatingEndpoint,
  paginatingEndpoints,
} from "../src";

describe("Smoke test", () => {
  it("paginateRest", () => {
    expect(paginateRest).toBeInstanceOf(Function);
  });

  it("paginateRest.VERSION is set", () => {
    expect(paginateRest.VERSION).toEqual("0.0.0-development");
  });

  it("composePaginateRest", () => {
    expect(composePaginateRest).toBeInstanceOf(Function);
  });

  it("isPaginatingEndpoint", () => {
    expect(isPaginatingEndpoint("GET /repos/{owner}/{repo}/releases")).toBe(
      true
    );
    expect(isPaginatingEndpoint(123)).toBe(false);
  });

  it("paginatingEndpoints", () => {
    expect(paginatingEndpoints).toBeInstanceOf(Array);
    expect(paginatingEndpoints).toContain("GET /repos/{owner}/{repo}/releases");
  });

  it("Loads plugin", () => {
    const TestOctokit = Octokit.plugin(paginateRest);
    const testOctokit = new TestOctokit();
    expect(testOctokit).toHaveProperty("paginate");
  });
});
