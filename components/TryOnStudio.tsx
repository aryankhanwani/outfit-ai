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
    <div className="group relative flex min-h-[220px] flex-col rounded-2xl border border-white/10 bg-[#12121f] p-5 shadow-sm transition hover:border-[#1bcea8]/50 hover:shadow-md">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold tracking-tight text-[#f2ede4]">
            {title}
          </h2>
          <p className="mt-1 text-sm text-[#8b8ba0]">{subtitle}</p>
        </div>
        {state.file && (
          <span className="rounded-full border border-[#1bcea8]/40 bg-[#1bcea8]/10 px-2.5 py-0.5 text-xs font-medium text-[#1bcea8]">
            Ready
          </span>
        )}
      </div>

      <label
        htmlFor={inputId}
        className="relative mt-auto flex flex-1 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-white/15 bg-[#0d0d1c] px-4 py-8 text-center transition group-hover:border-[#1bcea8]/60 group-hover:bg-[#1a1a2e]"
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
            <span className="text-sm font-medium text-[#f2ede4]">
              Click to upload or drag an image here
            </span>
            <span className="mt-1 text-xs text-[#8b8ba0]">
              JPG, PNG, or WebP · max ~4 MB (Vercel limit)
            </span>
          </>
        )}
      </label>
    </div>
  );

  return (
    <div className="w-full">
      <div className="mb-7 flex items-center justify-center">
        <div className="inline-flex rounded-full border border-white/15 bg-[#12121f] p-1 text-sm font-semibold shadow-sm">
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
                : "text-[#8b8ba0] hover:text-[#f2ede4]"
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
                : "text-[#8b8ba0] hover:text-[#f2ede4]"
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
            <div className="rounded-2xl border border-white/10 bg-[#12121f] p-5 shadow-sm">
              <div className="mb-3">
                <h2 className="text-base font-semibold tracking-tight text-[#f2ede4]">
                  Quick styles
                </h2>
                <p className="mt-1 text-sm text-[#8b8ba0]">
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
                    className="rounded-full border border-white/15 bg-[#1a1a2e] px-3 py-1.5 text-sm font-semibold text-[#f2ede4] shadow-sm transition hover:border-[#1bcea8]/50 hover:bg-[#12121f] disabled:opacity-60"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mt-7 rounded-2xl border border-white/10 bg-[#12121f] p-5 shadow-sm">
        <label
          htmlFor="prompt"
          className="text-sm font-medium text-[#f2ede4]"
        >
          Prompt (optional)
        </label>
        <p className="mt-1 text-xs text-[#8b8ba0]">
          {mode === "tryon"
            ? "Use this only if you need to control lighting, background, or fit style."
            : "Use this to define garment style details more precisely."}
        </p>
        <textarea
          id="prompt"
          rows={3}
          value={prompt}
          disabled={busy}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g. Outdoor natural light, neutral background, the garment fits naturally."
          className="mt-3 w-full resize-y rounded-xl border border-white/15 bg-[#0d0d1c] px-4 py-3 text-sm text-[#f2ede4] placeholder:text-[#555570] focus:border-[#1bcea8] focus:outline-none focus:ring-2 focus:ring-[#1bcea8]/20"
        />
      </div>

      <div className="mt-7 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <button
          type="button"
          disabled={
            busy ||
            (mode === "tryon"
              ? !person.file || !clothing.file
              : !item.file)
          }
          onClick={() => void run()}
          className="inline-flex min-h-12 min-w-[200px] items-center justify-center rounded-full bg-[#1bcea8] px-8 text-sm font-semibold text-[#07070f] shadow-lg shadow-[#1bcea8]/25 transition hover:bg-[#22efc2] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1bcea8] disabled:cursor-not-allowed disabled:bg-[#555570] disabled:text-[#8b8ba0] disabled:shadow-none"
        >
          {busy ? "Generating..." : mode === "tryon" ? "Generate try-on" : "Generate style"}
        </button>
        {!busy && statusMessage && (
          <p className="text-center text-sm text-[#8b8ba0]">
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
            className="rounded-2xl border border-dashed border-white/15 bg-[#0d0d1c] px-4 py-10 text-center"
            aria-hidden
          >
            <div className="mx-auto mb-3 h-40 max-w-sm animate-pulse rounded-xl bg-linear-to-br from-[#1a1a2e] to-[#12121f]" />
            <p className="text-sm font-medium text-[#8b8ba0]">
              Preparing your result preview
            </p>
          </div>
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="mt-8 rounded-2xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-200"
        >
          {error}
        </div>
      )}

      {resultDataUrls.length > 0 && (
        <section className="mt-12">
          <h2 className="text-lg font-semibold text-[#f2ede4]">
            Result
          </h2>
          <p className="mt-1 text-sm text-[#8b8ba0]">
            Right-click or long-press to save.
          </p>
          <div className="mt-4 grid gap-6 sm:grid-cols-2">
            {resultDataUrls.map((url, i) => (
              <div
                key={`${url.slice(0, 48)}-${i}`}
                className="group overflow-hidden rounded-2xl border border-white/10 bg-[#12121f] shadow-sm transition hover:shadow-md"
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
                  className="block border-t border-white/10 px-4 py-3 text-center text-sm font-medium text-[#1bcea8] group-hover:text-[#22efc2]"
                >
                  Download
                </a>
              </div>
            ))}
          </div>
        </section>
      )}

      <footer className="mt-10 border-t border-white/10 pt-6 text-center text-xs text-[#555570]">
        Use well-lit source images for best output quality.
      </footer>
    </div>
  );
}
