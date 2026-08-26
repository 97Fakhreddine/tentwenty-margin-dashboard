import ExcelJS from "exceljs";

const INPUT = "data/sample/timesheet-2025.xlsx";

const OUTPUT = "data/sample/timesheet-january-2025.xlsx";

const workbook = new ExcelJS.Workbook();

await workbook.xlsx.readFile(INPUT);

const sourceSheet = workbook.worksheets[0];

if (!sourceSheet) {
  throw new Error("Timesheet workbook has no worksheet.");
}

let headerRowNumber: number | null = null;

let monthColumnNumber: number | null = null;

for (
  let rowNumber = 1;
  rowNumber <= Math.min(20, sourceSheet.rowCount);
  rowNumber++
) {
  const row = sourceSheet.getRow(rowNumber);

  row.eachCell((cell, columnNumber) => {
    const value = cell.text.trim().toLowerCase();

    if (value === "month") {
      headerRowNumber = rowNumber;

      monthColumnNumber = columnNumber;
    }
  });

  if (headerRowNumber !== null && monthColumnNumber !== null) {
    break;
  }
}

if (headerRowNumber === null || monthColumnNumber === null) {
  throw new Error("Could not locate the Month column.");
}

const outputWorkbook = new ExcelJS.Workbook();

const outputSheet = outputWorkbook.addWorksheet(sourceSheet.name);

// Keep title/header rows exactly as values.
for (let rowNumber = 1; rowNumber <= headerRowNumber; rowNumber++) {
  const sourceRow = sourceSheet.getRow(rowNumber);

  outputSheet.addRow(sourceRow.values);
}

let januaryRows = 0;

for (
  let rowNumber = headerRowNumber + 1;
  rowNumber <= sourceSheet.rowCount;
  rowNumber++
) {
  const sourceRow = sourceSheet.getRow(rowNumber);

  const monthText = sourceRow
    .getCell(monthColumnNumber)
    .text.trim()
    .toLowerCase();

  if (monthText.includes("january")) {
    outputSheet.addRow(sourceRow.values);

    januaryRows++;
  }
}

await outputWorkbook.xlsx.writeFile(OUTPUT);

console.log(`Created ${OUTPUT}`);

console.log(`January rows: ${januaryRows}`);
