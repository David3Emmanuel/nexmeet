import { pool } from '@/lib/db'
import { generateMatches } from '@/ai'
import { sendEmail } from '@/lib/email'
import type { MatchAttendee, FormQuestion, MatchResult } from '@/lib/types'

/** Fisher-Yates shuffle */
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/** Tokenise a string into a lowercase word set, filtering noise words. */
function tokenise(text: string): Set<string> {
  const STOP = new Set(['i', 'a', 'the', 'and', 'or', 'to', 'for', 'of', 'in', 'is', 'am', 'are', 'with', 'my', 'me', 'we'])
  return new Set(
    text.toLowerCase().replace(/[^a-z0-9 ]/g, ' ').split(/\s+/).filter(w => w.length > 2 && !STOP.has(w))
  )
}

/** Jaccard similarity between two word sets (0–1). */
function jaccard(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 && b.size === 0) return 0
  const intersection = [...a].filter(w => b.has(w)).length
  const union = new Set([...a, ...b]).size
  return intersection / union
}

/** Build a word-bag for an attendee from all their response text. */
function attendeeBag(a: MatchAttendee): Set<string> {
  const text = [a.lookingFor ?? '', ...Object.values(a.answers)].join(' ')
  return tokenise(text)
}

/**
 * Heuristic fallback matcher.
 *
 * Scores every possible pair by Jaccard similarity of their response text,
 * then greedily picks the highest-scoring unmatched pair until no more can
 * be formed. Ties are broken by a seeded shuffle so results aren't
 * alphabetically biased. Every match is mutual by construction.
 *
 * Generates a human-readable reason that names the shared keywords so
 * attendees understand why they were connected even without AI.
 */
function heuristicMatches(attendees: MatchAttendee[]): MatchResult[] {
  const bags = new Map(attendees.map(a => [a.id, attendeeBag(a)]))
  const results: MatchResult[] = attendees.map(a => ({ attendeeId: a.id, matches: [] }))
  const resultById = new Map(results.map(r => [r.attendeeId, r]))

  // Score all pairs
  type ScoredPair = { a: MatchAttendee; b: MatchAttendee; score: number; shared: string[] }
  const pairs: ScoredPair[] = []
  for (let i = 0; i < attendees.length; i++) {
    for (let j = i + 1; j < attendees.length; j++) {
      const a = attendees[i]
      const b = attendees[j]
      const ba = bags.get(a.id)!
      const bb = bags.get(b.id)!
      const shared = [...ba].filter(w => bb.has(w))
      pairs.push({ a, b, score: jaccard(ba, bb), shared })
    }
  }

  // Shuffle to break ties randomly, then sort descending by score
  const shuffled = shuffle(pairs)
  shuffled.sort((x, y) => y.score - x.score)

  // Greedy matching — each person gets at most one match
  const matched = new Set<string>()
  for (const { a, b, score, shared } of shuffled) {
    if (matched.has(a.id) || matched.has(b.id)) continue
    matched.add(a.id)
    matched.add(b.id)

    const reason =
      shared.length > 0
        ? `You both mentioned: ${shared.slice(0, 4).join(', ')}.`
        : score === 0
        ? "You have complementary profiles — sometimes the best connections are unexpected."
        : "Your backgrounds look like a strong fit for a conversation."

    resultById.get(a.id)!.matches.push({ matchedAttendeeId: b.id, matchedName: b.name, reason, mutual: true })
    resultById.get(b.id)!.matches.push({ matchedAttendeeId: a.id, matchedName: a.name, reason, mutual: true })
  }

  return results
}

export async function triggerMatch(eventId: string): Promise<number> {
  const event = await pool.query(
    `SELECT id, title, form_fields FROM events WHERE id = $1`,
    [eventId],
  )
  if (event.rowCount === 0) throw new Error(`Event ${eventId} not found`)

  const { title, form_fields } = event.rows[0]

  const attendeeRows = await pool.query(
    `SELECT id, name, email, auth_token, responses FROM attendees WHERE event_id = $1`,
    [eventId],
  )
  if (attendeeRows.rowCount === 0)
    throw new Error(`No attendees for event ${eventId}`)

  const questions: FormQuestion[] = (form_fields as FormQuestion[]).filter(
    (f) => f.id && f.question,
  )

  const attendees: MatchAttendee[] = attendeeRows.rows.map((row) => ({
    id: row.id,
    name: row.name,
    lookingFor: (row.responses as Record<string, string>)['looking_for'],
    answers: row.responses as Record<string, string>,
  }))

  let results: MatchResult[]
  try {
    results = await generateMatches(questions, attendees)
  } catch (err) {
    console.error('[triggerMatch] AI matching failed, falling back to heuristic pairings:', err)
    results = heuristicMatches(attendees)
  }

  // Clear old matches, persist new pairs
  await pool.query('DELETE FROM matches WHERE event_id = $1', [eventId])

  const pairs = new Set<string>()
  for (const result of results) {
    for (const match of result.matches) {
      const pair = [result.attendeeId, match.matchedAttendeeId].sort().join('|')
      pairs.add(pair)
    }
  }

  // Build a lookup of pair → reason (use the reason from attendee_a's perspective)
  const reasonMap = new Map<string, string>()
  for (const result of results) {
    for (const match of result.matches) {
      const pair = [result.attendeeId, match.matchedAttendeeId].sort().join('|')
      if (!reasonMap.has(pair)) reasonMap.set(pair, match.reason)
    }
  }

  for (const pair of pairs) {
    const [a, b] = pair.split('|')
    await pool.query(
      `INSERT INTO matches (event_id, attendee_a_id, attendee_b_id, reason) VALUES ($1, $2, $3, $4)`,
      [eventId, a, b, reasonMap.get(pair) ?? null],
    )
  }

  await pool.query('UPDATE events SET matched = true WHERE id = $1', [eventId])

  // Send notification emails — fire and forget
  const resultMap = new Map(results.map((r) => [r.attendeeId, r]))
  const baseUrl = process.env.APP_BASE_URL ?? 'http://localhost:3000'

  Promise.allSettled(
    attendeeRows.rows.map(async (row) => {
      const result = resultMap.get(row.id)
      if (!result || result.matches.length === 0) return

      const ticketUrl = `${baseUrl}/e/${eventId}?ticket=${row.auth_token}`
      await sendEmail({
        to: row.email,
        subject: `Your matches at ${title} are ready!`,
        text: `Hi ${row.name},\n\nYour matches: ${result.matches.map((m) => m.matchedName).join(', ')}\n\nSee details: ${ticketUrl}`,
        html: `
          <p>Hi <strong>${row.name}</strong>,</p>
          <p>Your matches at <strong>${title}</strong> are ready!</p>
          <ul>${result.matches.map((m) => `<li><strong>${m.matchedName}</strong>${m.reason ? ` — ${m.reason}` : ''}</li>`).join('')}</ul>
          <p><a href="${ticketUrl}">View your match card</a></p>
        `,
      })
    }),
  )

  return pairs.size
}
