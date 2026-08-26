export function calculateProductivity(
  billableHours: number,
  totalLoggedHours: number,
): number | null {
  if (billableHours < 0 || totalLoggedHours < 0) {
    throw new Error("Hours cannot be negative.");
  }

  if (totalLoggedHours === 0) {
    return null;
  }

  return billableHours / totalLoggedHours;
}
