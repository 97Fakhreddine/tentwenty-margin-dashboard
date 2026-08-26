interface CalculateEmployeeRevenueShareInput {
  readonly projectPriceAed: number;

  readonly employeeHours: number;

  readonly totalProjectHours: number;
}

export function calculateEmployeeRevenueShare({
  projectPriceAed,
  employeeHours,
  totalProjectHours,
}: CalculateEmployeeRevenueShareInput): number | null {
  if (projectPriceAed < 0 || employeeHours < 0 || totalProjectHours < 0) {
    throw new Error("Revenue-share inputs cannot be negative.");
  }

  if (totalProjectHours === 0) {
    return null;
  }

  return projectPriceAed * (employeeHours / totalProjectHours);
}
