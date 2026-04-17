"use client";

const STEPS = [
  { label: "Reading your references", hint: "Short captions from both photos" },
  { label: "Generating with FLUX.2", hint: "Image-to-image · Replicate" },
  { label: "Finishing up", hint: "Almost there" },
];

const TIPS = [
  "High-resolution output takes a moment—we’re building the scene from your captions and prompt.",
  "Good lighting in your photo helps the outfit read more naturally.",
  "You can tweak the optional prompt to change background or vibe.",
  "If it’s slow, the inference queue may be busy—hang tight, it’s still working.",
];

type Props = {
  activeStep: number;
  progress: number;
  elapsedSec: number;
  tipIndex: number;
};

export function GenerationProgress({
  activeStep,
  progress,
  elapsedSec,
  tipIndex,
}: Props) {
  const safeStep = Math.min(Math.max(activeStep, 0), STEPS.length - 1);
  const pct = Math.min(100, Math.max(0, progress));
  const tip = TIPS[tipIndex % TIPS.length];

  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className="relative overflow-hidden rounded-2xl border border-violet-200/80 bg-white/95 p-6 shadow-lg shadow-violet-500/10 ring-1 ring-violet-500/5 dark:border-violet-500/20 dark:bg-zinc-950/90 dark:ring-violet-400/10"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35] dark:opacity-25"
        style={{
          background:
            "linear-gradient(110deg, transparent 40%, rgba(139, 92, 246, 0.12) 50%, transparent 60%)",
          backgroundSize: "200% 100%",
          animation: "generation-shimmer 2.2s ease-in-out infinite",
        }}
      />

      <div className="relative flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="relative flex h-14 w-14 shrink-0 items-center justify-center">
            <span
              className="absolute inset-0 rounded-2xl bg-violet-500/15 dark:bg-violet-400/10"
              style={{ animation: "generation-pulse 1.6s ease-in-out infinite" }}
            />
            <div
              className="h-8 w-8 rounded-full border-2 border-violet-200/80 border-t-violet-600 dark:border-violet-500/30 dark:border-t-violet-300"
              style={{ animation: "generation-spin 0.75s linear infinite" }}
              aria-hidden
            />
          </div>
          <div>
            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
              Creating your try-on
            </p>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              {STEPS[safeStep].label}
              <span className="text-zinc-400 dark:text-zinc-500">
                {" · "}
                {STEPS[safeStep].hint}
              </span>
            </p>
            <ol className="mt-4 flex flex-wrap gap-2">
              {STEPS.map((s, i) => (
                <li key={s.label}>
                  <span
                    className={
                      i <= safeStep
                        ? "inline-flex items-center rounded-full bg-violet-600/10 px-2.5 py-1 text-xs font-medium text-violet-800 dark:bg-violet-400/15 dark:text-violet-200"
                        : "inline-flex items-center rounded-full bg-zinc-100 px-2.5 py-1 text-xs text-zinc-500 dark:bg-zinc-800 dark:text-zinc-500"
                    }
                  >
                    {i + 1}. {s.label.split(" ")[0]}
                    {i < safeStep ? " ✓" : i === safeStep ? " …" : ""}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </div>
        <div className="text-right sm:pt-0.5">
          <p className="text-2xl font-semibold tabular-nums text-zinc-900 dark:text-zinc-50">
            {elapsedSec}s
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">elapsed</p>
        </div>
      </div>

      <div className="relative mt-5">
        <div className="h-2.5 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
          <div
            className="h-full rounded-full bg-linear-to-r from-violet-500 via-fuchsia-500 to-violet-500 transition-[width] duration-300 ease-out"
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="mt-2 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
          <span>{Math.round(pct)}% · stay on this page</span>
          <span className="max-w-[min(100%,280px)] truncate text-right text-zinc-600 dark:text-zinc-500">
            Tip: {tip}
          </span>
        </div>
      </div>
    </div>
  );
}
