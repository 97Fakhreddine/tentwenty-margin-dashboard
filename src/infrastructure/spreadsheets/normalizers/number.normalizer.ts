import { normalizeOptionalText } from "./text.normalizer";

export function normalizeOptionalNumber(value: string): number | null {
  const normalizedText = normalizeOptionalText(value);

  if (normalizedText === null) {
    return null;
  }

  const numericText = normalizedText
    .replace(/AED/gi, "")
    .replace(/,/g, "")
    .trim();

  const parsedValue = Number(numericText);

  if (!Number.isFinite(parsedValue)) {
    return null;
  }

  return parsedValue;
}
