import { createSupabaseServerClient } from "@/lib/supabase/server";
import { TryOnStudio } from "@/components/TryOnStudio";
import { BuyCredits } from "@/components/BuyCredits";

export default async function StudioPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Ensure a profile row exists (works with RLS policies in the SQL below).
  let credits: number | null = null;
  if (user) {
    await supabase
      .from("profiles")
      .upsert(
        { id: user.id, email: user.email ?? null },
        { onConflict: "id", ignoreDuplicates: false }
      );
    const { data } = await supabase
      .from("profiles")
      .select("credits")
      .eq("id", user.id)
      .maybeSingle();
    credits = typeof data?.credits === "number" ? data.credits : null;
  }

  return (
    <div className="min-h-screen bg-(--page-bg)">
      <div className="mx-auto w-full max-w-6xl px-4 pb-20 pt-10 sm:px-6 lg:px-8">
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-white">
              Studio
            </h1>
          </div>
          <div className="flex flex-col items-start gap-2 sm:items-end">
            <div className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Signed in as{" "}
              <span className="font-semibold text-zinc-900 dark:text-zinc-50">
                {user?.email}
              </span>
            </div>
            <div className="text-sm text-zinc-600 dark:text-zinc-400">
              Credits:{" "}
              <span className="font-semibold text-zinc-900 dark:text-zinc-50">
                {credits ?? "—"}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <BuyCredits />
              <a
                href="/account"
                className="inline-flex min-h-10 items-center justify-center rounded-full border border-zinc-200 bg-white/70 px-5 text-sm font-semibold text-zinc-800 shadow-sm backdrop-blur transition hover:bg-white dark:border-zinc-800 dark:bg-zinc-950/50 dark:text-zinc-100 dark:hover:bg-zinc-950"
              >
                Profile
              </a>
            </div>
            <form action="/api/auth/logout" method="post">
              <button
                type="submit"
                className="inline-flex min-h-10 items-center justify-center rounded-full border border-zinc-200 bg-white/70 px-5 text-sm font-semibold text-zinc-800 shadow-sm backdrop-blur transition hover:bg-white dark:border-zinc-800 dark:bg-zinc-950/50 dark:text-zinc-100 dark:hover:bg-zinc-950"
              >
                Log out
              </button>
            </form>
          </div>
        </header>

        <TryOnStudio />
      </div>
    </div>
  );
}

