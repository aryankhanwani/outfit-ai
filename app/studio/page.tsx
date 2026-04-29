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
    <main className="min-h-screen bg-[#07070f] text-[#f2ede4]">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl gap-4 px-4 py-4 sm:px-6 lg:px-8">
        {/* Sidebar */}
        <aside className="hidden w-[280px] shrink-0 lg:block">
          <div className="sticky top-4 flex h-[calc(100vh-2rem)] flex-col rounded-[28px] border border-white/[0.07] bg-[#0d0d1c] p-4 shadow-[0_20px_80px_rgba(0,0,0,0.35)]">
            <div className="mb-6 px-2 pt-2">
              <a href="/" className="inline-flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-[#1bcea8]" />
                <span className="text-lg font-semibold tracking-[-0.03em]">
                  OutfitAI
                </span>
              </a>

              <p className="mt-2 text-xs leading-5 text-[#8b8ba0]">
                AI try-on workspace for generating launch-ready outfit visuals.
              </p>
            </div>

            <nav className="space-y-1">
              <a
                href="/studio"
                className="flex items-center justify-between rounded-2xl border border-[#1bcea8]/25 bg-[#1bcea8]/10 px-4 py-3 text-sm font-semibold text-[#1bcea8]"
              >
                Studio
                <span className="h-1.5 w-1.5 rounded-full bg-[#1bcea8]" />
              </a>

              <a
                href="/account"
                className="flex items-center rounded-2xl px-4 py-3 text-sm font-semibold text-[#8b8ba0] transition hover:bg-[#12121f] hover:text-[#f2ede4]"
              >
                Account
              </a>

              <a
                href="/pricing"
                className="flex items-center rounded-2xl px-4 py-3 text-sm font-semibold text-[#8b8ba0] transition hover:bg-[#12121f] hover:text-[#f2ede4]"
              >
                Pricing
              </a>
            </nav>

            <div className="mt-6 space-y-3">
              <div className="rounded-2xl border border-white/[0.07] bg-[#12121f] p-4">
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#555570]">
                  Credits
                </p>
                <div className="mt-2 flex items-end justify-between gap-3">
                  <p className="text-3xl font-semibold tracking-[-0.03em] text-[#f2ede4]">
                    {credits ?? "—"}
                  </p>
                  <span className="mb-1 rounded-full border border-[#1bcea8]/25 bg-[#1bcea8]/10 px-2.5 py-1 text-xs font-semibold text-[#1bcea8]">
                    Available
                  </span>
                </div>
              </div>

              <BuyCredits />
            </div>

            <div className="mt-auto space-y-3 border-t border-white/[0.07] pt-4">
              <div className="rounded-2xl bg-[#12121f] p-4">
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#555570]">
                  Signed in as
                </p>
                <p className="mt-2 truncate text-sm font-semibold text-[#f2ede4]">
                  {user?.email ?? "Not signed in"}
                </p>
              </div>

              <form action="/api/auth/logout" method="post">
                <button
                  type="submit"
                  className="flex min-h-11 w-full items-center justify-center rounded-full border border-white/[0.07] bg-transparent px-5 text-sm font-semibold text-[#f2ede4] transition hover:border-[#1bcea8]/40 hover:bg-[#12121f]"
                >
                  Log out
                </button>
              </form>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <section className="min-w-0 flex-1">
          <div className="mb-4 flex flex-col gap-4 rounded-[28px] border border-white/[0.07] bg-[#0d0d1c] p-4 shadow-[0_20px_80px_rgba(0,0,0,0.28)] sm:p-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#1bcea8]">
                Studio
              </p>
              <h1 className="mt-1 text-2xl font-semibold tracking-[-0.03em] text-[#f2ede4]">
                Create outfit visuals
              </h1>
              <p className="mt-1 text-sm text-[#8b8ba0]">
                Upload your source images, generate, and download polished
                results.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 lg:hidden">
              <div className="rounded-full border border-[#1bcea8]/25 bg-[#1bcea8]/10 px-4 py-2 text-sm font-semibold text-[#1bcea8]">
                {credits ?? "—"} credits
              </div>

              <a
                href="/account"
                className="inline-flex min-h-10 items-center justify-center rounded-full border border-white/[0.07] bg-[#12121f] px-5 text-sm font-semibold text-[#f2ede4]"
              >
                Account
              </a>
            </div>
          </div>

          <div className="rounded-[28px] border border-white/[0.07] bg-[#0d0d1c] p-4 shadow-[0_20px_80px_rgba(0,0,0,0.35)] sm:p-6">
            <TryOnStudio />
          </div>
        </section>
      </div>
    </main>
  );
}