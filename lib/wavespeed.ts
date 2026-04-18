/**
 * FLUX.2 [klein] 9B Edit — image 1 = person, image 2 = garment (see route).
 * Prompt style follows WaveSpeed multi-image examples ("image 1" / "image 2").
 */
export const DEFAULT_TRY_ON_PROMPT =
  "You are a professional fashion photo retouching AI. Your task is a realistic virtual clothing try-on." +
  "\n\n" +
  "INPUTS:\n" +
  "- Image 1: The PERSON. Preserve everything about them — face, skin tone, hair, body shape, pose, expression, and the original background/environment exactly as-is.\n" +
  "- Image 2: The GARMENT. This is the only thing that changes.\n" +
  "\n" +
  "YOUR TASK:\n" +
  "Replace whatever clothing the person in Image 1 is currently wearing on the relevant body region with the exact garment shown in Image 2. " +
  "The final output must look like a single, unmodified photograph taken of that person wearing that garment — indistinguishable from a real photo shoot.\n" +
  "\n" +
  "GARMENT RULES (critical):\n" +
  "- Identify the garment type from Image 2 (e.g. t-shirt, dress, jacket, pants, hoodie) and apply it ONLY to the correct body region.\n" +
  "- Reproduce the garment's exact colors, prints, patterns, logos, text, texture, and fabric weight as seen in Image 2. Do NOT invent or alter any design detail.\n" +
  "- The garment must conform naturally to the person's body: follow their pose, body contours, and proportions.\n" +
  "- Simulate realistic fabric physics — natural folds, creases, drape, and gravity-based wrinkles appropriate to the fabric type (e.g. stiff denim vs flowing silk).\n" +
  "- Sleeve length, hem length, neckline shape, and fit (loose/tight) must match Image 2 exactly.\n" +
  "- Collar, buttons, zippers, pockets, and all structural garment elements must be visible and correctly placed.\n" +
  "\n" +
  "LIGHTING & REALISM RULES:\n" +
  "- The garment's lighting, shadows, and highlights must match the lighting conditions in Image 1 (direction, intensity, color temperature).\n" +
  "- Skin visible around the garment (neck, arms, hands) must remain natural and unedited.\n" +
  "- The garment edges must blend seamlessly into the person's body — no hard cut-out edges, no halo artifacts, no blurring.\n" +
  "\n" +
  "STRICT OUTPUT RULES:\n" +
  "- Output ONE single unified photograph only. Absolutely no split screen, side-by-side, collage, diptych, before/after panels, or inset thumbnails.\n" +
  "- Do NOT paste the garment as a flat 2D rectangle or overlay. It must be fully integrated onto the 3D body.\n" +
  "- Do NOT change the person's face, hair, skin, body shape, pose, or background in any way.\n" +
  "- Do NOT add accessories, jewelry, or other clothing items not present in either image.\n" +
  "- Do NOT change the image aspect ratio, crop, or framing.\n" +
  "- The result must be photorealistic, editorial-quality, and pass as a genuine fashion photograph.";

/** Model id for WaveSpeed REST API (see api.txt). */
export const WAVESPEED_FLUX_KLEIN_EDIT_MODEL =
  "wavespeed-ai/flux-2-klein-9b/edit";

const UPLOAD_BINARY_URL = "https://api.wavespeed.ai/api/v3/media/upload/binary";

export class WavespeedConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "WavespeedConfigError";
  }
}

export function normalizeApiKey(raw: string | undefined): string | null {
  if (raw == null) return null;
  let s = raw.trim();
  if (!s) return null;
  if (s.charCodeAt(0) === 0xfeff) {
    s = s.slice(1).trim();
  }
  if (
    (s.startsWith('"') && s.endsWith('"')) ||
    (s.startsWith("'") && s.endsWith("'"))
  ) {
    s = s.slice(1, -1).trim();
  }
  if (/^bearer\s+/i.test(s)) {
    s = s.replace(/^bearer\s+/i, "").trim();
  }
  if (/^WAVESPEED_API_KEY\s*=\s*/i.test(s)) {
    s = s.replace(/^WAVESPEED_API_KEY\s*=\s*/i, "").trim();
  }
  s = s.replace(/[\u200B-\u200D\uFEFF]/g, "").trim();
  return s || null;
}

export function getWavespeedApiKey(): string {
  const normalized = normalizeApiKey(process.env.WAVESPEED_API_KEY);
  if (!normalized) {
    throw new WavespeedConfigError(
      "Set WAVESPEED_API_KEY in .env.local (or Vercel env). Get a key at https://wavespeed.ai/accesskey"
    );
  }
  return normalized;
}

export function extensionFromMime(mime: string): "jpg" | "png" | "webp" {
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  return "jpg";
}

export function mimeFromExtension(ext: string): string {
  if (ext === "png") return "image/png";
  if (ext === "webp") return "image/webp";
  return "image/jpeg";
}

/**
 * POST /api/v3/media/upload/binary — upload bytes and receive a CDN URL for inference.
 */
export async function uploadBinary(
  apiKey: string,
  buffer: Buffer,
  filename: string,
  mime: string
): Promise<string> {
  const form = new FormData();
  const bytes = new Uint8Array(buffer);
  form.append("file", new Blob([bytes], { type: mime }), filename);

  const res = await fetch(UPLOAD_BINARY_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
    body: form,
  });

  const text = await res.text();
  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error(
      `WaveSpeed upload returned non-JSON (${res.status}): ${text.slice(0, 300)}`
    );
  }

  const parsed = json as {
    code?: number;
    message?: string;
    data?: { download_url?: string };
  };

  if (!res.ok || parsed.code !== 200 || !parsed.data?.download_url) {
    throw new Error(
      parsed.message ||
        `WaveSpeed upload failed (${res.status}): ${text.slice(0, 400)}`
    );
  }

  return parsed.data.download_url;
}
