"use client";

import { useCallback, useEffect, useId, useMemo, useState } from "react";
import { GenerationProgress } from "@/components/GenerationProgress";

type Mode = "tryon" | "cloth";
type Slot = "person" | "clothing" | "item";

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
  const itemInputId = useId();

  const [mode, setMode] = useState<Mode>("tryon");
  const [person, setPerson] = useState<UploadState>(initialSlot);
  const [clothing, setClothing] = useState<UploadState>(initialSlot);
  const [item, setItem] = useState<UploadState>(initialSlot);
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
      } else if (slot === "item") {
        setItem((prev) => {
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
    if (mode === "tryon") {
      if (!person.file || !clothing.file) {
        setError("Add both a photo of you and a photo of the clothing.");
        return;
      }
    } else {
      if (!item.file) {
        setError("Upload a fabric/garment photo first.");
        return;
      }
    }

    setStatus("generating");

    const fd = new FormData();
    fd.append("mode", mode);
    if (mode === "tryon") {
      fd.append("person", person.file!);
      fd.append("clothing", clothing.file!);
    } else {
      fd.append("item", item.file!);
    }
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

  const clothQuickPrompts = useMemo(
    () => [
      { label: "T-shirt", prompt: "Make this look like a premium cotton t-shirt (classic fit) on a neutral model." },
      { label: "Oversized tee", prompt: "Make this look like an oversized streetwear t-shirt on a neutral model." },
      { label: "Shirt", prompt: "Make this look like a button-down shirt with realistic collar and cuffs." },
      { label: "Hoodie", prompt: "Make this look like a hoodie with realistic hood, pocket, and thick fabric drape." },
      { label: "Polo", prompt: "Make this look like a polo shirt with collar and buttons." },
      { label: "Dress", prompt: "Make this look like a simple dress that uses this exact fabric." },
    ],
    []
  );

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
    <div className="w-full">
      <div className="mb-6 flex items-center justify-center">
        <div className="inline-flex rounded-full border border-zinc-200/70 bg-(--surface) p-1 text-sm font-semibold shadow-sm backdrop-blur dark:border-zinc-800/70 dark:bg-(--surface)">
          <button
            type="button"
            disabled={busy}
            onClick={() => {
              setMode("tryon");
              setPrompt("");
              setError(null);
              setResultDataUrls([]);
            }}
            className={`rounded-full px-4 py-2 transition ${
              mode === "tryon"
                ? "bg-violet-600 text-white"
                : "text-zinc-700 hover:text-zinc-900 dark:text-zinc-200 dark:hover:text-white"
            }`}
          >
            Try-on
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => {
              setMode("cloth");
              setPrompt("");
              setError(null);
              setResultDataUrls([]);
            }}
            className={`rounded-full px-4 py-2 transition ${
              mode === "cloth"
                ? "bg-violet-600 text-white"
                : "text-zinc-700 hover:text-zinc-900 dark:text-zinc-200 dark:hover:text-white"
            }`}
          >
            Cloth ideas
          </button>
        </div>
      </div>

      {mode === "tryon" ? (
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
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <DropCard
            slot="item"
            title="Fabric / garment photo"
            subtitle="Upload the cloth item or fabric pattern to preview styles."
            inputId={itemInputId}
            state={item}
          />
          <div className="space-y-6">
            <DropCard
              slot="person"
              title="Your photo (optional)"
              subtitle="If added, we’ll put the style on you (keeps face/pose)."
              inputId={personInputId}
              state={person}
            />
            <div className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950/50">
              <div className="mb-3">
                <h2 className="text-base font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
                  Quick styles
                </h2>
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                  Tap to autofill a good prompt (you can edit it below).
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {clothQuickPrompts.map((p) => (
                  <button
                    key={p.label}
                    type="button"
                    disabled={busy}
                    onClick={() => setPrompt(p.prompt)}
                    className="rounded-full border border-zinc-200 bg-white/70 px-3 py-1.5 text-sm font-semibold text-zinc-800 shadow-sm transition hover:bg-white disabled:opacity-60 dark:border-zinc-800 dark:bg-zinc-950/40 dark:text-zinc-100 dark:hover:bg-zinc-950"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mt-8 rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950/50">
        <label
          htmlFor="prompt"
          className="text-sm font-medium text-zinc-800 dark:text-zinc-200"
        >
          Prompt
        </label>
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          {mode === "tryon"
            ? "Leave blank to use the built-in try-on prompt, or describe lighting/background/fit."
            : "Leave blank to use the built-in cloth-ideas prompt, or specify the style (shirt, t-shirt, etc)."}
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
          disabled={
            busy ||
            (mode === "tryon"
              ? !person.file || !clothing.file
              : !item.file)
          }
          onClick={() => void run()}
          className="inline-flex min-h-12 min-w-[200px] items-center justify-center rounded-full bg-violet-600 px-8 text-sm font-semibold text-white shadow-lg shadow-violet-600/25 transition hover:bg-violet-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500 disabled:cursor-not-allowed disabled:bg-zinc-300 disabled:text-zinc-500 disabled:shadow-none dark:disabled:bg-zinc-700 dark:disabled:text-zinc-400"
        >
          {busy ? "Working…" : mode === "tryon" ? "Generate try-on" : "Generate idea"}
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
            Loaded from CDN. Right-click or long-press to save.
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
        Tip: Use well-lit images for best results.
      </footer>
    </div>
  );
}
