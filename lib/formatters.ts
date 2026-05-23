export const revenuFormatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 4,
});

export function formatRevenu(value: string | number) {
  const numericValue =
    typeof value === "number" ? value : Number.parseFloat(value || "0");

  return revenuFormatter.format(Number.isFinite(numericValue) ? numericValue : 0);
}

export function formatDate(isoDate: string) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "UTC",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(isoDate));
}

export function formatCreatedAt(isoDate: string) {
  return new Intl.DateTimeFormat("en-GB", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(isoDate));
}
