import { Suspense } from "react";
import { PageHeader } from "@/components/PageHeader";
import { requestTime, timeAgo } from "@/components/board/time";
import { getDb } from "@/db";
import { TIERS } from "@/db/enums";
import { listAccounts, listOpenReports } from "@/lib/board-service";
import { requireAdminPage } from "@/lib/dal";
import { resolveReportAction, setHiddenAction, setStatusAction, setTierAction } from "./actions";

export const metadata = { title: "Host tools | The Sunday Morning Cigar Club" };

const TIER_LABEL = { guest: "Guest", member: "Member", founder: "Founders Circle" } as const;
const btn = "rounded-full border border-gold/50 px-3 py-1 text-sm hover:border-flamingo hover:text-flamingo";

export default function Admin() {
  return (
    <>
      <PageHeader title="Host tools" lead="Approve new members, look into reports, and keep the Board friendly." />
      <Suspense fallback={<div className="mx-auto max-w-6xl px-4 pt-10" aria-busy="true"><div className="h-64 rounded-md bg-lagoon/30" /></div>}>
        <Tools />
      </Suspense>
    </>
  );
}

async function Tools() {
  const viewer = await requireAdminPage();
  const db = getDb();
  const [reports, accounts] = await Promise.all([listOpenReports(db, viewer), listAccounts(db, viewer)]);
  const now = requestTime();

  // People waiting for approval come first.
  const sorted = [...accounts].sort((a, b) => Number(b.tier === "guest") - Number(a.tier === "guest") || b.createdAt.getTime() - a.createdAt.getTime());
  const waiting = accounts.filter((a) => a.tier === "guest" && a.role !== "admin" && a.status === "active").length;

  return (
    <div className="mx-auto max-w-6xl space-y-14 px-4 pt-10">
      <section aria-labelledby="reports-h">
        <h2 id="reports-h" className="font-display text-2xl text-sand">Reports <span className="text-base text-haze">({reports.length} open)</span></h2>
        {reports.length === 0 ? (
          <p className="mt-3 text-haze">Nothing to review. The Board is behaving.</p>
        ) : (
          <ul className="mt-4 space-y-4">
            {reports.map((r) => (
              <li key={r.id} className="rounded-md border border-gold/25 bg-night p-5">
                <p className="text-sm text-haze">
                  {r.reporterName ?? "A member"} reported a {r.kind} by <span className="text-sand">{r.targetAuthorName ?? "a member"}</span> · {timeAgo(r.createdAt, now)}
                </p>
                <p className="mt-2 border-l-2 border-gold/40 pl-4 whitespace-pre-line break-words">{r.targetBody || "(no text)"}</p>
                <p className="mt-3 text-sm"><span className="text-haze">Reason:</span> {r.reason}</p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <form action={setHiddenAction.bind(null, r.kind, r.targetId, true)}>
                    <button className={btn}>Hide {r.kind} and close report</button>
                  </form>
                  <form action={resolveReportAction.bind(null, r.id)}>
                    <button className={btn}>Dismiss report</button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="members-h">
        <h2 id="members-h" className="font-display text-2xl text-sand">
          Members <span className="text-base text-haze">({accounts.length} accounts{waiting > 0 ? `, ${waiting} waiting for approval` : ""})</span>
        </h2>
        <div className="mt-4 overflow-x-auto rounded-md border border-gold/20">
          <table className="w-full min-w-[40rem] text-left text-sm">
            <thead className="bg-lagoon/40 text-haze">
              <tr>
                <th scope="col" className="px-4 py-3 font-normal">Person</th>
                <th scope="col" className="px-4 py-3 font-normal">Joined</th>
                <th scope="col" className="px-4 py-3 font-normal">Tier</th>
                <th scope="col" className="px-4 py-3 font-normal">Account</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gold/10">
              {sorted.map((a) => {
                const self = a.id === viewer.id;
                return (
                  <tr key={a.id} className={a.tier === "guest" && a.role !== "admin" ? "bg-flamingo/5" : ""}>
                    <td className="px-4 py-3">
                      <p className="text-sand">{a.name ?? "(no name)"}{a.role === "admin" && <span className="ml-2 rounded-full border border-gold/40 px-2 py-0.5 text-xs text-gold">Host</span>}</p>
                      <p className="text-haze">{a.email}</p>
                    </td>
                    <td className="px-4 py-3 text-haze">{a.createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "America/Los_Angeles" })}</td>
                    <td className="px-4 py-3">
                      <form action={setTierAction.bind(null, a.id)} className="flex items-center gap-2">
                        <label className="sr-only" htmlFor={`tier-${a.id}`}>Tier for {a.name ?? a.email}</label>
                        <select id={`tier-${a.id}`} name="tier" defaultValue={a.tier} className="rounded border border-gold/30 bg-night p-1.5 text-sand">
                          {TIERS.map((t) => <option key={t} value={t}>{TIER_LABEL[t]}</option>)}
                        </select>
                        <button className={btn}>Save</button>
                      </form>
                    </td>
                    <td className="px-4 py-3">
                      {self ? (
                        <span className="text-haze">You</span>
                      ) : (
                        <form action={setStatusAction.bind(null, a.id, a.status === "active" ? "suspended" : "active")}>
                          <span className={a.status === "suspended" ? "mr-3 text-flamingo" : "mr-3 text-seafoam"}>{a.status === "suspended" ? "Suspended" : "Active"}</span>
                          <button className={btn}>{a.status === "active" ? "Suspend" : "Reinstate"}</button>
                        </form>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-sm text-haze">
          Guests can read public posts. Members and the Founders Circle can post, reply, and read members-only posts. Hosts are set with the
          ADMIN_EMAILS setting, not here.
        </p>
      </section>
    </div>
  );
}
