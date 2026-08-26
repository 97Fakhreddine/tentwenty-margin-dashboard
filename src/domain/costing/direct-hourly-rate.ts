interface CalculateDirectHourlyRateInput {
  readonly monthlySalaryAed: number;
  readonly totalLoggedHours: number;
}

export function calculateDirectHourlyRate({
  monthlySalaryAed,
  totalLoggedHours,
}: CalculateDirectHourlyRateInput): number | null {
  if (monthlySalaryAed < 0) {
    throw new Error("Monthly salary cannot be negative.");
  }

  if (totalLoggedHours < 0) {
    throw new Error("Total logged hours cannot be negative.");
  }

  if (totalLoggedHours === 0) {
    return null;
  }

  return monthlySalaryAed / totalLoggedHours;
}
