export type SpreadsheetIssueSeverity = "warning" | "error";

export interface SpreadsheetIssue {
  readonly severity: SpreadsheetIssueSeverity;

  readonly rowNumber: number;

  readonly field?: string;

  readonly message: string;
}

export interface SpreadsheetParseResult<T> {
  readonly data: T;

  readonly issues: readonly SpreadsheetIssue[];
}
