import Link from "next/link";
import { signOut } from "@/auth";
import { getViewer } from "@/lib/dal";
import { initialsOf, isAdmin } from "@/lib/permissions";

const TIER_LABEL = { guest: "Guest", member: "Member", founder: "Founders Circle" } as const;

// Sits in the nav. It reads the session, so the layout wraps it in <Suspense>.
export async function AuthStatus() {
  const viewer = await getViewer();

  if (!viewer) {
    return (
      <>
        <Link href="/signin" className="whitespace-nowrap px-2 py-2 text-sm text-sand/85 hover:text-flamingo">
          Sign in
        </Link>
        <Link href="/membership" className="whitespace-nowrap rounded-full bg-flamingo px-4 py-2 text-sm font-medium text-deep hover:bg-sand">
          Join the club
        </Link>
      </>
    );
  }

  async function out() {
    "use server";
    await signOut({ redirectTo: "/" });
  }

  const status = viewer.status === "suspended" ? "Suspended" : isAdmin(viewer) ? "Host" : TIER_LABEL[viewer.tier];

  return (
    <details className="relative">
      <summary
        className="grid h-9 w-9 cursor-pointer list-none place-items-center rounded-full border border-gold/60 text-sm text-gold [&::-webkit-details-marker]:hidden"
        aria-label={`Account menu for ${viewer.name ?? viewer.email}`}
      >
        {initialsOf(viewer.name ?? viewer.email)}
      </summary>
      <div className="absolute right-0 top-11 z-40 w-60 rounded-md border border-gold/40 bg-deep p-4 text-sm shadow-xl">
        <p className="truncate font-medium text-sand">{viewer.name ?? viewer.email}</p>
        <p className="truncate text-haze">{viewer.email}</p>
        <p className="mt-2 text-seafoam">{status}</p>
        {viewer.tier === "guest" && !isAdmin(viewer) && viewer.status === "active" && (
          <p className="mt-1 text-haze">Waiting for a host to approve your membership.</p>
        )}
        <div className="mt-3 flex flex-col gap-1 border-t border-gold/20 pt-3">
          <Link href="/profile" className="py-1 hover:text-flamingo">My profile</Link>
          {isAdmin(viewer) && <Link href="/admin" className="py-1 hover:text-flamingo">Host tools</Link>}
          <form action={out}>
            <button className="py-1 text-left hover:text-flamingo">Sign out</button>
          </form>
        </div>
      </div>
    </details>
  );
}
