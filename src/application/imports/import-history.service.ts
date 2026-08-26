import { FinancialReportingRepository } from "@/infrastructure/repositories/financial-reporting.repository";

export interface ImportHistoryRow {
  readonly id: string;

  readonly kind: string;

  readonly sourceFileName: string;

  readonly recordCount: number;

  readonly warningCount: number;

  readonly importedAt: Date;
}

export class ImportHistoryService {
  constructor(
    private readonly repository = new FinancialReportingRepository(),
  ) {}

  async getRecentImports(): Promise<readonly ImportHistoryRow[]> {
    return this.repository.getRecentImports(15);
  }
}
