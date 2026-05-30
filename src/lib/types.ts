export interface Organizer {
  id: string
  email: string
}

export interface ThemeConfig {
  accentColor: string
  font: string
}

export interface Event {
  id: string
  organizerId: string
  title: string
  about: string
  coverImageUrl: string
  formFields: string[]
  themeConfig?: ThemeConfig
  matchTime: Date
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
