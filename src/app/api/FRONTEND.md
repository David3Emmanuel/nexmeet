## Frontend Integration Guide

This document explains how the frontend interacts with the NexMeet backend. The Swagger UI at `/docs` has full request/response schemas — this guide covers the *flows* and gotchas that schemas alone don't capture.

---

## Base URL & Format

All API routes live under `/api/`. Requests and responses are JSON unless noted (media upload uses `multipart/form-data`). Error responses always have the shape `{ "error": "..." }`.

---

## Authentication

NexMeet supports two auth methods. Both end with the same result: an httpOnly JWT cookie (`nexmeet_session`) that the browser sends automatically with every subsequent request. You never need to manage the token manually.

### OTP (Email)

```
1.  POST /api/auth/otp/request  { email }
    → { success: true }  (email with 6-digit code sent)

2.  POST /api/auth/otp/verify   { email, code }
    → { success: true }  (nexmeet_session cookie set)
```

After step 2 the user is authenticated. All protected routes will work automatically.

### Google OAuth

```
1.  GET /api/auth/google
    → { url: "https://accounts.google.com/o/oauth2/v2/auth?..." }
    Redirect the user to this URL.

2.  Google redirects back to GET /api/auth/google/callback?code=...
    Backend exchanges the code, upserts the user row, sets session cookie,
    and redirects to the app.
```

Accounts are linked by email — if a user previously signed in via OTP with the same email address, they get the same user row.

### Checking the session

```
GET /api/auth/session
→ { session: { email: "..." } }   (200 if logged in)
→ 401                              (not logged in)
```

---

## User Profile

Once authenticated, the user's full profile is at:

```
GET /api/users/me
→ { user: { id, email, name, phone, avatar_url, created_at } }

PATCH /api/users/me  { name?, phone?, avatar_url? }
→ { success: true }
```

`name` and `phone` start as `null` — prompt the user to fill them in on first login.

---

## Creating Events

Any authenticated user can create an event. The typical flow is:

1. Upload the cover image first via `POST /api/media/upload` (see [Media](#media)).
2. Optionally generate a theme from the image via `POST /api/ai/theme`.
3. Optionally generate form questions via `POST /api/ai/questions`.
4. Submit the event via `POST /api/events`.

### Duplicate detection

If an event with the same title (case-insensitive) and date already exists, the API returns:

```json
HTTP 409
{ "error": "Event already exists", "event_id": "<uuid>" }
```

Show the user a message and a link to the existing event. If they want to create a separate event with the same name anyway (e.g., two independent groups), re-submit with `force: true` in the body.

---

## Event Feed

The public feed is available without auth:

```
GET /api/events
→ { events: [...] }
```

Events are ordered: **promoted first**, then newest. The `promoted` boolean flag is exposed on each event row.

---

## Registering for Events

Registration is public — no session required. The attendee supplies their name and email:

```
POST /api/events/:id/register
{ name, email, phone?, responses?: { questionId: "answer", ... } }
→ { success: true }
```

Two things happen immediately:
1. A confirmation email is sent containing a **signed ticket URL**: `/e/:id?ticket=AUTH_TOKEN`
2. All of the registrant's accepted connections receive an email notification that this person is attending.

The `auth_token` in the ticket URL is how the attendee authenticates for the live map — see [Live Map](#live-map).

---

## Connections

Connections are created automatically when AI matching fires. They start as `pending` and must be accepted by the recipient.

### Listing connections

```
GET /api/connections
→ {
    connections: [
      { id, user_a_id, user_b_id, source_event_id, status, created_at, peer: { ...User } }
    ]
  }
```

`peer` is the other user's profile — no second request needed.

### Accepting / declining

```
PATCH /api/connections/:id  { status: "accepted" | "declined" }
→ { success: true }
```

Only the recipient (`user_b_id`) can update the status. You'll get a `403` if you try as the initiator.

### Notification flow (FYI, backend-driven)

When a user registers for a new event, the backend automatically emails all their **accepted** connections. The frontend does nothing special here — it's fire-and-forget on the server side.

---

## Live Map

The live map uses HTTP short-polling — there is no WebSocket.

1. Read the `ticket` query param from the URL (placed there by the confirmation email link).
2. On an interval (e.g. every 5–10 seconds), call:

```
PUT /api/events/:id/location
Headers: X-Attendee-Token: <ticket value>
Body: { lat: number, lng: number }

→ {
    matches: [
      { name: "Jane Doe", lat: 40.7128, lng: -74.0060 },
      ...
    ]
  }
```

This both updates the caller's position **and** returns the current positions of everyone they matched with at this event. `lat`/`lng` can be `null` if a match hasn't shared their location yet.

---

## Event Management (Creator Only)

These routes require a session cookie and will 404 if the caller doesn't own the event.

```
PATCH  /api/events/:id     { title?, about?, image_url?, form_fields?, theme_config?, match_times? }
DELETE /api/events/:id

GET    /api/events/:id/attendees   → { attendees: [...], total }
GET    /api/events/:id/matches     → { matches: [...], total }

POST   /api/events/:id/match       → { matched: <pair count> }
```

`POST /events/:id/match` triggers AI matchmaking manually. It can also fire automatically via the cron job if `match_times` has a past timestamp — no frontend action needed.

---

## AI Utilities (Creator-Facing, Session Required)

### Theme generation

```
POST /api/ai/theme
{ image_url: "https://...", title?: "...", about?: "..." }

→ {
    theme_config: {
      background, foreground, accent, fontFamily,   // store these 4
      accentForeground, fontKind, mood               // use for display, don't store
    }
  }
```

Store only the 4-field `ThemeConfig` subset in `theme_config`. The extra fields (`accentForeground`, `fontKind`, `mood`) are for local UI rendering.

### Question generation

```
POST /api/ai/questions
{ title: "...", about: "...", count?: 1–5 }

→ { form_fields: [{ id, question, helperText }, ...] }
```

These questions are appended to the fixed base fields (Name, Email, Phone, "Who are you looking to meet?"). Pass the combined array as `form_fields` when creating/updating the event.

---

## Media Upload

```
POST /api/media/upload
Content-Type: multipart/form-data
field: file  (the image File object)

→ { url: "https://res.cloudinary.com/..." }
```

**Constraints:** JPEG, PNG, WebP, or GIF only. Max 5 MB. The returned `url` is a Cloudinary `secure_url` — store it directly in `image_url` on the event or `avatar_url` on the user.

**Error codes to handle:**
- `413` — file too large
- `415` — unsupported type

---

## Environment Variables (Frontend)

| Variable | Used for |
|----------|----------|
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Cloudinary widget config (if using the widget directly — not needed when going through `/api/media/upload`) |
| `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` | Same as above |

The frontend does **not** need `CLOUDINARY_API_KEY` or `CLOUDINARY_API_SECRET` — those are server-only.
