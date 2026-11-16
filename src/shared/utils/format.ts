/**
 * Formatting helpers for numbers, times and countries, in plain words.
 * One place so every page shows "12,408", "3 min ago" and "Germany" the same way.
 */

const numberFormat = new Intl.NumberFormat('en-US');
const countryNames = new Intl.DisplayNames(['en'], { type: 'region' });

/** 12408 → "12,408" */
export function formatNumber(value: number): string {
  return numberFormat.format(value);
}

/** "DE" → "Germany"; empty or unknown codes → "Unknown". */
export function countryName(code: string): string {
  if (!code) return 'Unknown';
  try {
    return countryNames.of(code) ?? code;
  } catch {
    return code;
  }
}

/** ISO time → "14:32:08" (local time). */
export function formatClock(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-GB', { hour12: false });
}

/** ISO time → "16 Nov, 14:32". */
export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

/** "2026-11-15" → "Sunday, 15 November". */
export function formatDay(day: string): string {
  return new Date(`${day}T12:00:00Z`).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
}

/** ISO time → "just now", "5 min ago", "3 h ago", "2 days ago". */
export function timeAgo(iso: string | null | undefined): string {
  if (!iso) return 'never';
  const seconds = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} h ago`;
  return `${Math.floor(seconds / 86400)} days ago`;
}

/** Chart axis label for a bucket: clock time for short ranges, date for long ones. */
export function bucketLabel(iso: string, bucketSeconds: number): string {
  const date = new Date(iso);
  if (bucketSeconds >= 86400) return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  if (bucketSeconds >= 3600) return date.toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit' });
  return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

/** "Ana Petrova" or "ana@shop.com" → "AP" / "A". */
export function initials(nameOrEmail: string): string {
  const parts = nameOrEmail
    .split('@')[0]
    .split(/[\s._-]+/)
    .filter(Boolean);
  return (
    parts
      .slice(0, 2)
      .map((part) => part[0].toUpperCase())
      .join('') || '?'
  );
}

/** (1, "address") → "1 address"; (3, "address", "addresses") → "3 addresses". */
export function plural(count: number, one: string, many = `${one}s`): string {
  return `${formatNumber(count)} ${count === 1 ? one : many}`;
}
