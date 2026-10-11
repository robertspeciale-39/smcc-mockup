"use client";

import { useEffect, useState } from "react";
import { Sunburst } from "./Sunburst";

const KEY = "smcc-age-ok";

export function AgeGate() {
  const [show, setShow] = useState(false);
  const [declined, setDeclined] = useState(false);

  useEffect(() => {
    try {
      // localStorage only exists after hydration, so this check has to run in an effect.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (localStorage.getItem(KEY) !== "yes") setShow(true);
    } catch {
      setShow(true);
    }
  }, []);

  if (!show) return null;

  const confirm = () => {
    try {
      localStorage.setItem(KEY, "yes");
    } catch {}
    setShow(false);
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-deep/97 p-4" role="dialog" aria-modal="true" aria-labelledby="age-title">
      <div className="deco-frame w-full max-w-md bg-night p-8 text-center">
        <Sunburst className="mx-auto mb-4 w-48" bg="#0e2f36" />
        <h2 id="age-title" className="font-display text-2xl text-sand">Are you 21 or older?</h2>
        <p className="mt-3 text-haze">
          The Sunday Morning Cigar Club is for adults of legal smoking age.
        </p>
        {declined ? (
          <p className="mt-6 text-flamingo">Come back and see us on your 21st birthday.</p>
        ) : (
          <div className="mt-6 flex justify-center gap-3">
            <button onClick={confirm} className="rounded-full bg-flamingo px-6 py-2.5 font-medium text-deep hover:bg-sand">
              Yes, I&apos;m 21+
            </button>
            <button onClick={() => setDeclined(true)} className="rounded-full border border-gold/50 px-6 py-2.5">
              No
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
