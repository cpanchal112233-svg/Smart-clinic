export function cn(...inputs: (string | undefined | false)[]): string {
  return inputs.filter(Boolean).join(" ");
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr + "Z").toLocaleDateString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatTime(timeStr: string): string {
  const [h, m] = timeStr.split(":");
  const hour = parseInt(h, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 || 12;
  return `${hour12}:${m} ${ampm}`;
}

export function getStatusColor(
  status: string
): "default" | "success" | "warning" | "destructive" {
  switch (status) {
    case "completed":
    case "confirmed":
      return "success";
    case "checked_in":
    case "in_progress":
      return "warning";
    case "cancelled":
      return "destructive";
    default:
      return "default";
  }
}

/** Supabase sometimes returns relations as single object or array; normalize to single. */
export function one<T>(value: T | T[] | null | undefined): T | null {
  if (value == null) return null;
  return Array.isArray(value) ? value[0] ?? null : value;
}
