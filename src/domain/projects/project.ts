import type { ProjectReferenceCode } from "@/domain/shared/identifiers";
import type { YearMonth } from "@/domain/shared/period";

export interface Project {
  readonly referenceCode: ProjectReferenceCode;

  readonly name: string;

  readonly priceAed: number;

  readonly salesPeriod: YearMonth;

  readonly category: string;

  readonly status: string | null;
}
