import { Attendee, FormQuestion } from "../types";

// Questions are rendered ONCE per prompt as shared context (change #1).
function formatQuestionsHeader(questions: FormQuestion[]): string {
  return questions.map((q) => `  [${q.id}] ${q.question}`).join("\n");
}

// Each attendee renders as answers only, keyed by question id. No repeated
// question text, which is what keeps large rooms from blowing up token cost.
function formatAttendee(a: Attendee, questions: FormQuestion[]): string {
  const lines = questions.map(
    (q) => `  ${q.id}: ${a.answers[q.id]?.trim() || "(no answer)"}`
  );
  const looking = a.lookingFor?.trim()
    ? `\n  looking-for: ${a.lookingFor.trim()}`
    : "";
  return `[id: ${a.id}] ${a.name}\n${lines.join("\n")}${looking}`;
}

export function buildMatchPrompt(
  focal: Attendee,
  candidates: Attendee[],
  questions: FormQuestion[],
  target: number
): string {
  return `You are the matchmaking engine for NexMeet, an AI networking app at a live event. Your job: decide who THIS attendee should meet, and explain why in a way that makes them actually want to walk over and say hello.

Each person answered these questions (referenced by id below):
${formatQuestionsHeader(questions)}

THE ATTENDEE YOU ARE MATCHING:
${formatAttendee(focal, questions)}

CANDIDATES (everyone else in the room):
${candidates.map((c) => formatAttendee(c, questions)).join("\n\n")}

Decide who is genuinely worth this attendee's time. Around ${target} is typical, but that is only a guide:
- Include MORE if there are genuinely more strong, high-value matches in the room.
- Include FEWER (even 1, or 0) if the strong matches run out. Do NOT pad with weak matches to reach a number, and do NOT drop a great match just to stay near it.
- A match earns its place only on MUTUAL VALUE: one person needs what the other offers (skills, funding, hiring, advice, collaboration). "You both like X" is the weakest possible reason; avoid it unless nothing better exists.
- Lean on each person's "looking-for" and goals as the strongest signal.

For each match, write ONE specific reason (1-2 sentences) naming the concrete thing that makes it worth their time. Reference real details from both profiles. Speak TO the attendee about the person they should meet. Never generic.

Only use candidate ids from the list above.`;
}

// Backfills a single directed reason for a reciprocal edge.
// owner = whose card we're adding to (reason addressed to them).
// target = the person being added.
export function buildReasonPrompt(
  owner: Attendee,
  target: Attendee,
  questions: FormQuestion[]
): string {
  return `You are the matchmaking engine for NexMeet at a live event. ${target.name} already wants to meet ${owner.name}, so they will appear on ${owner.name}'s card too.

Each person answered these questions (referenced by id below):
${formatQuestionsHeader(questions)}

Write ONE specific reason (1-2 sentences) telling ${owner.name} why meeting ${target.name} is worth their time. Speak TO ${owner.name} about ${target.name}. Reference concrete details from both profiles. Focus on mutual value and complementary fit, never generic filler.

${owner.name} (the person reading this):
${formatAttendee(owner, questions)}

${target.name} (the person to meet):
${formatAttendee(target, questions)}`;
}