import { describe, expect, it } from "vitest";

import { calculateDirectHourlyRate } from "./direct-hourly-rate";

describe("calculateDirectHourlyRate", () => {
  it("divides salary by total logged hours", () => {
    expect(
      calculateDirectHourlyRate({
        monthlySalaryAed: 18_000,
        totalLoggedHours: 180,
      }),
    ).toBe(100);
  });

  it("returns null when no hours were logged", () => {
    expect(
      calculateDirectHourlyRate({
        monthlySalaryAed: 18_000,
        totalLoggedHours: 0,
      }),
    ).toBeNull();
  });
});
