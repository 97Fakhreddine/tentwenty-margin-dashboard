import type { Row, Worksheet } from "exceljs";

function normalizeHeader(value: string): string {
  return value.trim().replace(/\s+/g, " ").toLowerCase();
}

export function findHeaderRow(
  worksheet: Worksheet,
  requiredHeaders: readonly string[],
): Row | null {
  const normalizedRequiredHeaders = requiredHeaders.map(normalizeHeader);

  const rowsToInspect = Math.min(worksheet.rowCount, 20);

  for (let rowNumber = 1; rowNumber <= rowsToInspect; rowNumber += 1) {
    const row = worksheet.getRow(rowNumber);

    const availableHeaders = new Set<string>();

    for (
      let columnNumber = 1;
      columnNumber <= row.cellCount;
      columnNumber += 1
    ) {
      const cellText = row.getCell(columnNumber).text;

      if (cellText.trim()) {
        availableHeaders.add(normalizeHeader(cellText));
      }
    }

    const containsAllRequiredHeaders = normalizedRequiredHeaders.every(
      (header) => availableHeaders.has(header),
    );

    if (containsAllRequiredHeaders) {
      return row;
    }
  }

  return null;
}

export function createColumnIndexByHeader(
  headerRow: Row,
): ReadonlyMap<string, number> {
  const columnIndexByHeader = new Map<string, number>();

  for (
    let columnNumber = 1;
    columnNumber <= headerRow.cellCount;
    columnNumber += 1
  ) {
    const header = headerRow.getCell(columnNumber).text;

    if (!header.trim()) {
      continue;
    }

    columnIndexByHeader.set(normalizeHeader(header), columnNumber);
  }

  return columnIndexByHeader;
}

export function findColumnIndex(
  columnIndexByHeader: ReadonlyMap<string, number>,
  header: string,
): number | null {
  return columnIndexByHeader.get(normalizeHeader(header)) ?? null;
}
