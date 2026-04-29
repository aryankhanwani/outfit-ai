import { createSupabaseServerClient } from "@/lib/supabase/server";
import { TryOnStudio } from "@/components/TryOnStudio";
import { BuyCredits } from "@/components/BuyCredits";

export default async function StudioPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

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
    <main className="min-h-screen bg-(--page-bg)">
      <div className="mx-auto w-full max-w-6xl px-4 pb-20 pt-10 sm:px-6 lg:px-8">
        <header className="mb-8 rounded-3xl border border-zinc-200/60 bg-(--surface) p-6 shadow-sm dark:border-zinc-800/60 dark:bg-(--surface)">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-600 dark:text-violet-400">
                Internal Studio
              </p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900 dark:text-white">
                Generate polished outfit previews
              </h1>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
                Keep inputs clear, generate quickly, and review one final output.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:w-[420px]">
              <div className="rounded-2xl border border-zinc-200/70 bg-(--surface-strong) p-4 dark:border-zinc-800">
                <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                  Account
                </p>
                <p className="mt-1 truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  {user?.email ?? "Not signed in"}
                </p>
              </div>
              <div className="rounded-2xl border border-zinc-200/70 bg-(--surface-strong) p-4 dark:border-zinc-800">
                <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                  Credits
                </p>
                <p className="mt-1 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  {credits ?? "—"}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <BuyCredits />
            <a
              href="/account"
              className="inline-flex min-h-10 items-center justify-center rounded-full border border-zinc-200 bg-white/70 px-5 text-sm font-semibold text-zinc-800 transition hover:bg-white dark:border-zinc-700 dark:bg-zinc-950/50 dark:text-zinc-100 dark:hover:bg-zinc-950"
            >
              Account
            </a>
            <form action="/api/auth/logout" method="post">
              <button
                type="submit"
                className="inline-flex min-h-10 items-center justify-center rounded-full border border-zinc-200 bg-white/70 px-5 text-sm font-semibold text-zinc-800 transition hover:bg-white dark:border-zinc-700 dark:bg-zinc-950/50 dark:text-zinc-100 dark:hover:bg-zinc-950"
              >
                Log out
              </button>
            </form>
          </div>
        </header>

        <TryOnStudio />
      </div>
    </main>
  );
}
