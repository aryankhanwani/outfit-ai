import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function AccountPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = user
    ? await supabase
        .from("profiles")
        .select("email, credits, created_at")
        .eq("id", user.id)
        .maybeSingle()
    : { data: null as any };

  const { data: purchases } = user
    ? await supabase
        .from("purchases")
        .select("created_at, plan_id, interval, status, credits_granted")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10)
    : { data: [] as any[] };

  return (
    <div className="bg-(--page-bg)">
      <div className="mx-auto w-full max-w-6xl px-4 pb-20 pt-10 sm:px-6 lg:px-8">
        <header className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-white">
            Profile
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Account details and recent purchases.
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-3">
          <section className="rounded-3xl border border-zinc-200/60 bg-(--surface) p-6 shadow-sm backdrop-blur dark:border-zinc-800/60 dark:bg-(--surface) lg:col-span-1">
            <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
              Account
            </div>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between gap-3">
                <span className="text-zinc-500 dark:text-zinc-500">Email</span>
                <span className="font-semibold text-zinc-900 dark:text-zinc-50">
                  {user?.email ?? profile?.email ?? "—"}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-zinc-500 dark:text-zinc-500">Credits</span>
                <span className="font-semibold text-zinc-900 dark:text-zinc-50">
                  {typeof profile?.credits === "number" ? profile.credits : "—"}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-zinc-500 dark:text-zinc-500">Joined</span>
                <span className="font-semibold text-zinc-900 dark:text-zinc-50">
                  {profile?.created_at
                    ? new Date(profile.created_at).toLocaleDateString()
                    : "—"}
                </span>
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <a
                href="/studio"
                className="inline-flex min-h-10 flex-1 items-center justify-center rounded-full bg-violet-600 px-5 text-sm font-semibold text-white shadow-lg shadow-violet-600/25 transition hover:bg-violet-500"
              >
                Go to studio
              </a>
              <form action="/api/auth/logout" method="post" className="flex-1">
                <button
                  type="submit"
                  className="inline-flex min-h-10 w-full items-center justify-center rounded-full border border-zinc-200/70 bg-(--surface-strong) px-5 text-sm font-semibold text-zinc-900 shadow-sm transition hover:bg-white dark:border-zinc-800/70 dark:bg-(--surface-strong) dark:text-zinc-100 dark:hover:bg-zinc-950"
                >
                  Log out
                </button>
              </form>
            </div>
          </section>

          <section className="rounded-3xl border border-zinc-200/60 bg-(--surface) p-6 shadow-sm backdrop-blur dark:border-zinc-800/60 dark:bg-(--surface) lg:col-span-2">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                  Recent purchases
                </div>
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                  Last 10 credit top-ups.
                </p>
              </div>
              <a
                href="/pricing"
                className="inline-flex min-h-9 items-center justify-center rounded-full border border-zinc-200/70 bg-(--surface-strong) px-4 text-sm font-semibold text-zinc-900 shadow-sm transition hover:bg-white dark:border-zinc-800/70 dark:bg-(--surface-strong) dark:text-zinc-100 dark:hover:bg-zinc-950"
              >
                Buy credits
              </a>
            </div>

            <div className="mt-5 overflow-hidden rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60">
              <div className="grid grid-cols-5 gap-2 bg-(--surface-strong) px-4 py-3 text-xs font-semibold uppercase tracking-widest text-zinc-500 dark:bg-(--surface-strong) dark:text-zinc-500">
                <div>Date</div>
                <div>Plan</div>
                <div>Interval</div>
                <div>Status</div>
                <div className="text-right">Credits</div>
              </div>
              <div className="divide-y divide-zinc-200/60 dark:divide-zinc-800/60">
                {(purchases ?? []).length > 0 ? (
                  (purchases ?? []).map((p) => (
                    <div
                      key={`${p.created_at}-${p.plan_id}-${p.interval}`}
                      className="grid grid-cols-5 gap-2 px-4 py-3 text-sm text-zinc-700 dark:text-zinc-300"
                    >
                      <div className="text-zinc-600 dark:text-zinc-400">
                        {p.created_at
                          ? new Date(p.created_at).toLocaleDateString()
                          : "—"}
                      </div>
                      <div className="font-semibold text-zinc-900 dark:text-zinc-50">
                        {p.plan_id ?? "—"}
                      </div>
                      <div className="text-zinc-600 dark:text-zinc-400">
                        {p.interval ?? "—"}
                      </div>
                      <div className="text-zinc-600 dark:text-zinc-400">
                        {p.status ?? "—"}
                      </div>
                      <div className="text-right font-semibold text-zinc-900 dark:text-zinc-50">
                        +{p.credits_granted ?? 0}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-10 text-center text-sm text-zinc-600 dark:text-zinc-400">
                    No purchases yet.
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

