import "dotenv/config";  // remove if on Next.js
import { generateTheme } from "./index";
import { contrastRatio } from "./theme/color";

const FLYER_URL =
  "https://res.cloudinary.com/startup-grind/image/upload/c_scale,w_2560/c_crop,h_640,w_2560,y_0.0_mul_h_sub_0.0_mul_640/c_crop,h_640,w_2560/c_fill,dpr_2.0,f_auto,g_center,q_auto:good/v1/gcs/platform-data-goog/event_banners/blob_TexqZJ0";

// A tiny swatch so you can eyeball colors in a terminal that supports truecolor.
function swatch(hex: string): string {
  const m = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex);
  if (!m) return "      ";
  const [r, g, b] = [m[1], m[2], m[3]].map((h) => parseInt(h, 16));
  return `\x1b[48;2;${r};${g};${b}m      \x1b[0m`;
}

async function main() {
  console.time("theme");
  const theme = await generateTheme(FLYER_URL);
  console.timeEnd("theme");

  console.log("\n=== THEME ===");
  console.log(`${swatch(theme.background)}  background        ${theme.background}`);
  console.log(`${swatch(theme.foreground)}  foreground        ${theme.foreground}`);
  console.log(`${swatch(theme.accent)}  accent            ${theme.accent}`);
  console.log(`${swatch(theme.accentForeground)}  accentForeground  ${theme.accentForeground}`);
  console.log(`\n  fontFamily : ${theme.fontFamily}`);
  console.log(`  fontKind   : ${theme.fontKind}`);
  console.log(`  mood       : ${theme.mood}`);

  // Did the contrast pass produce readable pairs? (It should, always.)
  const fgRatio = contrastRatio(theme.foreground, theme.background);
  const afgRatio = contrastRatio(theme.accentForeground, theme.accent);
  console.log("\n=== CONTRAST CHECK (target ≥ 4.5) ===");
  console.log(`  foreground / background : ${fgRatio.toFixed(2)}  ${fgRatio >= 4.5 ? "✓" : "✗"}`);
  console.log(`  accentForeground / accent: ${afgRatio.toFixed(2)}  ${afgRatio >= 4.5 ? "✓" : "✗"}`);
}

main().catch(console.error);