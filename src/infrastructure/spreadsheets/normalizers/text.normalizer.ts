const EMPTY_CELL_MARKERS = new Set(["", "-", "–", "—"]);

export function normalizeOptionalText(value: string): string | null {
  const normalizedValue = value.trim();

  if (EMPTY_CELL_MARKERS.has(normalizedValue)) {
    return null;
  }

  return normalizedValue;
}

export function normalizeRequiredText(value: string): string {
  return normalizeOptionalText(value) ?? "";
}
