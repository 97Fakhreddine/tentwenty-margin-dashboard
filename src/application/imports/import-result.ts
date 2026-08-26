export type ImportKind = "TIMESHEET" | "SALARY" | "PROJECT_PRICES";

export interface ImportResult {
  readonly kind: ImportKind;

  readonly sourceFileName: string;

  readonly importedRecordCount: number;

  readonly warningCount: number;

  readonly periods: readonly string[];

  readonly warnings: readonly string[];
}
