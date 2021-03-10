import { paginatingEndpoints, isPaginatingEndpoint } from "../src";

describe("paginating endpoints", () => {
  describe.each(paginatingEndpoints.map((arg) => [arg]))(
    "isPaginatingEndpoint(%p)",
    (arg) => {
      it("returns true", () => {
        expect.assertions(1);
        expect(isPaginatingEndpoint(arg)).toBe(true);
      });
    }
  );

  describe.each([
    ["GET /unknown/url"],
    ["a string, but not an endpoint"],
    [123],
    [null],
    [undefined],
    [false],
    [true],
  ])("isPaginatingEndpoint(%p)", (arg) => {
    it("returns false", () => {
      expect.assertions(1);
      expect(isPaginatingEndpoint(arg)).toBe(false);
    });
  });
});
