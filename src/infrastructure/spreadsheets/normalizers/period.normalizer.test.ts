import { describe, expect, it } from "vitest";

import { parseYearMonth } from "./period.normalizer";

describe("parseYearMonth", () => {
  it("parses a full month and four-digit year", () => {
    expect(parseYearMonth("January 2025")).toEqual({
      year: 2025,
      month: 1,
    });
  });

  it("parses an abbreviated apostrophe year", () => {
    expect(parseYearMonth("May '25")).toEqual({
      year: 2025,
      month: 5,
    });
  });

  it("uses the fallback year when the value contains only a month", () => {
    expect(parseYearMonth("January", 2025)).toEqual({
      year: 2025,
      month: 1,
    });
  });

  it("returns null for an unsupported month", () => {
    expect(parseYearMonth("NotAMonth 2025")).toBeNull();
  });

  it("returns null when a month-only value has no fallback year", () => {
    expect(parseYearMonth("January")).toBeNull();
  });
});
