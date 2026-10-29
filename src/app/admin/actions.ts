"use server";

import { revalidatePath } from "next/cache";
import { getDb } from "@/db";
import { resolveReport, setContentHidden, setUserStatus, setUserTier } from "@/lib/board-service";
import { getViewer } from "@/lib/dal";
import { ServiceError } from "@/lib/permissions";

async function quietly(fn: () => Promise<unknown>) {
  try {
    await fn();
  } catch (e) {
    if (!(e instanceof ServiceError)) throw e;
  }
  revalidatePath("/admin");
  revalidatePath("/board");
}

export async function setHiddenAction(kind: "post" | "comment", id: string, hidden: boolean) {
  await quietly(async () => setContentHidden(getDb(), await getViewer(), { kind, id, hidden }));
}

export async function resolveReportAction(reportId: string) {
  await quietly(async () => resolveReport(getDb(), await getViewer(), reportId));
}

export async function setTierAction(userId: string, formData: FormData) {
  await quietly(async () => setUserTier(getDb(), await getViewer(), userId, formData.get("tier")));
}

export async function setStatusAction(userId: string, status: "active" | "suspended") {
  await quietly(async () => setUserStatus(getDb(), await getViewer(), userId, status));
}
