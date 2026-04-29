export default function Home() {
  return (
    <div className="bg-(--page-bg)">
      <div className="mx-auto w-full max-w-6xl px-4 pb-20 pt-16 sm:px-6 lg:px-8">
        {/* Hero */}
        <header className="relative overflow-hidden rounded-4xl border border-zinc-200/60 bg-(--surface) px-6 py-12 shadow-sm backdrop-blur sm:px-10 sm:py-16 dark:border-zinc-800/60 dark:bg-(--surface)">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200/60 bg-(--surface-strong) px-4 py-2 text-xs font-semibold text-zinc-700 shadow-sm dark:border-zinc-800/70 dark:bg-(--surface-strong) dark:text-zinc-200">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Fast virtual try-on · Cloth ideas
            </div>

            <h1 className="mt-6 text-balance text-4xl font-semibold tracking-tight text-zinc-900 sm:text-6xl dark:text-white">
              See what looks good before you buy.
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-pretty text-base text-zinc-600 sm:text-lg dark:text-zinc-400">
              Two modes: try-on with your photo + garment, or generate style ideas
              from a fabric image. Clean results, fast turnaround, credit-based.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <a
                href="/studio"
                className="inline-flex min-h-12 min-w-[220px] items-center justify-center rounded-full bg-violet-600 px-8 text-sm font-semibold text-white shadow-lg shadow-violet-600/25 transition hover:bg-violet-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500"
              >
                Start in Studio
              </a>
              <a
                href="/pricing"
                className="inline-flex min-h-12 min-w-[220px] items-center justify-center rounded-full border border-zinc-200/70 bg-(--surface-strong) px-8 text-sm font-semibold text-zinc-900 shadow-sm backdrop-blur transition hover:bg-white dark:border-zinc-800/70 dark:bg-(--surface-strong) dark:text-zinc-100 dark:hover:bg-zinc-950"
              >
                View pricing
              </a>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {[
                { k: "Speed", v: "Optimized for fast edits" },
                { k: "Quality", v: "Single clean output (no collage)" },
                { k: "Simple", v: "Credits + one-click top-up" },
              ].map((s) => (
                <div
                  key={s.k}
                  className="rounded-2xl border border-zinc-200/60 bg-(--surface-strong) p-4 text-left shadow-sm dark:border-zinc-800/60 dark:bg-(--surface-strong)"
                >
                  <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                    {s.k}
                  </div>
                  <div className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                    {s.v}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </header>

        {/* Social proof */}
        <section className="mt-12">
          <div className="grid gap-6 rounded-3xl border border-zinc-200/60 bg-(--surface) p-6 shadow-sm backdrop-blur sm:grid-cols-3 sm:p-8 dark:border-zinc-800/60 dark:bg-(--surface)">
            {[
              { title: "Try-on", desc: "Person + garment → unified image" },
              { title: "Cloth ideas", desc: "Fabric → t-shirt, shirt, hoodie styles" },
              { title: "On you (optional)", desc: "Add your photo to cloth ideas" },
            ].map((f) => (
              <div key={f.title}>
                <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                  {f.title}
                </div>
                <div className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                  {f.desc}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section className="mt-14">
          <div className="text-center">
            <div className="text-sm font-semibold uppercase tracking-widest text-violet-600 dark:text-violet-400">
              How it works
            </div>
            <h2 className="mt-2 text-balance text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl dark:text-white">
              Upload → choose → generate
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm text-zinc-600 dark:text-zinc-400">
              Designed to keep the workflow simple so you get results quickly.
            </p>
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-3">
            {[
              {
                step: "01",
                title: "Pick a mode",
                desc: "Try-on for fit preview, Cloth ideas for style exploration.",
              },
              {
                step: "02",
                title: "Upload images",
                desc: "Use clear photos. Add your photo to Cloth ideas if you want it on you.",
              },
              {
                step: "03",
                title: "Generate",
                desc: "One clean output image, delivered from CDN for speed.",
              },
            ].map((s) => (
              <div
                key={s.step}
                className="rounded-3xl border border-zinc-200/60 bg-(--surface) p-6 shadow-sm backdrop-blur dark:border-zinc-800/60 dark:bg-(--surface)"
              >
                <div className="text-xs font-semibold text-zinc-500 dark:text-zinc-500">
                  {s.step}
                </div>
                <div className="mt-2 text-base font-semibold text-zinc-900 dark:text-zinc-50">
                  {s.title}
                </div>
                <div className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                  {s.desc}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Feature grid */}
        <section className="mt-14">
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-3xl border border-zinc-200/60 bg-(--surface) p-8 shadow-sm backdrop-blur dark:border-zinc-800/60 dark:bg-(--surface)">
              <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
                Made for real shopping decisions
              </h3>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                Keep identity and drape realistic. Avoid split-screen junk outputs.
              </p>
              <ul className="mt-6 space-y-3 text-sm text-zinc-700 dark:text-zinc-300">
                {[
                  "Clean, single-frame outputs",
                  "Fast turnaround",
                  "Optional prompts + quick styles",
                  "Credit-based usage",
                ].map((t) => (
                  <li key={t} className="flex gap-3">
                    <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-3xl border border-zinc-200/60 bg-(--surface) p-8 shadow-sm backdrop-blur dark:border-zinc-800/60 dark:bg-(--surface)">
              <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
                Built for creators & teams
              </h3>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                Keep workflows snappy with a polished studio UX and payments.
              </p>
              <ul className="mt-6 space-y-3 text-sm text-zinc-700 dark:text-zinc-300">
                {[
                  "Supabase auth (Google + email)",
                  "Razorpay top-ups",
                  "Profile + credit tracking",
                  "Expandable to webhooks/analytics",
                ].map((t) => (
                  <li key={t} className="flex gap-3">
                    <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-violet-500" />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Pricing CTA */}
        <section className="mt-14 rounded-4xl border border-zinc-200/60 bg-(--surface) p-8 shadow-sm backdrop-blur sm:p-10 dark:border-zinc-800/60 dark:bg-(--surface)">
          <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-white">
                Simple pricing that scales with you
              </h2>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                Choose monthly or annual credits. Top up anytime.
              </p>
            </div>
            <div className="flex gap-3">
              <a
                href="/pricing"
                className="inline-flex min-h-11 items-center justify-center rounded-full bg-violet-600 px-6 text-sm font-semibold text-white shadow-lg shadow-violet-600/25 transition hover:bg-violet-500"
              >
                See pricing
              </a>
              <a
                href="/studio"
                className="inline-flex min-h-11 items-center justify-center rounded-full border border-zinc-200/70 bg-(--surface-strong) px-6 text-sm font-semibold text-zinc-900 shadow-sm transition hover:bg-white dark:border-zinc-800/70 dark:bg-(--surface-strong) dark:text-zinc-100 dark:hover:bg-zinc-950"
              >
                Open studio
              </a>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="mt-14">
          <div className="text-center">
            <div className="text-sm font-semibold uppercase tracking-widest text-violet-600 dark:text-violet-400">
              FAQ
            </div>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl dark:text-white">
              Quick answers
            </h2>
          </div>
          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            {[
              {
                q: "Do you store my images?",
                a: "Images are uploaded for processing and returned from CDN. You can extend this to store history per user.",
              },
              {
                q: "How many credits per image?",
                a: "Currently 1 output image costs 1 credit. You can change this per mode later.",
              },
              {
                q: "Can I generate cloth ideas on my photo?",
                a: "Yes—upload your photo as optional input in Cloth ideas.",
              },
              {
                q: "Do you support annual plans?",
                a: "Yes—toggle annual pricing and purchase via Razorpay top-ups.",
              },
            ].map((f) => (
              <div
                key={f.q}
                className="rounded-3xl border border-zinc-200/60 bg-(--surface) p-6 shadow-sm backdrop-blur dark:border-zinc-800/60 dark:bg-(--surface)"
              >
                <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                  {f.q}
                </div>
                <div className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                  {f.a}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Final CTA */}
        <section className="mt-14 text-center">
          <div className="mx-auto max-w-2xl">
            <h2 className="text-balance text-3xl font-semibold tracking-tight text-zinc-900 dark:text-white">
              Ready to ship better product photos?
            </h2>
            <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
              Log in with Google or email and start generating in minutes.
            </p>
            <div className="mt-7 flex justify-center gap-3">
              <a
                href="/login"
                className="inline-flex min-h-11 items-center justify-center rounded-full bg-zinc-900 px-6 text-sm font-semibold text-white transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
              >
                Log in
              </a>
              <a
                href="/studio"
                className="inline-flex min-h-11 items-center justify-center rounded-full border border-zinc-200/70 bg-(--surface-strong) px-6 text-sm font-semibold text-zinc-900 shadow-sm transition hover:bg-white dark:border-zinc-800/70 dark:bg-(--surface-strong) dark:text-zinc-100 dark:hover:bg-zinc-950"
              >
                Go to studio
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
