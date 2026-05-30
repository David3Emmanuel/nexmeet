## Backend Architecture & Stack

The backend is a **Next.js app router** with API routes under `src/app/api/`, deployed as serverless functions.

```
[ Frontend Client ]
       │
       ▼ (HTTPS / JSON)
[ Next.js API Routes ] (src/app/api/)
       │
       ├─► [ Database ] (Raw PostgreSQL connection)
       ├─► [ LLM API ] (Anthropic - theme generation, question generation, matchmaking)
       └─► [ Email ] (Nodemailer + Gmail SMTP)
```

### Key Architectural Decisions

- **Database over WebSockets:** Instead of persistent WebSocket connections for location tracking, the architecture uses **HTTP short polling**. The client `PUT`s its location and receives match data in a single stateless request-response cycle.
- **Storage Offloading:** The backend never handles image binary data. The frontend uploads flyers directly to Cloudinary via the `ImageDrop` component (`src/components/ui/ImageDrop.tsx`), which POSTs to the Cloudinary unsigned upload API using `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` and `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET`. Only the resulting `secure_url` string is stored in the database.
- **AI-Powered Matching:** Matching is triggered on-demand (via organizer action or scheduled job) and uses an LLM to pair attendees based on their form responses.

## Entities & Database Schema

The database uses a flat relational structure with JSON columns for dynamic frontend configurations.

```
┌──────────────────┐       ┌──────────────────┐
│    Organizers    │       │      Events      │
├──────────────────┤       ├──────────────────┤
│ id (PK)          │◄───── │ id (PK)          │
│ email (Unique)   │       │ organizer_id (FK)│
└──────────────────┘       │ title            │
                           │ about            │
                           │ image_url        │
                           │ form_fields(JSON)│
                           │ theme_config(JSON│
                           │ match_times(JSON)│
                           │ matched (Bool)   │
                           └──────────────────┘
                                    │
                                    ├───┐
                                    │   ▼
┌──────────────────┐                │ ┌──────────────────┐
│     Matches      │                │ │    Attendees     │
├──────────────────┤                │ ├──────────────────┤
│ id (PK)          │                └►│ id (PK)          │
│ event_id (FK)    │◄──────────────── │ event_id (FK)    │
│ attendee_a_id(FK)│◄──────────────── │ auth_token (UQ)  │
│ attendee_b_id(FK)│                  │ name             │
└──────────────────┘                  │ email            │
                                      │ phone            │
                                      │ responses (JSON) │
                                      │ lat (Float)      │
                                      │ lng (Float)      │
                                      │ updated_at       │
                                      └──────────────────┘

┌──────────────────┐
│    OTP Codes     │
├──────────────────┤
│ email (PK)       │
│ code             │
│ expires_at       │
└──────────────────┘
```

### 1. Organizers

Tracks authenticated event creators.

- `id`: UUID (Primary Key)
- `email`: String (Unique)

### 2. Events

Stores organizer configurations and generated metadata.

- `id`: UUID (Primary Key)
- `organizer_id`: UUID (Foreign Key -> Organizers.id)
- `title`: String
- `about`: Text
- `image_url`: String (Pointer to external storage)
- `form_fields`: JSON (Base fields + up to 5 AI-generated fields)
- `theme_config`: JSON (`{ foreground, background, accent, fontFamily }`)
- `match_times`: JSON (Array of Timestamps — one or more scheduled match times)
- `matched`: Boolean (Default: `false`)

### 3. Attendees

Tracks registration data and transient map coordinates.

- `id`: UUID (Primary Key)
- `event_id`: UUID (Foreign Key -> Events.id)
- `auth_token`: String (Unique, unguessable token for signed URLs)
- `name`: String
- `email`: String
- `phone`: String
- `responses`: JSON (Key-value object storing dynamic form answers)
- `lat`: Float (Nullable)
- `lng`: Float (Nullable)
- `updated_at`: Timestamp

### 4. Matches

A join table populated when the matching mechanism executes.

- `id`: UUID (Primary Key)
- `event_id`: UUID (Foreign Key -> Events.id)
- `attendee_a_id`: UUID (Foreign Key -> Attendees.id)
- `attendee_b_id`: UUID (Foreign Key -> Attendees.id)

### 5. OTP Codes

Transient table for organizer login codes. Rows are deleted on successful verification.

- `email`: Text (Primary Key)
- `code`: Text (6-digit code)
- `expires_at`: Timestamp (15-minute TTL)

## Authentication & Authorization

### Organizer Authentication: Custom OTP

1. **Request:** Organizer submits their email to `POST /api/auth/otp/request`.
2. **Issue:** Backend generates a 6-digit code, upserts it into `otp_codes` with a 15-minute expiry, and sends it via Nodemailer.
3. **Verify:** Organizer submits their email + code to `POST /api/auth/otp/verify`. Backend deletes the row (single-use) and sets an `httpOnly` JWT session cookie valid for 7 days.
4. **Session:** Protected routes call `getSession()` from `src/lib/auth.ts` to verify the cookie server-side.

Relevant files: `src/lib/auth.ts`, `src/lib/email.ts`

### Attendee Authentication: Contextual Signed URLs

Attendees never sign up or manage accounts.

1. **Registration:** Upon form submission, the backend assigns a long random `auth_token` to the attendee record.
2. **Delivery:** The confirmation email contains a personalized link: `https://yourapp.com/event/:id/map?ticket=ATTENDEE_AUTH_TOKEN`.
3. **Access:** The `ticket` parameter is sent with requests to query match info and update coordinates. Authorization relies on matching this token against the database.

## Form Fields

Each event has a fixed set of base fields followed by AI-generated questions:

**Base fields** (always present, from `baseFormFields` in `src/lib/types.ts`):
- Name (text, required)
- Email (email, required)
- Phone (phone, required)
- "Who are you looking to meet?" (textarea, optional)

**AI-generated questions:** Up to 5 additional fields of type `text` or `textarea`, generated from the event title and description.

## API Endpoints

### Identity System

#### `POST /api/auth/otp/request`

- **Auth:** Public.
- **Purpose:** Generates a 6-digit OTP and emails it to the organizer.
- **Payload:** `{ email: string }`
- **Response:** `{ success: true }`

#### `POST /api/auth/otp/verify`

- **Auth:** Public.
- **Purpose:** Verifies the OTP and sets an `httpOnly` session cookie.
- **Payload:** `{ email: string, code: string }`
- **Response:** `{ success: true }`

---

### Organizer System (Protected — requires session cookie)

#### `POST /api/events/generate/theme`

- **Auth:** Session cookie (organizer).
- **Purpose:** Uses an LLM to generate a `theme_config` from the event title and description.
- **Payload:** `{ title: string, about: string, image_url: string }`
- **Response:** `{ theme_config: { foreground, background, accent, fontFamily } }`

#### `POST /api/events/generate/questions`

- **Auth:** Session cookie (organizer).
- **Purpose:** Uses an LLM to generate up to 5 event-specific form questions.
- **Payload:** `{ title: string, about: string }`
- **Response:** `{ form_fields: FormField[] }` — `text`/`textarea` types only, excludes base fields

#### `POST /api/events`

- **Auth:** Session cookie (organizer).
- **Purpose:** Creates the event record once the organizer approves or edits the AI-generated layout.
- **Payload:** `{ title, about, image_url, form_fields, theme_config, match_times }`
- **Response:** `{ event_id: "UUID" }`

#### `POST /api/events/:id/match`

- **Auth:** Session cookie (organizer) — must own the event.
- **Purpose:** Triggers AI-powered matchmaking for the event. Can also be invoked automatically at a scheduled match time.
- **Payload:** None
- **Action:** Queries all attendees and their responses, uses an LLM to pair them, populates the `Matches` table, sets `Events.matched = true`, and sends match notification emails.

---

### Attendee System (Public & Signed-URL Access)

#### `GET /api/events/:id`

- **Auth:** Public.
- **Purpose:** Fetches event data to render the registration form on the client.
- **Response:** `{ title, about, image_url, form_fields, theme_config }`

#### `POST /api/events/:id/register`

- **Auth:** Public.
- **Purpose:** Processes attendee registration.
- **Payload:** `{ name, email, phone, responses: { ... } }`
- **Response:** `{ success: true }` _(Triggers a confirmation email with the signed URL ticket)._

#### `PUT /api/attendees/location`

- **Auth:** `X-Attendee-Token: <ATTENDEE_AUTH_TOKEN>` header.
- **Purpose:** Dual-purpose polling endpoint for the live map. The client sends coordinates and receives match locations in return.
- **Payload:** `{ lat: float, lng: float }`
- **Response:**
  ```json
  {
    "matches": [
      { "name": "Jane Doe", "lat": 40.7128, "lng": -74.0060 }
    ]
  }
  ```
