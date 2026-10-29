// Only allow same-site paths as a post-login destination, so a crafted link can't bounce someone
// to another website after they sign in.
export function safeNext(value: string | undefined, fallback = "/board"): string {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("\\")) return fallback;
  return value;
}
