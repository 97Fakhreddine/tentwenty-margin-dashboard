import { describe, expect, it } from "vitest";

import { calculateProfitability } from "./calculate-profitability";

describe("calculateProfitability", () => {
  it("calculates profit relative to revenue", () => {
    expect(calculateProfitability(100_000, 70_000)).toBeCloseTo(0.3);
  });

  it("returns null when revenue is zero", () => {
    expect(calculateProfitability(0, 70_000)).toBeNull();
  });
});
