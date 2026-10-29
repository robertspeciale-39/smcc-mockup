export function timeAgo(date: Date, now: number): string {
  const s = Math.max(0, Math.round((now - date.getTime()) / 1000));
  if (s < 60) return "Just now";
  const m = Math.round(s / 60);
  if (m < 60) return `${m}m`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.round(h / 24);
  if (d === 1) return "Yesterday";
  if (d < 14) return `${d} days ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "America/Los_Angeles" });
}

// The current time, for server components that have already waited on request data (the session
// or the database). The lint rule against Date.now() is about components that re-render in the
// browser; these run once per request on the server.
export const requestTime = () => Date.now();
