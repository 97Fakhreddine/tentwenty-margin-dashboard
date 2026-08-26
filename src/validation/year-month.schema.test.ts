import { describe, expect, it } from "vitest";

import { monthNumberSchema, yearMonthSchema } from "./year-month.schema";

describe("yearMonthSchema", () => {
  it("accepts a valid year and month", () => {
    expect(
      yearMonthSchema.parse({
        year: 2025,
        month: 12,
      }),
    ).toEqual({
      year: 2025,
      month: 12,
    });
  });

  it("rejects month zero", () => {
    expect(monthNumberSchema.safeParse(0).success).toBe(false);
  });

  it("rejects month thirteen", () => {
    expect(monthNumberSchema.safeParse(13).success).toBe(false);
  });
});
