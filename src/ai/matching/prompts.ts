import { MatchAttendee, FormQuestion } from "@/lib/types";

// Questions are rendered ONCE per prompt as shared context (change #1).
function formatQuestionsHeader(questions: FormQuestion[]): string {
  return questions.map((q) => `  [${q.id}] ${q.question}`).join("\n");
}

// Each attendee renders as answers only, keyed by question id. No repeated
// question text, which is what keeps large rooms from blowing up token cost.
function formatMatchAttendee(a: MatchAttendee, questions: FormQuestion[]): string {
  const lines = questions.map(
    (q) => `  ${q.id}: ${a.answers[q.id]?.trim() || "(no answer)"}`
  );
  const looking = a.lookingFor?.trim()
    ? `\n  looking-for: ${a.lookingFor.trim()}`
    : "";
  return `[id: ${a.id}] ${a.name}\n${lines.join("\n")}${looking}`;
}

export function buildMatchPrompt(
  focal: MatchAttendee,
  candidates: MatchAttendee[],
  questions: FormQuestion[],
  target: number
): string {
  return `You are the matchmaking engine for NexMeet, an AI networking app at a live event. Your job: decide who THIS attendee should meet, and explain why in a way that makes them actually want to walk over and say hello.

Each person answered these questions (referenced by id below):
${formatQuestionsHeader(questions)}

THE ATTENDEE YOU ARE MATCHING:
${formatMatchAttendee(focal, questions)}

CANDIDATES (everyone else in the room):
${candidates.map((c) => formatMatchAttendee(c, questions)).join("\n\n")}

Decide who is genuinely worth this attendee's time. Around ${target} is typical, but that is only a guide:
- You MUST provide AT LEAST 1 match for this attendee. Do NOT leave them unconnected (0 matches).
- If there are no obvious strong matches, you must creatively find a shared interest or a general professional overlap as a fallback. Every person must walk away with a connection.
- Lean on each person's "looking-for" and goals as the strongest signal.

For each match, write ONE specific reason (1-2 sentences) naming the concrete thing that makes it worth their time. Reference real details from both profiles. Speak TO the attendee about the person they should meet. Never generic.

Only use candidate ids from the list above.`;
}

// Backfills a single directed reason for a reciprocal edge.
// owner = whose card we're adding to (reason addressed to them).
// target = the person being added.
export function buildReasonPrompt(
  owner: MatchAttendee,
  target: MatchAttendee,
  questions: FormQuestion[]
): string {
  return `You are the matchmaking engine for NexMeet at a live event. ${target.name} already wants to meet ${owner.name}, so they will appear on ${owner.name}'s card too.

Each person answered these questions (referenced by id below):
${formatQuestionsHeader(questions)}

Write ONE specific reason (1-2 sentences) telling ${owner.name} why meeting ${target.name} is worth their time. Speak TO ${owner.name} about ${target.name}. Reference concrete details from both profiles. Focus on mutual value and complementary fit, never generic filler.

${owner.name} (the person reading this):
${formatMatchAttendee(owner, questions)}

${target.name} (the person to meet):
${formatMatchAttendee(target, questions)}`;
}