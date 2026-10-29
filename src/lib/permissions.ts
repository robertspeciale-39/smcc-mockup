import type { Role, Tier, UserStatus } from "@/db/enums";

// The signed-in person, freshly read from the database on every request.
export type Viewer = {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  tier: Tier;
  role: Role;
  status: UserStatus;
  city: string;
};

export type MaybeViewer = Viewer | null;

export const isAdmin = (v: MaybeViewer): boolean => !!v && v.status === "active" && v.role === "admin";

// Members, Founders Circle and admins may read members-only posts and take part.
// Guests (signed in but not yet approved) and suspended accounts may not.
export const isActiveMember = (v: MaybeViewer): boolean =>
  !!v && v.status === "active" && (v.tier !== "guest" || v.role === "admin");

export const canReadMembersContent = isActiveMember;
export const canParticipate = isActiveMember;

export function initialsOf(name: string | null | undefined): string {
  const parts = (name ?? "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  const first = parts[0][0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] ?? "" : "";
  return (first + last).toUpperCase();
}

export class ServiceError extends Error {
  constructor(
    public code: "unauthorized" | "forbidden" | "not_found" | "invalid" | "rate_limited",
    message: string,
  ) {
    super(message);
    this.name = "ServiceError";
  }
}
