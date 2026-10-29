"use client";

export default function BoardError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto max-w-xl px-4 py-20 text-center">
      <h1 className="font-display text-3xl text-sand">The Board is taking a break</h1>
      <p className="mt-3 text-haze">Something went wrong loading it. Give it another try in a moment.</p>
      <button onClick={reset} className="mt-6 rounded-full bg-flamingo px-6 py-2.5 font-medium text-deep hover:bg-sand">Try again</button>
    </div>
  );
}
