"use client";

import { useCallback, useEffect, useId, useState } from "react";
import { GenerationProgress } from "@/components/GenerationProgress";

type Slot = "person" | "clothing";

type UploadState = {
  file: File | null;
  previewUrl: string | null;
};

const initialSlot: UploadState = {
  file: null,
  previewUrl: null,
};

export function TryOnStudio() {
  const personInputId = useId();
  const clothingInputId = useId();

  const [person, setPerson] = useState<UploadState>(initialSlot);
  const [clothing, setClothing] = useState<UploadState>(initialSlot);
  const [prompt, setPrompt] = useState("");
  const [status, setStatus] = useState<"idle" | "generating" | "done" | "error">(
    "idle"
  );
  const [statusMessage, setStatusMessage] = useState("");
  const [resultDataUrls, setResultDataUrls] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [elapsedSec, setElapsedSec] = useState(0);

  const revokePreview = useCallback((url: string | null) => {
    if (url) URL.revokeObjectURL(url);
  }, []);

  const setSlot = useCallback(
    (slot: Slot, next: UploadState) => {
      if (slot === "person") {
        setPerson((prev) => {
          revokePreview(prev.previewUrl);
          return next;
        });
      } else {
        setClothing((prev) => {
          revokePreview(prev.previewUrl);
          return next;
        });
      }
    },
    [revokePreview]
  );

  const onFile = (slot: Slot, file: File | null) => {
    setStatus("idle");
    setStatusMessage("");
    setError(null);
    setResultDataUrls([]);
    if (!file) {
      setSlot(slot, initialSlot);
      return;
    }
    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file (JPEG, PNG, or WebP).");
      return;
    }
    const previewUrl = URL.createObjectURL(file);
    setSlot(slot, { file, previewUrl });
  };

  const run = async () => {
    setError(null);
    setResultDataUrls([]);
    if (!person.file || !clothing.file) {
      setError("Add both a photo of you and a photo of the clothing.");
      return;
    }

    setStatus("generating");

    const fd = new FormData();
    fd.append("person", person.file);
    fd.append("clothing", clothing.file);
    if (prompt.trim()) {
      fd.append("prompt", prompt.trim());
    }

    try {
      const genRes = await fetch("/api/generate", {
        method: "POST",
        body: fd,
      });

      const genJson = (await genRes.json().catch(() => ({}))) as {
        imageUrl?: string;
        error?: string;
        detail?: string;
      };

      if (!genRes.ok) {
        throw new Error(
          genJson.error ||
            genJson.detail ||
            `Generation failed (${genRes.status})`
        );
      }

      const imageUrl = genJson.imageUrl;
      if (!imageUrl?.startsWith("http")) {
        throw new Error("No image was returned.");
      }

      // Start the CDN fetch immediately so the browser cache is warm before <img> paints.
      const preload = new Image();
      preload.src = imageUrl;
      setResultDataUrls([imageUrl]);
      setStatus("done");
      setStatusMessage("");
    } catch (e) {
      setStatus("error");
      setStatusMessage("");
      setError(e instanceof Error ? e.message : "Something went wrong.");
    }
  };

  const busy = status === "generating";

  useEffect(() => {
    if (!busy) {
      setProgress(0);
      setElapsedSec(0);
      return;
    }

    setProgress(12);
    const started = Date.now();
    const id = window.setInterval(() => {
      setElapsedSec(Math.floor((Date.now() - started) / 1000));
      setProgress((p) => {
        if (p >= 92) return p;
        return Math.min(92, p + Math.max(0.28, (92 - p) * 0.048));
      });
    }, 260);
    return () => window.clearInterval(id);
  }, [busy]);

  const loadingStep =
    status === "generating"
      ? elapsedSec > 18
        ? 2
        : elapsedSec > 6
          ? 1
          : 0
      : 0;

  const tipIndex = Math.floor(elapsedSec / 7) % 4;

  const DropCard = ({
    slot,
    title,
    subtitle,
    inputId,
    state,
  }: {
    slot: Slot;
    title: string;
    subtitle: string;
    inputId: string;
    state: UploadState;
  }) => (
    <div className="group relative flex min-h-[220px] flex-col rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-sm transition hover:border-violet-300/80 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950/50 dark:hover:border-violet-500/40">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            {title}
          </h2>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{subtitle}</p>
        </div>
        {state.file && (
          <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
            Ready
          </span>
        )}
      </div>

      <label
        htmlFor={inputId}
        className="relative mt-auto flex flex-1 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-zinc-300 bg-zinc-50/80 px-4 py-8 text-center transition group-hover:border-violet-400/60 group-hover:bg-violet-50/30 dark:border-zinc-700 dark:bg-zinc-900/40 dark:group-hover:border-violet-500/50 dark:group-hover:bg-violet-950/20"
      >
        <input
          id={inputId}
          name={slot}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          disabled={busy}
          onChange={(e) => {
            const f = e.target.files?.[0] ?? null;
            onFile(slot, f);
            e.target.value = "";
          }}
        />
        {state.previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={state.previewUrl}
            alt=""
            className="max-h-44 w-full rounded-lg object-contain"
          />
        ) : (
          <>
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
              Click to upload or drag an image here
            </span>
            <span className="mt-1 text-xs text-zinc-500">
              JPG, PNG, or WebP · max ~4 MB (Vercel limit)
            </span>
          </>
        )}
      </label>
    </div>
  );

  return (
    <div className="mx-auto w-full max-w-5xl px-4 pb-20 pt-10 sm:px-6 lg:px-8">
      <header className="mb-10 text-center sm:mb-12">
        <p className="text-sm font-medium uppercase tracking-widest text-violet-600 dark:text-violet-400">
          Virtual try-on
        </p>
        <h1 className="mt-2 text-balance text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl dark:text-white">
          See outfits on you before you buy
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-pretty text-base text-zinc-600 dark:text-zinc-400">
          Upload a clear photo of yourself and a photo of the clothing item. We
          resize, upload to WaveSpeed, and run Google Nano Banana 2 Edit-Fast
          with your photo first and the garment second—nothing is stored after
          the request.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        <DropCard
          slot="person"
          title="Your photo"
          subtitle="Full body or upper body works best, good lighting."
          inputId={personInputId}
          state={person}
        />
        <DropCard
          slot="clothing"
          title="Clothing photo"
          subtitle="Flat lay or model shot—clear view of the garment."
          inputId={clothingInputId}
          state={clothing}
        />
      </div>

      <div className="mt-8 rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950/50">
        <label
          htmlFor="prompt"
          className="text-sm font-medium text-zinc-800 dark:text-zinc-200"
        >
          Prompt (optional)
        </label>
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          Leave blank to use the built-in virtual try-on prompt, or describe
          lighting, background, or fit.
        </p>
        <textarea
          id="prompt"
          rows={3}
          value={prompt}
          disabled={busy}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g. Outdoor natural light, neutral background, the garment fits naturally."
          className="mt-3 w-full resize-y rounded-xl border border-zinc-200 bg-zinc-50/80 px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 dark:border-zinc-700 dark:bg-zinc-900/60 dark:text-zinc-100 dark:placeholder:text-zinc-500"
        />
      </div>

      <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <button
          type="button"
          disabled={busy || !person.file || !clothing.file}
          onClick={() => void run()}
          className="inline-flex min-h-12 min-w-[200px] items-center justify-center rounded-full bg-violet-600 px-8 text-sm font-semibold text-white shadow-lg shadow-violet-600/25 transition hover:bg-violet-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500 disabled:cursor-not-allowed disabled:bg-zinc-300 disabled:text-zinc-500 disabled:shadow-none dark:disabled:bg-zinc-700 dark:disabled:text-zinc-400"
        >
          {busy ? "Working…" : "Generate try-on"}
        </button>
        {!busy && statusMessage && (
          <p className="text-center text-sm text-zinc-600 dark:text-zinc-400">
            {statusMessage}
          </p>
        )}
      </div>

      {busy && (
        <div className="mt-8 space-y-4">
          <GenerationProgress
            activeStep={loadingStep}
            progress={progress}
            elapsedSec={elapsedSec}
            tipIndex={tipIndex}
          />
          <div
            className="rounded-2xl border border-dashed border-zinc-200/90 bg-zinc-50/80 px-4 py-10 text-center dark:border-zinc-700 dark:bg-zinc-900/40"
            aria-hidden
          >
            <div className="mx-auto mb-3 h-40 max-w-sm rounded-xl bg-linear-to-br from-zinc-200/80 to-zinc-100/50 animate-pulse dark:from-zinc-800 dark:to-zinc-900/80" />
            <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
              Your try-on will show here
            </p>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-500">
              Progress keeps moving so the wait feels shorter—inference can take a
              minute depending on load.
            </p>
          </div>
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="mt-8 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-200"
        >
          {error}
        </div>
      )}

      {resultDataUrls.length > 0 && (
        <section className="mt-12">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            Your result
          </h2>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Loaded from the WaveSpeed CDN. Right-click or long-press to save.
          </p>
          <div className="mt-4 grid gap-6 sm:grid-cols-2">
            {resultDataUrls.map((url, i) => (
              <div
                key={`${url.slice(0, 48)}-${i}`}
                className="group overflow-hidden rounded-2xl border border-zinc-200/80 bg-zinc-50 shadow-sm transition hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900/40"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url}
                  alt={`Generated try-on ${i + 1}`}
                  className="w-full object-contain"
                  fetchPriority="high"
                  decoding="async"
                />
                <a
                  href={url}
                  download={`outfitai-tryon-${i + 1}.png`}
                  className="block border-t border-zinc-200/80 px-4 py-3 text-center text-sm font-medium text-violet-600 group-hover:text-violet-500 dark:border-zinc-800 dark:text-violet-400"
                >
                  Download
                </a>
              </div>
            ))}
          </div>
        </section>
      )}

      <footer className="mt-16 border-t border-zinc-200/80 pt-8 text-center text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-500">
        API keys stay on the server. Add{" "}
        <code className="rounded bg-zinc-100 px-1 py-0.5 font-mono text-[0.8rem] dark:bg-zinc-900">
          WAVESPEED_API_KEY
        </code>{" "}
        in{" "}
        <code className="rounded bg-zinc-100 px-1 py-0.5 font-mono text-[0.8rem] dark:bg-zinc-900">
          .env.local
        </code>{" "}
        for local dev and in Vercel project settings for production.
      </footer>
    </div>
  );
}
