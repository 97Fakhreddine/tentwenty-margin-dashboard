export function calculateProfitability(
  revenueAed: number,
  costAed: number,
): number | null {
  if (revenueAed < 0 || costAed < 0) {
    throw new Error("Revenue and cost cannot be negative.");
  }

  if (revenueAed === 0) {
    return null;
  }

  return (revenueAed - costAed) / revenueAed;
}
