import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, addDays } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Format a rupee amount in compact Indian notation.
 *  e.g. 500 → ₹500 | 12500 → ₹12.5K | 350000 → ₹3.5L | 12000000 → ₹1.2Cr
 */
export function fmtINR(value: number): string {
  if (value >= 1_00_00_000) return `₹${(value / 1_00_00_000).toFixed(1).replace(/\.0$/, "")}Cr`;
  if (value >= 1_00_000)    return `₹${(value / 1_00_000).toFixed(1).replace(/\.0$/, "")}L`;
  if (value >= 1_000)       return `₹${(value / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  return `₹${value}`;
}

// ==================== WEEK HELPERS (Sun–Sat) ====================

/** Get Sunday 00:00 of the week containing the given date */
export function getWeekSunday(date: Date): Date {
  const d = new Date(date);
  d.setDate(d.getDate() - d.getDay()); // getDay() 0=Sun
  d.setHours(0, 0, 0, 0);
  return d;
}

/** Get Saturday of the week starting on the given Sunday */
export function getWeekSaturday(sunday: Date): Date {
  return addDays(sunday, 6);
}

/** Get an array of 7 yyyy-MM-dd strings for Sun→Sat */
export function getWeekDates(sunday: Date): string[] {
  return Array.from({ length: 7 }, (_, i) => format(addDays(sunday, i), "yyyy-MM-dd"));
}

/** Format week range label: "06 APR (SUN) – 12 APR (SAT) 2025" */
export function formatWeekRange(sunday: Date): string {
  const sat = getWeekSaturday(sunday);
  return `${format(sunday, "dd MMM").toUpperCase()} (SUN) – ${format(sat, "dd MMM").toUpperCase()} ${format(sat, "yyyy")}`;
}
