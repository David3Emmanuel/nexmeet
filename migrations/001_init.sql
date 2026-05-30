-- Organizers
CREATE TABLE organizers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL
);

-- Events
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organizer_id UUID NOT NULL REFERENCES organizers(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  about TEXT,
  image_url TEXT,
  form_fields JSONB DEFAULT '[]',
  theme_config JSONB DEFAULT '{}',
  match_times JSONB DEFAULT '[]',
  matched BOOLEAN NOT NULL DEFAULT false
);

-- Attendees
CREATE TABLE attendees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  auth_token TEXT UNIQUE NOT NULL DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  responses JSONB DEFAULT '{}',
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Matches
CREATE TABLE matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  attendee_a_id UUID NOT NULL REFERENCES attendees(id) ON DELETE CASCADE,
  attendee_b_id UUID NOT NULL REFERENCES attendees(id) ON DELETE CASCADE
);

-- OTP codes
CREATE TABLE otp_codes (
  email TEXT PRIMARY KEY,
  code TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL
);
