const featureCards = [
  {
    title: "Realistic try-on",
    description:
      "Upload your photo and a garment image to preview how the clothing looks on you.",
  },
  {
    title: "Cloth-to-style",
    description:
      "Turn a fabric or product image into polished wearable styles in one click.",
  },
  {
    title: "Fast delivery",
    description:
      "Focused single-image outputs optimized for speed and production use.",
  },
];

const workflowSteps = [
  {
    title: "Choose mode",
    description: "Pick Try-on or Cloth ideas based on your goal.",
  },
  {
    title: "Upload images",
    description: "Use clear images for the most accurate results.",
  },
  {
    title: "Generate",
    description: "Get a clean output image ready to review or share.",
  },
];

export default function Home() {
  return (
    <main className="bg-(--page-bg)">
      <section className="mx-auto w-full max-w-6xl px-4 pb-16 pt-14 sm:px-6 lg:px-8 lg:pt-20">
        <div className="relative overflow-hidden rounded-4xl border border-zinc-200/60 bg-(--surface) px-6 py-12 shadow-sm backdrop-blur sm:px-10 sm:py-16 dark:border-zinc-800/60 dark:bg-(--surface)">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-violet-500/15 to-transparent" />

          <div className="relative mx-auto max-w-3xl text-center">
            <p className="inline-flex items-center gap-2 rounded-full border border-zinc-200/70 bg-(--surface-strong) px-4 py-2 text-xs font-semibold tracking-wide text-zinc-700 dark:border-zinc-700 dark:text-zinc-200">
              AI Outfit Studio
            </p>

            <h1 className="mt-6 text-balance text-4xl font-semibold tracking-tight text-zinc-900 sm:text-6xl dark:text-white">
              Launch-ready visual outfit generation for modern teams.
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-pretty text-base text-zinc-600 sm:text-lg dark:text-zinc-300">
              Create realistic try-on results and cloth-based style concepts with a
              clean workflow designed for production.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <a
                href="/studio"
                className="inline-flex min-h-12 min-w-[220px] items-center justify-center rounded-full bg-violet-600 px-8 text-sm font-semibold text-white shadow-lg shadow-violet-600/25 transition hover:bg-violet-500"
              >
                Open Studio
              </a>
              <a
                href="/pricing"
                className="inline-flex min-h-12 min-w-[220px] items-center justify-center rounded-full border border-zinc-200/80 bg-(--surface-strong) px-8 text-sm font-semibold text-zinc-900 transition hover:bg-white dark:border-zinc-700 dark:bg-zinc-900/70 dark:text-zinc-100 dark:hover:bg-zinc-950"
              >
                View Pricing
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 pb-8 sm:px-6 lg:px-8">
        <div className="grid gap-5 md:grid-cols-3">
          {featureCards.map((card) => (
            <article
              key={card.title}
              className="rounded-3xl border border-zinc-200/60 bg-(--surface) p-6 shadow-sm dark:border-zinc-800/60 dark:bg-(--surface)"
            >
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                {card.title}
              </h2>
              <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
                {card.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 pb-20 pt-6 sm:px-6 lg:px-8">
        <div className="rounded-4xl border border-zinc-200/60 bg-(--surface) p-8 shadow-sm dark:border-zinc-800/60 dark:bg-(--surface) sm:p-10">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-600 dark:text-violet-400">
                Workflow
              </p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
                Minimal steps. High-quality results.
              </h2>
            </div>
            <a
              href="/studio"
              className="inline-flex min-h-11 items-center justify-center self-start rounded-full border border-zinc-200 bg-white/70 px-6 text-sm font-semibold text-zinc-900 transition hover:bg-white dark:border-zinc-700 dark:bg-zinc-950/50 dark:text-zinc-100"
            >
              Start Creating
            </a>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {workflowSteps.map((step, index) => (
              <div
                key={step.title}
                className="rounded-2xl border border-zinc-200/60 bg-(--surface-strong) p-5 dark:border-zinc-800"
              >
                <p className="text-xs font-semibold tracking-wider text-zinc-500">
                  STEP {index + 1}
                </p>
                <h3 className="mt-2 text-base font-semibold text-zinc-900 dark:text-zinc-100">
                  {step.title}
                </h3>
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
