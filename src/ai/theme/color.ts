// WCAG relative-luminance + contrast, used to GUARANTEE readable text
// regardless of what the model proposes.

function clampHex(hex: string): string {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  return m ? `#${m[1].toLowerCase()}` : "#000000"; // fallback on garbage input
}

function toRgb(hex: string): [number, number, number] {
  const h = clampHex(hex).slice(1);
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}

function relativeLuminance(hex: string): number {
  const channel = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  const [r, g, b] = toRgb(hex);
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

export function contrastRatio(a: string, b: string): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  const [hi, lo] = la > lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

// If `fg` isn't readable on `bg`, swap it for black or white — whichever
// reads better. Returns a guaranteed-legible foreground.
export function ensureReadable(fg: string, bg: string, min = 4.5): string {
  if (contrastRatio(fg, bg) >= min) return clampHex(fg);
  const onWhite = contrastRatio("#ffffff", bg);
  const onBlack = contrastRatio("#000000", bg);
  return onWhite >= onBlack ? "#ffffff" : "#000000";
}

export { clampHex };