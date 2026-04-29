"use client";

import { Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { PLANS, priceFor, type BillingInterval } from "@/lib/plans";

function PricingInner() {
  const search = useSearchParams();
  const interval = (search.get("interval") === "annual"
    ? "annual"
    : "monthly") as BillingInterval;
  const toggleHref = (next: BillingInterval) => `/pricing?interval=${next}`;
  const plans = useMemo(() => PLANS, []);

  return (
    <div className="min-h-screen bg-(--page-bg)">
      <div className="mx-auto w-full max-w-6xl px-4 pb-20 pt-10 sm:px-6 lg:px-8">
        <header className="text-center">
          <p className="text-sm font-medium uppercase tracking-widest text-violet-600 dark:text-violet-400">
            Pricing
          </p>
          <h1 className="mt-2 text-balance text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl dark:text-white">
            Simple, credit-based plans
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-pretty text-base text-zinc-600 dark:text-zinc-400">
            Each generated image costs 1 credit. Try-on typically uses 1 credit per
            result. Cloth ideas cost 1 credit per generated concept.
          </p>

          <div className="mt-7 inline-flex rounded-full border border-zinc-200 bg-white/70 p-1 text-sm font-semibold shadow-sm backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/50">
            <a
              href={toggleHref("monthly")}
              className={`rounded-full px-4 py-2 transition ${
                interval === "monthly"
                  ? "bg-violet-600 text-white"
                  : "text-zinc-700 hover:text-zinc-900 dark:text-zinc-200 dark:hover:text-white"
              }`}
            >
              Monthly
            </a>
            <a
              href={toggleHref("annual")}
              className={`rounded-full px-4 py-2 transition ${
                interval === "annual"
                  ? "bg-violet-600 text-white"
                  : "text-zinc-700 hover:text-zinc-900 dark:text-zinc-200 dark:hover:text-white"
              }`}
            >
              Annual <span className="ml-1 text-xs opacity-80">(2 months free)</span>
            </a>
          </div>
        </header>

        <section className="mt-10 grid gap-6 lg:grid-cols-3">
          {plans.map((p) => {
            const price = priceFor(p, interval);
            const perMonth =
              interval === "annual" ? Math.round((price / 12) * 100) / 100 : price;
            return (
              <div
                key={p.id}
                className={`relative rounded-3xl border bg-white/70 p-6 shadow-sm backdrop-blur sm:p-8 dark:bg-zinc-950/50 ${
                  p.highlight
                    ? "border-violet-300 shadow-violet-600/10 dark:border-violet-500/40"
                    : "border-zinc-200/80 dark:border-zinc-800"
                }`}
              >
                {p.highlight && (
                  <div className="absolute -top-3 left-6 rounded-full bg-violet-600 px-3 py-1 text-xs font-semibold text-white shadow">
                    Most popular
                  </div>
                )}
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                  {p.name}
                </h2>
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                  {p.tagline}
                </p>

                <div className="mt-6 flex items-end gap-2">
                  <div className="text-4xl font-semibold tracking-tight text-zinc-900 dark:text-white">
                    ${perMonth}
                  </div>
                  <div className="pb-1 text-sm text-zinc-500 dark:text-zinc-400">
                    / month
                  </div>
                </div>
                <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                  {p.creditsPerMonth} credits included
                </p>

                <a
                  href={`/studio?buy=${p.id}&interval=${interval}`}
                  className={`mt-6 inline-flex min-h-11 w-full items-center justify-center rounded-full px-6 text-sm font-semibold shadow-sm transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500 ${
                    p.highlight
                      ? "bg-violet-600 text-white hover:bg-violet-500 shadow-violet-600/25"
                      : "border border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:hover:bg-zinc-900"
                  }`}
                >
                  Choose {p.name} (Razorpay)
                </a>

                <ul className="mt-6 space-y-2 text-sm text-zinc-700 dark:text-zinc-300">
                  {p.features.map((f) => (
                    <li key={f} className="flex gap-2">
                      <span className="mt-0.5 h-4 w-4 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </section>

        <footer className="mt-14 text-center text-xs text-zinc-500 dark:text-zinc-500">
          Payments are processed by Razorpay. Credits renew monthly on active
          subscriptions (implementation can be extended for recurring billing).
        </footer>
      </div>
    </div>
  );
}

export default function PricingPage() {
  return (
    <Suspense>
      <PricingInner />
    </Suspense>
  );
}

