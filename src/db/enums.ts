// Shared value lists. The database enums, the validation schemas and the UI all read from here
// so they cannot drift apart.

export const TIERS = ["guest", "member", "founder"] as const;
export type Tier = (typeof TIERS)[number];

export const ROLES = ["user", "admin"] as const;
export type Role = (typeof ROLES)[number];

export const USER_STATUSES = ["active", "suspended"] as const;
export type UserStatus = (typeof USER_STATUSES)[number];

export const CATEGORIES = ["general", "smoke_session", "pairings", "gear", "recommendations"] as const;
export type Category = (typeof CATEGORIES)[number];

export const CATEGORY_LABELS: Record<Category, string> = {
  general: "General",
  smoke_session: "Smoke Session",
  pairings: "Pairings",
  gear: "Gear",
  recommendations: "Recommendations",
};

export const VISIBILITIES = ["public", "members"] as const;
export type Visibility = (typeof VISIBILITIES)[number];

export const CONTENT_STATUSES = ["published", "hidden"] as const;
export type ContentStatus = (typeof CONTENT_STATUSES)[number];

export const REPORT_STATUSES = ["open", "resolved"] as const;
export type ReportStatus = (typeof REPORT_STATUSES)[number];

// Cities offered on the Board. Phase 2 can turn this into a table once the club grows.
export const BOARD_CITIES = ["Las Vegas", "Scottsdale", "Miami"] as const;
