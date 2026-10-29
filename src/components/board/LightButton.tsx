"use client";

import { useOptimistic, useTransition } from "react";
import { toggleLightAction } from "@/app/board/actions";

export function LightButton({ postId, lights, lit, canLight }: { postId: string; lights: number; lit: boolean; canLight: boolean }) {
  const [view, flip] = useOptimistic({ lights, lit }, (cur) => ({ lit: !cur.lit, lights: cur.lights + (cur.lit ? -1 : 1) }));
  const [, startTransition] = useTransition();

  if (!canLight) {
    return <span title="Members can light posts">Lit · {lights}</span>;
  }
  return (
    <button
      type="button"
      aria-pressed={view.lit}
      className={view.lit ? "text-flamingo" : "hover:text-sand"}
      onClick={() =>
        startTransition(async () => {
          flip(undefined);
          await toggleLightAction(postId);
        })
      }
    >
      {view.lit ? "Lit" : "Light it"} · {view.lights}
    </button>
  );
}
