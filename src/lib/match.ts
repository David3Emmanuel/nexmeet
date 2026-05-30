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

/**
 * Random fallback: pair attendees sequentially after shuffling.
 * Every pair is mutual — if A is matched to B, B is matched to A.
 * The last attendee is unmatched when the count is odd.
 */
function randomMatches(attendees: MatchAttendee[]): MatchResult[] {
  const shuffled = shuffle(attendees)
  const results: MatchResult[] = attendees.map((a) => ({ attendeeId: a.id, matches: [] }))
  const resultById = new Map(results.map((r) => [r.attendeeId, r]))

  for (let i = 0; i + 1 < shuffled.length; i += 2) {
    const a = shuffled[i]
    const b = shuffled[i + 1]
    resultById.get(a.id)!.matches.push({ matchedAttendeeId: b.id, matchedName: b.name, reason: '' })
    resultById.get(b.id)!.matches.push({ matchedAttendeeId: a.id, matchedName: a.name, reason: '' })
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
    console.error('[triggerMatch] AI matching failed, falling back to random pairings:', err)
    results = randomMatches(attendees)
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
