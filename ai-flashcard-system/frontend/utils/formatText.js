// Small helpers shared between client components.

export function capitalize(value) {
  if (!value) return "";
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function truncate(value, max = 80) {
  if (!value) return "";
  return value.length > max ? `${value.slice(0, max - 1)}…` : value;
}

export function formatPercent(value, fractionDigits = 1) {
  const n = Number(value);
  if (Number.isNaN(n)) return "0%";
  return `${n.toFixed(fractionDigits)}%`;
}

export function similarityTone(similarity) {
  if (similarity >= 85) return "emerald";
  if (similarity >= 60) return "amber";
  return "rose";
}

export function formatBytes(bytes) {
  if (!bytes || bytes < 1024) return `${bytes || 0} B`;
  const units = ["KB", "MB", "GB"];
  let size = bytes / 1024;
  let i = 0;
  while (size >= 1024 && i < units.length - 1) {
    size /= 1024;
    i += 1;
  }
  return `${size.toFixed(1)} ${units[i]}`;
}
