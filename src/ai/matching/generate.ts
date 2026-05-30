import { Type } from "@google/genai";
import { ai } from "../clients";
import { Attendee, FormQuestion, MatchResult, AttendeeMatch } from "../types";
import { buildMatchPrompt, buildReasonPrompt } from "./prompts";

const CONCURRENCY = 15;
const SAFETY_MAX = 10; // runaway guard only, NOT a quality cap — AI decides the count

// Runs an async fn over items in concurrency-limited batches.
async function runBatched<T, R>(
  items: T[],
  fn: (item: T) => Promise<R>
): Promise<R[]> {
  const out: R[] = [];
  for (let i = 0; i < items.length; i += CONCURRENCY) {
    const batch = items.slice(i, i + CONCURRENCY);
    out.push(...(await Promise.all(batch.map(fn))));
  }
  return out;
}

// ---- Pass 1: directed per-person matching ----
async function matchOne(
  focal: Attendee,
  all: Attendee[],
  questions: FormQuestion[],
  target: number
): Promise<MatchResult> {
  const candidates = all.filter((a) => a.id !== focal.id);
  if (candidates.length === 0) return { attendeeId: focal.id, matches: [] };

  const validIds = new Set(candidates.map((c) => c.id));

  const response = await ai.models.generateContent({
    model: "gemini-3.5-flash",
    contents: buildMatchPrompt(focal, candidates, questions, target),
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        // no maxItems: the AI owns the count. SAFETY_MAX enforced below.
        items: {
          type: Type.OBJECT,
          properties: {
            matchedAttendeeId: { type: Type.STRING },
            matchedName: { type: Type.STRING },
            reason: { type: Type.STRING },
          },
          required: ["matchedAttendeeId", "matchedName", "reason"],
        },
      },
    },
  });

  const raw = JSON.parse(response.text ?? "[]") as AttendeeMatch[];

  // Drop hallucinated ids, dedupe, apply runaway guard.
  const seen = new Set<string>();
  const matches = raw
    .filter((m) => validIds.has(m.matchedAttendeeId))
    .filter((m) => (seen.has(m.matchedAttendeeId) ? false : seen.add(m.matchedAttendeeId)))
    .slice(0, SAFETY_MAX);

  return { attendeeId: focal.id, matches };
}

// ---- Reason backfill for reciprocal edges ----
async function generateReason(
  owner: Attendee,
  target: Attendee,
  questions: FormQuestion[]
): Promise<string> {
  const response = await ai.models.generateContent({
    model: "gemini-3.5-flash",
    contents: buildReasonPrompt(owner, target, questions),
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: { reason: { type: Type.STRING } },
        required: ["reason"],
      },
    },
  });
  const parsed = JSON.parse(response.text ?? "{}") as { reason?: string };
  return parsed.reason ?? `${target.name} is looking to connect with you at this event.`;
}

// ---- Pass 2: make matches reciprocal (union) ----
async function reconcileReciprocity(
  directed: MatchResult[],
  attendees: Attendee[],
  questions: FormQuestion[]
): Promise<MatchResult[]> {
  const byId = new Map(attendees.map((a) => [a.id, a]));

  // ownerId -> (targetId -> match) for everyone's own pass-1 picks.
  const picks = new Map<string, Map<string, AttendeeMatch>>();
  for (const r of directed) {
    picks.set(r.attendeeId, new Map(r.matches.map((m) => [m.matchedAttendeeId, m])));
  }

  const isMutual = (a: string, b: string) =>
    !!picks.get(a)?.has(b) && !!picks.get(b)?.has(a);

  // If B picked A but A didn't pick B, A's card owes a reason about B.
  const owed: Array<{ ownerId: string; addId: string }> = [];
  for (const r of directed) {
    for (const m of r.matches) {
      const ownerPicks = picks.get(m.matchedAttendeeId);
      if (ownerPicks && !ownerPicks.has(r.attendeeId)) {
        owed.push({ ownerId: m.matchedAttendeeId, addId: r.attendeeId });
      }
    }
  }

  // Generate owed reasons concurrently.
  const filled = await runBatched(owed, async ({ ownerId, addId }) => ({
    ownerId,
    addId,
    reason: await generateReason(byId.get(ownerId)!, byId.get(addId)!, questions),
  }));
  const reasonLookup = new Map(filled.map((f) => [`${f.ownerId}->${f.addId}`, f.reason]));

  // Assemble each person's final card.
  return attendees.map((owner) => {
    const ownPicks = picks.get(owner.id) ?? new Map<string, AttendeeMatch>();
    const final = new Map<string, AttendeeMatch>();

    for (const [tid, m] of ownPicks) {
      final.set(tid, { ...m, mutual: isMutual(owner.id, tid) });
    }
    for (const { ownerId, addId } of owed) {
      if (ownerId !== owner.id || final.has(addId)) continue;
      const add = byId.get(addId)!;
      final.set(addId, {
        matchedAttendeeId: addId,
        matchedName: add.name,
        reason: reasonLookup.get(`${owner.id}->${addId}`) ?? `${add.name} wants to connect with you.`,
        mutual: isMutual(owner.id, addId),
      });
    }

    // Order: mutual first, then own picks, then incoming reciprocal-only.
    const rank = (tid: string) =>
      isMutual(owner.id, tid) ? 2 : ownPicks.has(tid) ? 1 : 0;
    const matches = [...final.values()].sort(
      (a, b) => rank(b.matchedAttendeeId) - rank(a.matchedAttendeeId)
    );

    return { attendeeId: owner.id, matches };
  });
}

// ---- Public entry point ----
export async function generateMatches(
  questions: FormQuestion[],
  attendees: Attendee[],
  targetMatches: number = 3,   // anchor, not a cap — AI decides actual count
  reciprocal: boolean = true
): Promise<MatchResult[]> {
  const directed = await runBatched(attendees, (focal) =>
    matchOne(focal, attendees, questions, targetMatches)
  );

  return reciprocal
    ? reconcileReciprocity(directed, attendees, questions)
    : directed;
}