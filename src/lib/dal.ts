// Data access layer: the one place the rest of the app learns who is signed in.
import "server-only";
import { eq } from "drizzle-orm";
import { cache } from "react";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { auth } from "@/auth";
import { getDb } from "@/db";
import { users } from "@/db/schema";
import { isAdmin, type Viewer } from "@/lib/permissions";

// Read once per request. Returns null for signed-out visitors and for sessions whose
// account no longer exists.
export const getViewer = cache(async (): Promise<Viewer | null> => {
  // Wait for a real request first. Auth.js and the database driver set themselves up with random
  // values, which Next.js won't allow while it is still prerendering the page shell.
  await connection();
  const session = await auth();
  const id = session?.user?.id;
  if (!id) return null;
  const [u] = await getDb().select().from(users).where(eq(users.id, id)).limit(1);
  if (!u) return null;
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    image: u.image,
    tier: u.tier,
    role: u.role,
    status: u.status,
    city: u.city,
  };
});

// Use at the top of pages that are for admins only.
export async function requireAdminPage(): Promise<Viewer> {
  const viewer = await getViewer();
  if (!viewer) redirect("/signin?next=/admin");
  if (!isAdmin(viewer)) redirect("/board");
  return viewer;
}
