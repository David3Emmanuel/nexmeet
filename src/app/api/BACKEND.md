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
       └─► [ Email API ] (Magic links & match notifications)
```

### Key Architectural Decisions

- **Database over WebSockets:** Instead of persistent WebSocket connections for location tracking, the architecture uses **HTTP short polling**. The client `PUT`s its location and receives match data in a single stateless request-response cycle.
- **Storage Offloading:** The backend never handles image binary data. The frontend requests a pre-signed URL to upload flyers directly to external storage, and only the final URL string is stored in the database.
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

## Authentication & Authorization

### Organizer Authentication: Auth0 Passwordless (OTP)

Organizers authenticate via Auth0's passwordless OTP flow — no passwords, no custom JWT logic. Auth0 handles session management and token validation. Protected API routes verify the Auth0 session server-side.

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

### Organizer System (Protected via Auth0)

#### `POST /api/events/generate/theme`

- **Purpose:** Uses an LLM to generate a `theme_config` from the event title and description.
- **Payload:** `{ title: string, about: string }`
- **Response:** `{ theme_config: { foreground, background, accent, fontFamily } }`

#### `POST /api/events/generate/questions`

- **Purpose:** Uses an LLM to generate up to 5 event-specific form questions.
- **Payload:** `{ title: string, about: string }`
- **Response:** `{ form_fields: FormField[] }` — `text`/`textarea` types only, excludes base fields

#### `POST /api/events`

- **Purpose:** Creates the event record once the organizer approves or edits the AI-generated layout.
- **Payload:** `{ title, about, image_url, form_fields, theme_config, match_times }`
- **Response:** `{ event_id: "UUID" }`

#### `POST /api/events/:id/match`

- **Purpose:** Triggers AI-powered matchmaking for the event. Can also be invoked automatically at a scheduled match time.
- **Payload:** None
- **Action:** Queries all attendees and their responses, uses an LLM to pair them, populates the `Matches` table, sets `Events.matched = true`, and sends match notification emails.

### Attendee System (Public & Signed-URL Access)

#### `GET /api/events/:id`

- **Purpose:** Fetches event data to render the registration form on the client.
- **Auth:** Public.
- **Response:** `{ title, about, image_url, form_fields, theme_config }`

#### `POST /api/events/:id/register`

- **Purpose:** Processes attendee registration.
- **Auth:** Public.
- **Payload:** `{ name, email, phone, responses: { ... } }`
- **Response:** `{ success: true }` _(Triggers a confirmation email with the signed URL ticket)._

#### `PUT /api/attendees/location`

- **Purpose:** Dual-purpose polling endpoint for the live map. The client sends coordinates and receives match locations in return.
- **Auth:** Validates `X-Attendee-Token: <ATTENDEE_AUTH_TOKEN>` header.
- **Payload:** `{ lat: float, lng: float }`
- **Response:**
  ```json
  {
    "matches": [
      { "name": "Jane Doe", "lat": 40.7128, "lng": -74.0060 }
    ]
  }
  ```

### Identity System

#### Auth0 OTP Flow

Organizer authentication is handled entirely by Auth0's passwordless flow. No custom `/api/auth` endpoints are needed for OTP dispatch or token exchange — Auth0's SDK handles these automatically.
