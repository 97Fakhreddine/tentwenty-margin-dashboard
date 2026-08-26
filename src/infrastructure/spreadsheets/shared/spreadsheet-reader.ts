import ExcelJS, { type Worksheet } from "exceljs";

export async function readFirstWorksheet(
  workbookBuffer: Buffer,
): Promise<Worksheet> {
  const workbook = new ExcelJS.Workbook();

  const workbookArrayBuffer = Uint8Array.from(workbookBuffer).buffer;

  await workbook.xlsx.load(workbookArrayBuffer);

  const worksheet = workbook.worksheets[0];

  if (!worksheet) {
    throw new Error("The uploaded spreadsheet does not contain a worksheet.");
  }

  return worksheet;
}
