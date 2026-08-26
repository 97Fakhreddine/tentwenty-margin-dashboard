"use server";

import { revalidatePath } from "next/cache";

import { FinancialImportService } from "@/application/imports/financial-import.service";

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

function validateSpreadsheetFile(file: File): void {
  if (!file.name.toLowerCase().endsWith(".xlsx")) {
    throw new Error("Only .xlsx files are supported.");
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new Error("The uploaded file exceeds the 10 MB limit.");
  }
}

async function toNodeBuffer(file: File): Promise<Buffer> {
  const arrayBuffer = await file.arrayBuffer();

  return Buffer.from(arrayBuffer);
}

export async function uploadTimesheet(formData: FormData): Promise<void> {
  const file = formData.get("file");

  if (!(file instanceof File)) {
    throw new Error("No timesheet file was provided.");
  }

  validateSpreadsheetFile(file);

  const service = new FinancialImportService();

  await service.importTimesheet(file.name, await toNodeBuffer(file));

  revalidatePath("/");
  revalidatePath("/imports");
  revalidatePath("/productivity");
  revalidatePath("/categories");
}

export async function uploadSalaries(formData: FormData): Promise<void> {
  const file = formData.get("file");

  if (!(file instanceof File)) {
    throw new Error("No salary file was provided.");
  }

  validateSpreadsheetFile(file);

  const service = new FinancialImportService();

  await service.importSalaries(file.name, await toNodeBuffer(file));

  revalidatePath("/");
  revalidatePath("/imports");
  revalidatePath("/productivity");
  revalidatePath("/categories");
}

export async function uploadProjectPrices(formData: FormData): Promise<void> {
  const file = formData.get("file");

  if (!(file instanceof File)) {
    throw new Error("No project-price file was provided.");
  }

  validateSpreadsheetFile(file);

  const service = new FinancialImportService();

  await service.importProjectPrices(file.name, await toNodeBuffer(file));

  revalidatePath("/");
  revalidatePath("/imports");
}
