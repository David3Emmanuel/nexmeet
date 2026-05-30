import { Type } from "@google/genai";
import { ai } from "../clients";
import { Theme } from "../types";
import { buildThemePrompt } from "./prompt";
import { ensureReadable, clampHex } from "./color";

// Sensible fallback if the flyer is unreadable or the call fails.
const FALLBACK: Theme = {
  background: "#ffffff",
  foreground: "#111111",
  accent: "#4f46e5",
  accentForeground: "#ffffff",
  fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
  fontKind: "sans",
  mood: "clean default",
};

async function fetchFlyerAsBase64(
  url: string
): Promise<{ data: string; mimeType: string }> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Flyer fetch failed: ${res.status}`);

  const mimeType = res.headers.get("content-type")?.split(";")[0] || "image/jpeg";
  const buffer = Buffer.from(await res.arrayBuffer());
  return { data: buffer.toString("base64"), mimeType };
}

export async function generateTheme(flyerUrl: string): Promise<Theme> {
  try {
    const { data, mimeType } = await fetchFlyerAsBase64(flyerUrl);

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [
        { inlineData: { mimeType, data } },
        { text: buildThemePrompt() },
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            background: { type: Type.STRING },
            foreground: { type: Type.STRING },
            accent: { type: Type.STRING },
            accentForeground: { type: Type.STRING },
            fontFamily: { type: Type.STRING },
            fontKind: { type: Type.STRING, enum: ["sans", "serif", "display", "mono"] },
            mood: { type: Type.STRING },
          },
          required: [
            "background", "foreground", "accent",
            "accentForeground", "fontFamily", "fontKind", "mood",
          ],
        },
      },
    });

    const raw = JSON.parse(response.text ?? "{}") as Partial<Theme>;

    // AI proposes; code guarantees. Normalize hex + enforce contrast.
    const background = clampHex(raw.background ?? FALLBACK.background);
    const accent = clampHex(raw.accent ?? FALLBACK.accent);

    return {
      background,
      foreground: ensureReadable(raw.foreground ?? FALLBACK.foreground, background),
      accent,
      accentForeground: ensureReadable(raw.accentForeground ?? FALLBACK.accentForeground, accent),
      fontFamily: raw.fontFamily?.trim() || FALLBACK.fontFamily,
      fontKind: raw.fontKind ?? FALLBACK.fontKind,
      mood: raw.mood?.trim() || FALLBACK.mood,
    };
  } catch (err) {
    console.error("generateTheme failed, using fallback:", err);
    return FALLBACK;
  }
}