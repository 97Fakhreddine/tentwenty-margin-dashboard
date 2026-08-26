import type { Project } from "@/domain/projects/project";
import type { MonthNumber } from "@/domain/shared/period";

export interface RevenueRecognitionPeriod {
  readonly year: number;
  readonly month: MonthNumber | null;
}

export interface RevenueRecognitionPolicy {
  readonly label: string;

  recognizedRevenueAed(
    project: Project,
    period: RevenueRecognitionPeriod,
  ): number;
}

/**
 * Temporary documented assumption:
 * recognize the full project price in its Sales Month.
 *
 * Keeping this policy isolated means we can replace it easily
 * if the business confirms another revenue-recognition method.
 */
export const SALES_MONTH_REVENUE_RECOGNITION: RevenueRecognitionPolicy = {
  label: "Revenue is recognized in the project's sales month.",

  recognizedRevenueAed(project, period) {
    if (project.salesPeriod.year !== period.year) {
      return 0;
    }

    if (period.month !== null && project.salesPeriod.month !== period.month) {
      return 0;
    }

    return project.priceAed;
  },
};
