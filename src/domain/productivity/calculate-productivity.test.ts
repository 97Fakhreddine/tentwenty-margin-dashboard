import { describe, expect, it } from "vitest";

import { calculateProductivity } from "./calculate-productivity";

describe("calculateProductivity", () => {
  it("calculates billable hours divided by total hours", () => {
    expect(calculateProductivity(120, 160)).toBe(0.75);
  });
});
