"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { PLANS, type BillingInterval, type PlanId, priceFor } from "@/lib/plans";

declare global {
  interface Window {
    Razorpay?: any;
  }
}

function loadRazorpayScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") return resolve();
    if (window.Razorpay) return resolve();
    const existing = document.querySelector<HTMLScriptElement>(
      'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
    );
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("Failed to load Razorpay")));
      return;
    }
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Failed to load Razorpay"));
    document.head.appendChild(s);
  });
}

export function BuyCredits(props: { defaultPlan?: PlanId; defaultInterval?: BillingInterval }) {
  const search = useSearchParams();
  const initialPlan = (props.defaultPlan ??
    (search.get("buy") as PlanId | null) ??
    "creator") as PlanId;
  const initialInterval = (props.defaultInterval ??
    (search.get("interval") as BillingInterval | null) ??
    "monthly") as BillingInterval;

  const [open, setOpen] = useState(false);
  const [planId, setPlanId] = useState<PlanId>(initialPlan);
  const [interval, setInterval] = useState<BillingInterval>(
    initialInterval === "annual" ? "annual" : "monthly"
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const plan = useMemo(() => PLANS.find((p) => p.id === planId)!, [planId]);
  const usd = priceFor(plan, interval);
  const credits = interval === "annual" ? plan.creditsPerMonth * 12 : plan.creditsPerMonth;

  const startCheckout = async () => {
    setError(null);
    setBusy(true);
    try {
      await loadRazorpayScript();

      const orderRes = await fetch("/api/billing/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId, interval }),
      });
      const orderJson = (await orderRes.json().catch(() => ({}))) as any;
      if (!orderRes.ok) {
        throw new Error(orderJson.error || `Order failed (${orderRes.status})`);
      }

      const options = {
        key: orderJson.keyId,
        amount: String(orderJson.amount),
        currency: orderJson.currency,
        name: "OutfitAI",
        description: `${plan.name} (${interval}) — ${credits} credits`,
        order_id: orderJson.orderId,
        handler: async (response: any) => {
          const verifyRes = await fetch("/api/billing/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              planId,
              interval,
            }),
          });
          const verifyJson = (await verifyRes.json().catch(() => ({}))) as any;
          if (!verifyRes.ok) {
            throw new Error(verifyJson.error || `Verify failed (${verifyRes.status})`);
          }
          window.location.reload();
        },
        theme: { color: "#7c3aed" },
      };

      // eslint-disable-next-line new-cap
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Payment failed.");
    } finally {
      setBusy(false);
    }
  };

  // Auto-open checkout if user came from Pricing "Choose" CTA.
  useEffect(() => {
    if (search.get("buy")) {
      setOpen(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="w-full">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex min-h-10 items-center justify-center rounded-full bg-violet-600 px-5 text-sm font-semibold text-white shadow-lg shadow-violet-600/25 transition hover:bg-violet-500"
      >
        Add credits
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => (busy ? null : setOpen(false))}
          />
          <div className="relative w-full max-w-lg rounded-3xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-800 dark:bg-zinc-950">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
                  Buy credits
                </h3>
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                  Choose a plan and pay via Razorpay.
                </p>
              </div>
              <button
                type="button"
                disabled={busy}
                onClick={() => setOpen(false)}
                className="rounded-full border border-zinc-200 px-3 py-1 text-sm font-semibold text-zinc-800 hover:bg-zinc-50 disabled:opacity-60 dark:border-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-900"
              >
                Close
              </button>
            </div>

            <div className="mt-5 flex rounded-full border border-zinc-200 bg-white/70 p-1 text-sm font-semibold dark:border-zinc-800 dark:bg-zinc-950/40">
              <button
                type="button"
                onClick={() => setInterval("monthly")}
                className={`flex-1 rounded-full px-3 py-2 transition ${
                  interval === "monthly"
                    ? "bg-violet-600 text-white"
                    : "text-zinc-700 hover:text-zinc-900 dark:text-zinc-200 dark:hover:text-white"
                }`}
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => setInterval("annual")}
                className={`flex-1 rounded-full px-3 py-2 transition ${
                  interval === "annual"
                    ? "bg-violet-600 text-white"
                    : "text-zinc-700 hover:text-zinc-900 dark:text-zinc-200 dark:hover:text-white"
                }`}
              >
                Annual
              </button>
            </div>

            <div className="mt-5 grid gap-3">
              {PLANS.map((p) => {
                const selected = p.id === planId;
                const pUsd = priceFor(p, interval);
                const pCredits =
                  interval === "annual" ? p.creditsPerMonth * 12 : p.creditsPerMonth;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPlanId(p.id)}
                    className={`rounded-2xl border p-4 text-left transition ${
                      selected
                        ? "border-violet-400 bg-violet-50/40 dark:border-violet-500/50 dark:bg-violet-950/20"
                        : "border-zinc-200 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900/30"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                        {p.name}
                      </div>
                      <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                        ${pUsd}
                      </div>
                    </div>
                    <div className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
                      {pCredits} credits
                    </div>
                  </button>
                );
              })}
            </div>

            {error && (
              <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-200">
                {error}
              </div>
            )}

            <button
              type="button"
              disabled={busy}
              onClick={() => void startCheckout()}
              className="mt-5 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-violet-600 px-6 text-sm font-semibold text-white shadow-lg shadow-violet-600/25 transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {busy ? "Opening Razorpay…" : `Pay $${usd} for ${credits} credits`}
            </button>
            <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-500">
              Charged in INR via Razorpay using a USD→INR conversion rate from server
              config.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

