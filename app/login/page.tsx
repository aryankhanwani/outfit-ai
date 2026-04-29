"use client";

import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [mode, setMode] = useState<"login" | "signup">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "busy">("idle");
  const [message, setMessage] = useState<string | null>(null);

  const busy = status === "busy";

  const authRedirectTo =
    typeof window === "undefined"
      ? undefined
      : `${window.location.origin}/auth/callback`;

  const onGoogle = async () => {
    setMessage(null);
    setStatus("busy");
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: authRedirectTo },
    });
    if (error) setMessage(error.message);
    setStatus("idle");
  };

  const onEmail = async () => {
    setMessage(null);
    setStatus("busy");
    const supabase = createSupabaseBrowserClient();
    try {
      if (!email.trim() || !password) {
        throw new Error("Enter email and password.");
      }

      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { emailRedirectTo: authRedirectTo },
        });
        if (error) throw error;
        setMessage("Check your email to confirm your account, then come back.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) throw error;
        window.location.href = "/studio";
      }
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setStatus("idle");
    }
  };

  return (
    <div className="min-h-screen bg-(--page-bg)">
      <div className="mx-auto flex w-full max-w-xl flex-col px-4 pb-24 pt-14 sm:px-6">
        <a
          href="/"
          className="mb-8 inline-flex items-center gap-2 self-center text-sm font-semibold text-zinc-800 hover:text-zinc-900 dark:text-zinc-200 dark:hover:text-white"
        >
          <span className="text-lg">←</span> Back to home
        </a>

        <div className="rounded-3xl border border-zinc-200/80 bg-white/70 p-6 shadow-sm backdrop-blur sm:p-10 dark:border-zinc-800 dark:bg-zinc-950/50">
          <h1 className="text-balance text-2xl font-semibold tracking-tight text-zinc-900 dark:text-white">
            {mode === "signup" ? "Create your account" : "Welcome back"}
          </h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Sign in to access the studio, track credits, and purchase plans.
          </p>

          <div className="mt-6 grid gap-3">
            <button
              type="button"
              disabled={busy}
              onClick={() => void onGoogle()}
              className="inline-flex min-h-12 items-center justify-center rounded-xl border border-zinc-200 bg-white px-4 text-sm font-semibold text-zinc-800 shadow-sm transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:hover:bg-zinc-900"
            >
              Continue with Google
            </button>

            <div className="my-2 flex items-center gap-3">
              <div className="h-px flex-1 bg-zinc-200/80 dark:bg-zinc-800" />
              <span className="text-xs text-zinc-500">or</span>
              <div className="h-px flex-1 bg-zinc-200/80 dark:bg-zinc-800" />
            </div>

            <div className="flex rounded-xl border border-zinc-200 bg-white/70 p-1 dark:border-zinc-800 dark:bg-zinc-950/40">
              <button
                type="button"
                onClick={() => setMode("signup")}
                className={`flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition ${
                  mode === "signup"
                    ? "bg-violet-600 text-white"
                    : "text-zinc-700 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white"
                }`}
              >
                Sign up
              </button>
              <button
                type="button"
                onClick={() => setMode("login")}
                className={`flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition ${
                  mode === "login"
                    ? "bg-violet-600 text-white"
                    : "text-zinc-700 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white"
                }`}
              >
                Log in
              </button>
            </div>

            <label className="grid gap-2">
              <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                Email
              </span>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={busy}
                inputMode="email"
                autoComplete="email"
                placeholder="you@example.com"
                className="min-h-12 rounded-xl border border-zinc-200 bg-white/80 px-4 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 disabled:opacity-60 dark:border-zinc-800 dark:bg-zinc-950/40 dark:text-zinc-100 dark:placeholder:text-zinc-500"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                Password
              </span>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={busy}
                type="password"
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
                placeholder="••••••••"
                className="min-h-12 rounded-xl border border-zinc-200 bg-white/80 px-4 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 disabled:opacity-60 dark:border-zinc-800 dark:bg-zinc-950/40 dark:text-zinc-100 dark:placeholder:text-zinc-500"
              />
            </label>

            <button
              type="button"
              disabled={busy}
              onClick={() => void onEmail()}
              className="mt-2 inline-flex min-h-12 items-center justify-center rounded-xl bg-violet-600 px-4 text-sm font-semibold text-white shadow-lg shadow-violet-600/25 transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {busy
                ? "Please wait…"
                : mode === "signup"
                  ? "Create account"
                  : "Log in"}
            </button>

            {message && (
              <div className="mt-2 rounded-xl border border-zinc-200/80 bg-white/70 px-4 py-3 text-sm text-zinc-700 dark:border-zinc-800 dark:bg-zinc-950/40 dark:text-zinc-200">
                {message}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

