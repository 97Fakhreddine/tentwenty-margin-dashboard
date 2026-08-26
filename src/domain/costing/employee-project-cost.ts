interface CalculateEmployeeProjectCostInput {
  readonly hours: number;

  readonly directHourlyRateAed: number;

  readonly indirectHourlyRateAed: number;
}

export function calculateEmployeeProjectCost({
  hours,
  directHourlyRateAed,
  indirectHourlyRateAed,
}: CalculateEmployeeProjectCostInput): number {
  if (hours < 0) {
    throw new Error("Project hours cannot be negative.");
  }

  if (directHourlyRateAed < 0) {
    throw new Error("Direct hourly rate cannot be negative.");
  }

  if (indirectHourlyRateAed < 0) {
    throw new Error("Indirect hourly rate cannot be negative.");
  }

  return hours * (directHourlyRateAed + indirectHourlyRateAed);
}
