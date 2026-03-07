import { format as formatFns } from "date-fns";

export function formatDate(date: Date | string, pattern = "PPP"): string {
  return formatFns(new Date(date), pattern);
}

/** Första bokstaven i förnamnet + första i efternamnet, t.ex. "Anna Karlsson" → "AK". */
export function getInitials(name: string | null | undefined): string {
  if (!name || !name.trim()) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return parts[0][0].toUpperCase();
}
