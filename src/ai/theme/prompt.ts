export function buildThemePrompt(): string {
  return `You are a brand designer extracting a UI theme from an event flyer image. The theme will style attendee match cards in the NexMeet app, so it must feel like it belongs to THIS event while staying clean and readable.

From the flyer, extract:
- background: the dominant background color for a page (hex). Usually light/neutral; pick something cards sit on comfortably.
- foreground: primary text color that is clearly readable on that background (hex).
- accent: the flyer's signature brand color — the one a person would call "the event's color" (hex). Used for buttons and highlights.
- accentForeground: text/icon color that sits directly ON the accent color and stays readable (hex).
- fontFamily: a CSS font-family stack using ONLY widely available web fonts (system fonts or common Google Fonts). Match the flyer's personality. Do NOT name a font you cannot be sure is web-available.
- fontKind: one of "sans", "serif", "display", "mono" — which kind your fontFamily is.
- mood: one short phrase describing the flyer's vibe (e.g. "sleek corporate", "playful community meetup", "luxe gala").

Pull colors that genuinely reflect the flyer. Prioritize a result that is readable and on-brand over an exact pixel match.`;
}