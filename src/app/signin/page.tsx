import { Suspense } from "react";
import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import { PageHeader } from "@/components/PageHeader";
import { devLoginEnabled, signIn } from "@/auth";
import { getViewer } from "@/lib/dal";
import { safeNext } from "@/lib/safe-redirect";

export const metadata = { title: "Sign in | The Sunday Morning Cigar Club" };

const ERRORS: Record<string, string> = {
  AccessDenied: "That Google account couldn't be signed in. It may be suspended, or Google hasn't verified its email address.",
  Configuration: "Sign-in isn't set up correctly yet. Let a club host know.",
};

export default function SignIn({ searchParams }: { searchParams: Promise<{ next?: string; error?: string }> }) {
  return (
    <>
      <PageHeader title="Sign in" lead="Use your Google account. We never see your password, and we only ask for your name, email and photo." />
      <Suspense fallback={<div className="mx-auto max-w-md px-4 pt-10" aria-hidden><div className="h-40 rounded-md bg-lagoon/30" /></div>}>
        <SignInPanel searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function SignInPanel({ searchParams }: { searchParams: Promise<{ next?: string; error?: string }> }) {
  const { next, error } = await searchParams;
  const destination = safeNext(next);
  if (await getViewer()) redirect(destination);

  // signIn() throws a redirect on success and an AuthError when it is refused. Turn refusals into
  // a friendly message on this page instead of an error screen.
  async function google() {
    "use server";
    try {
      await signIn("google", { redirectTo: destination });
    } catch (e) {
      if (e instanceof AuthError) redirect("/signin?error=Configuration");
      throw e;
    }
  }

  async function dev(formData: FormData) {
    "use server";
    if (!devLoginEnabled) return;
    try {
      await signIn("dev", { email: String(formData.get("email") ?? ""), redirectTo: destination });
    } catch (e) {
      if (e instanceof AuthError) redirect("/signin?error=AccessDenied");
      throw e;
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 pt-10">
      {error && (
        <p role="alert" className="mb-6 rounded border border-flamingo/60 bg-flamingo/10 p-4 text-sm">
          {ERRORS[error] ?? "Something went wrong signing in. Please try again."}
        </p>
      )}

      <div className="deco-frame bg-lagoon/40 p-8">
        <form action={google}>
          <button className="w-full rounded-full bg-flamingo px-6 py-3 font-medium text-deep hover:bg-sand">
            Continue with Google
          </button>
        </form>
        <p className="mt-5 text-sm text-haze">
          New accounts start as guests: you can read public posts right away. A club host approves members, who can post, reply
          and see members-only posts.
        </p>
        <p className="mt-3 text-sm text-haze">By continuing you confirm you are 21 or older.</p>
      </div>

      {devLoginEnabled && (
        <form action={dev} className="mt-8 rounded-md border border-dashed border-gold/50 p-5">
          <p className="text-sm text-gold">Local development only</p>
          <label htmlFor="dev-email" className="mt-2 block text-sm text-haze">Sign in as a seeded person</label>
          <input id="dev-email" name="email" type="email" required placeholder="admin@smcc.test" className="mt-1 w-full rounded border border-gold/30 bg-night p-2.5 text-sand" />
          <button className="mt-3 rounded-full border border-gold/60 px-5 py-2 text-sm hover:border-flamingo">Dev sign in</button>
        </form>
      )}
    </div>
  );
}
