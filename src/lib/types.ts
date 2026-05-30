// ── Domain / DB types ────────────────────────────────────────────────────────

export interface Organizer {
  id: string
  email: string
}

export interface ThemeConfig {
  foreground: string
  background: string
  accent: string
  fontFamily: string
}

/** Full theme returned by AI generation — extends the stored ThemeConfig. */
export interface GeneratedTheme extends ThemeConfig {
  accentForeground: string
  fontKind: 'sans' | 'serif' | 'display' | 'mono'
  mood: string
}

export interface FormField {
  label: string
  type: 'text' | 'email' | 'phone' | 'textarea'
  required: boolean
}

export const baseFormFields: FormField[] = [
  { label: 'Name', type: 'text', required: true },
  { label: 'Email', type: 'email', required: true },
  { label: 'Phone', type: 'phone', required: true },
  { label: 'Who are you looking to meet?', type: 'textarea', required: false },
]

export interface Event {
  id: string
  organizerId: string
  title: string
  about: string
  coverImageUrl: string
  formFields: FormField[]
  themeConfig?: ThemeConfig
  matchTimes: Date[]
  matched: boolean
}

export interface Attendee {
  id: string
  eventId: string
  name: string
  email: string
  phone: string
  responses: Record<string, string>
  location?: Location
}

export interface Match {
  id: string
  eventId: string
  attendeeAId: string
  attendeeBId: string
}

export interface Location {
  lat: number
  lng: number
}

// ── AI types ─────────────────────────────────────────────────────────────────

export interface EventInfo {
  title: string
  about: string
}

/** An AI-generated form question (distinct from FormField which is the DB schema). */
export interface FormQuestion {
  id: string
  question: string
  helperText: string
}

/** Attendee profile shape consumed by the AI matching engine. */
export interface MatchAttendee {
  id: string
  name: string
  lookingFor?: string
  answers: Record<string, string>  // questionId -> free-text answer
}

export interface AttendeeMatch {
  matchedAttendeeId: string
  matchedName: string
  reason: string
  mutual?: boolean
}

export interface MatchResult {
  attendeeId: string
  matches: AttendeeMatch[]
}
