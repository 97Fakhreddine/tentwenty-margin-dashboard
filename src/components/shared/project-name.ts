export function formatProjectDisplayName(name: string): string {
  return name
    .replace(/\.pdf$/i, "")
    .replace(/-COMMERCIAL$/i, "")
    .replace(/-/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
