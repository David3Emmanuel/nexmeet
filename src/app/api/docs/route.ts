import { NextResponse } from 'next/server'

const spec = {
  openapi: '3.0.3',
  info: {
    title: 'NexMeet API',
    version: '2.0.0',
    description:
      'Backend API for NexMeet — a B2C social networking platform built around events. ' +
      'Users create and attend events; AI pairs attendees; matches persist as cross-event connections.',
  },
  servers: [{ url: '/api' }],
  components: {
    securitySchemes: {
      sessionCookie: { type: 'apiKey', in: 'cookie', name: 'nexmeet_session', description: 'JWT set after OTP verify or Google OAuth callback.' },
      attendeeToken: { type: 'apiKey', in: 'header', name: 'X-Attendee-Token', description: 'Per-registration auth_token delivered via confirmation email.' },
      cronSecret: { type: 'http', scheme: 'bearer', description: 'CRON_SECRET env var — used by external scheduler only.' },
    },
    schemas: {
      // ── Primitives ──────────────────────────────────────────────────────────
      Error: {
        type: 'object',
        properties: { error: { type: 'string' } },
      },
      ThemeConfig: {
        type: 'object',
        description: 'Stored event theme (4 fields). Subset of GeneratedTheme.',
        properties: {
          background: { type: 'string', example: '#ffffff' },
          foreground: { type: 'string', example: '#111111' },
          accent: { type: 'string', example: '#4f46e5' },
          fontFamily: { type: 'string', example: 'Inter, sans-serif' },
        },
      },
      GeneratedTheme: {
        type: 'object',
        description: 'Full theme returned by AI generation. Extends ThemeConfig with font and mood metadata.',
        properties: {
          background: { type: 'string', example: '#ffffff' },
          foreground: { type: 'string', example: '#111111' },
          accent: { type: 'string', example: '#4f46e5' },
          fontFamily: { type: 'string', example: 'Inter, sans-serif' },
          accentForeground: { type: 'string', example: '#ffffff', description: 'Text/icon color that sits ON the accent.' },
          fontKind: { type: 'string', enum: ['sans', 'serif', 'display', 'mono'] },
          mood: { type: 'string', example: 'sleek corporate', description: 'One-line vibe description from the AI.' },
        },
      },
      FormQuestion: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          question: { type: 'string' },
          helperText: { type: 'string' },
        },
      },

      // ── Domain ───────────────────────────────────────────────────────────────
      User: {
        type: 'object',
        description: 'A NexMeet user. Replaces both the old Organizer and Attendee identities.',
        properties: {
          id: { type: 'string', format: 'uuid' },
          email: { type: 'string', format: 'email' },
          name: { type: 'string', nullable: true },
          phone: { type: 'string', nullable: true },
          avatar_url: { type: 'string', format: 'uri', nullable: true },
          created_at: { type: 'string', format: 'date-time' },
        },
      },
      EventSummary: {
        type: 'object',
        description: 'Event row as returned in list and feed responses.',
        properties: {
          id: { type: 'string', format: 'uuid' },
          created_by: { type: 'string', format: 'uuid', description: 'User ID of the event creator.' },
          title: { type: 'string' },
          about: { type: 'string' },
          image_url: { type: 'string', format: 'uri' },
          theme_config: { $ref: '#/components/schemas/ThemeConfig' },
          match_times: { type: 'array', items: { type: 'string', format: 'date-time' } },
          matched: { type: 'boolean' },
          promoted: { type: 'boolean' },
        },
      },
      EventRegistration: {
        type: 'object',
        description: 'A user\'s registration record for a specific event.',
        properties: {
          id: { type: 'string', format: 'uuid' },
          event_id: { type: 'string', format: 'uuid' },
          user_id: { type: 'string', format: 'uuid' },
          responses: { type: 'object', additionalProperties: { type: 'string' } },
          lat: { type: 'number', nullable: true },
          lng: { type: 'number', nullable: true },
          updated_at: { type: 'string', format: 'date-time' },
        },
      },
      Connection: {
        type: 'object',
        description: 'A persistent cross-event connection between two users, created when AI matches them.',
        properties: {
          id: { type: 'string', format: 'uuid' },
          user_a_id: { type: 'string', format: 'uuid', description: 'The user who was matched (initiating side).' },
          user_b_id: { type: 'string', format: 'uuid', description: 'The user who receives the connection request.' },
          source_event_id: { type: 'string', format: 'uuid', description: 'The event where the match was generated.' },
          status: { type: 'string', enum: ['pending', 'accepted', 'declined'] },
          created_at: { type: 'string', format: 'date-time' },
        },
      },
    },
  },

  paths: {
    // ── Auth ──────────────────────────────────────────────────────────────────
    '/auth/otp/request': {
      post: {
        tags: ['Auth'],
        summary: 'Request OTP',
        description: 'Generates a 6-digit code and emails it to the user. Creates the user row on first use.',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { type: 'object', required: ['email'], properties: { email: { type: 'string', format: 'email' } } } } },
        },
        responses: {
          200: { description: 'OTP sent', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' } } } } } },
          400: { description: 'Bad request', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/auth/otp/verify': {
      post: {
        tags: ['Auth'],
        summary: 'Verify OTP — sets session cookie',
        description: 'Validates the 6-digit code, deletes it (single-use), upserts the user row, and sets a 7-day httpOnly JWT cookie.',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { type: 'object', required: ['email', 'code'], properties: { email: { type: 'string', format: 'email' }, code: { type: 'string', example: '123456' } } } } },
        },
        responses: {
          200: { description: 'Authenticated', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' } } } } } },
          401: { description: 'Invalid or expired code', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/auth/google': {
      get: {
        tags: ['Auth'],
        summary: 'Initiate Google OAuth',
        description: 'Returns the Google OAuth authorization URL. Frontend should redirect the user to this URL.',
        responses: {
          200: { description: 'OAuth URL', content: { 'application/json': { schema: { type: 'object', properties: { url: { type: 'string', format: 'uri' } } } } } },
        },
      },
    },
    '/auth/google/callback': {
      get: {
        tags: ['Auth'],
        summary: 'Google OAuth callback',
        description: 'Exchanges the authorization code for a Google profile. Upserts user by google_id or email (accounts are linked if the same email exists from OTP). Sets session cookie and redirects.',
        parameters: [{ name: 'code', in: 'query', required: true, schema: { type: 'string' } }],
        responses: {
          302: { description: 'Redirect to app with session cookie set.' },
          400: { description: 'Missing or invalid code.' },
        },
      },
    },
    '/auth/session': {
      get: {
        tags: ['Auth'],
        summary: 'Get current session',
        security: [{ sessionCookie: [] }],
        responses: {
          200: { description: 'Active session', content: { 'application/json': { schema: { type: 'object', properties: { session: { type: 'object', properties: { email: { type: 'string' } } } } } } } },
          401: { description: 'No session' },
        },
      },
    },

    // ── Users ─────────────────────────────────────────────────────────────────
    '/users/me': {
      get: {
        tags: ['Users'],
        summary: 'Get current user profile',
        security: [{ sessionCookie: [] }],
        responses: {
          200: { description: 'User profile', content: { 'application/json': { schema: { type: 'object', properties: { user: { $ref: '#/components/schemas/User' } } } } } },
          401: { description: 'Unauthorized' },
        },
      },
      patch: {
        tags: ['Users'],
        summary: 'Update current user profile',
        security: [{ sessionCookie: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  phone: { type: 'string' },
                  avatar_url: { type: 'string', format: 'uri' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Updated', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' } } } } } },
          400: { description: 'Nothing to update' },
          401: { description: 'Unauthorized' },
        },
      },
    },

    // ── Connections ───────────────────────────────────────────────────────────
    '/connections': {
      get: {
        tags: ['Connections'],
        summary: 'List accepted connections for the current user',
        security: [{ sessionCookie: [] }],
        responses: {
          200: {
            description: 'Accepted connections with peer user profile included.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    connections: {
                      type: 'array',
                      items: {
                        allOf: [
                          { $ref: '#/components/schemas/Connection' },
                          { type: 'object', properties: { peer: { $ref: '#/components/schemas/User' } } },
                        ],
                      },
                    },
                  },
                },
              },
            },
          },
          401: { description: 'Unauthorized' },
        },
      },
    },
    '/connections/{id}': {
      patch: {
        tags: ['Connections'],
        summary: 'Accept or decline a connection request',
        description: 'Only the receiving user (user_b_id) may update the status.',
        security: [{ sessionCookie: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['status'],
                properties: { status: { type: 'string', enum: ['accepted', 'declined'] } },
              },
            },
          },
        },
        responses: {
          200: { description: 'Status updated', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' } } } } } },
          401: { description: 'Unauthorized' },
          403: { description: 'Not the recipient of this connection request' },
          404: { description: 'Connection not found' },
        },
      },
    },

    // ── AI ────────────────────────────────────────────────────────────────────
    '/ai/theme': {
      post: {
        tags: ['AI'],
        summary: 'Generate theme from event flyer',
        security: [{ sessionCookie: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { type: 'object', required: ['image_url'], properties: { title: { type: 'string' }, about: { type: 'string' }, image_url: { type: 'string', format: 'uri' } } },
            },
          },
        },
        responses: {
          200: { description: 'Generated theme', content: { 'application/json': { schema: { type: 'object', properties: { theme_config: { $ref: '#/components/schemas/GeneratedTheme' } } } } } },
          400: { description: 'image_url missing', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          401: { description: 'Unauthorized' },
        },
      },
    },
    '/ai/questions': {
      post: {
        tags: ['AI'],
        summary: 'Generate form questions for an event',
        security: [{ sessionCookie: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { type: 'object', required: ['title', 'about'], properties: { title: { type: 'string' }, about: { type: 'string' }, count: { type: 'integer', minimum: 1, maximum: 5, default: 5 } } },
            },
          },
        },
        responses: {
          200: { description: 'Generated questions', content: { 'application/json': { schema: { type: 'object', properties: { form_fields: { type: 'array', items: { $ref: '#/components/schemas/FormQuestion' } } } } } } },
          400: { description: 'title or about missing', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          401: { description: 'Unauthorized' },
        },
      },
    },

    // ── Events ────────────────────────────────────────────────────────────────
    '/events': {
      get: {
        tags: ['Events'],
        summary: 'Public event feed',
        description: 'Returns all events ordered by `promoted DESC, created_at DESC`. No auth required.',
        responses: {
          200: { description: 'Event list', content: { 'application/json': { schema: { type: 'object', properties: { events: { type: 'array', items: { $ref: '#/components/schemas/EventSummary' } } } } } } },
        },
      },
      post: {
        tags: ['Events'],
        summary: 'Create an event',
        description: 'Any authenticated user can create an event. Duplicate detection: if an event with the same (case-insensitive) title and date already exists, returns 409 with the existing event_id. Pass `force: true` to override.',
        security: [{ sessionCookie: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['title'],
                properties: {
                  title: { type: 'string' },
                  about: { type: 'string' },
                  image_url: { type: 'string', format: 'uri' },
                  form_fields: { type: 'array', items: { $ref: '#/components/schemas/FormQuestion' } },
                  theme_config: { $ref: '#/components/schemas/ThemeConfig' },
                  match_times: { type: 'array', items: { type: 'string', format: 'date-time' } },
                  force: { type: 'boolean', default: false, description: 'Skip duplicate detection and create regardless.' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Event created', content: { 'application/json': { schema: { type: 'object', properties: { event_id: { type: 'string', format: 'uuid' } } } } } },
          400: { description: 'title missing', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          401: { description: 'Unauthorized' },
          409: {
            description: 'Duplicate event detected.',
            content: { 'application/json': { schema: { type: 'object', properties: { error: { type: 'string' }, event_id: { type: 'string', format: 'uuid' } } } } },
          },
        },
      },
    },
    '/events/{id}': {
      get: {
        tags: ['Events'],
        summary: 'Get event (public, attendee-facing)',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: {
          200: { description: 'Event data', content: { 'application/json': { schema: { $ref: '#/components/schemas/EventSummary' } } } },
          404: { description: 'Not found' },
        },
      },
      patch: {
        tags: ['Events'],
        summary: 'Update an event (partial)',
        description: 'Requires session. Only the event creator can update (v1). Use canManageEvent helper server-side.',
        security: [{ sessionCookie: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  about: { type: 'string' },
                  image_url: { type: 'string', format: 'uri' },
                  form_fields: { type: 'array', items: { $ref: '#/components/schemas/FormQuestion' } },
                  theme_config: { $ref: '#/components/schemas/ThemeConfig' },
                  match_times: { type: 'array', items: { type: 'string', format: 'date-time' } },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Updated', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' } } } } } },
          400: { description: 'Nothing to update' },
          401: { description: 'Unauthorized' },
          404: { description: 'Not found or not owned' },
        },
      },
      delete: {
        tags: ['Events'],
        summary: 'Delete an event',
        security: [{ sessionCookie: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: {
          200: { description: 'Deleted', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' } } } } } },
          401: { description: 'Unauthorized' },
          404: { description: 'Not found or not owned' },
        },
      },
    },
    '/events/{id}/register': {
      post: {
        tags: ['Events'],
        summary: 'Register for an event',
        description:
          'Upserts the user by email, creates an `event_registrations` row, and sends a confirmation email containing the signed ticket URL (`/e/:id?ticket=AUTH_TOKEN`). ' +
          'After insertion, notifies all accepted connections of the registrant that they are attending.',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'email'],
                properties: {
                  name: { type: 'string' },
                  email: { type: 'string', format: 'email' },
                  phone: { type: 'string' },
                  responses: { type: 'object', additionalProperties: { type: 'string' } },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Registered — confirmation + connection notification emails sent.', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' } } } } } },
          400: { description: 'name or email missing' },
          404: { description: 'Event not found' },
        },
      },
    },
    '/events/{id}/match': {
      post: {
        tags: ['Events'],
        summary: 'Trigger AI matchmaking',
        description:
          'Runs AI matching for all registrants. Persists pairs to `matches`, creates `connections` rows (pending, deduped), marks `matched = true`, and sends match notification emails (fire-and-forget).',
        security: [{ sessionCookie: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: {
          200: { description: 'Matching complete', content: { 'application/json': { schema: { type: 'object', properties: { matched: { type: 'integer', description: 'Number of unique pairs generated.' } } } } } },
          400: { description: 'No registrants to match' },
          401: { description: 'Unauthorized' },
          404: { description: 'Event not found or not owned' },
        },
      },
    },
    '/events/{id}/attendees': {
      get: {
        tags: ['Events'],
        summary: 'List registrants for an event',
        description: 'Returns all event_registrations joined with user profiles. Only accessible by the event creator.',
        security: [{ sessionCookie: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: {
          200: {
            description: 'Registrant list',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    attendees: {
                      type: 'array',
                      items: {
                        allOf: [
                          { $ref: '#/components/schemas/EventRegistration' },
                          { type: 'object', properties: { name: { type: 'string' }, email: { type: 'string', format: 'email' }, phone: { type: 'string' } } },
                        ],
                      },
                    },
                    total: { type: 'integer' },
                  },
                },
              },
            },
          },
          401: { description: 'Unauthorized' },
          404: { description: 'Not found or not owned' },
        },
      },
    },
    '/events/{id}/matches': {
      get: {
        tags: ['Events'],
        summary: 'List match pairs for an event',
        security: [{ sessionCookie: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: {
          200: {
            description: 'Match pairs',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    matches: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          id: { type: 'string', format: 'uuid' },
                          attendee_a_id: { type: 'string', format: 'uuid' },
                          attendee_a_name: { type: 'string' },
                          attendee_b_id: { type: 'string', format: 'uuid' },
                          attendee_b_name: { type: 'string' },
                        },
                      },
                    },
                    total: { type: 'integer' },
                  },
                },
              },
            },
          },
          401: { description: 'Unauthorized' },
          404: { description: 'Not found or not owned' },
        },
      },
    },
    '/events/{id}/location': {
      put: {
        tags: ['Events'],
        summary: 'Update location and poll match positions',
        description:
          'Dual-purpose polling endpoint for the live map. Updates the registrant\'s coordinates in `event_registrations` and returns matched attendees\' current positions. ' +
          'Auth via `X-Attendee-Token` header (value is the `auth_token` from the confirmation email).',
        security: [{ attendeeToken: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { type: 'object', required: ['lat', 'lng'], properties: { lat: { type: 'number' }, lng: { type: 'number' } } } } },
        },
        responses: {
          200: {
            description: 'Match locations',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    matches: {
                      type: 'array',
                      items: { type: 'object', properties: { name: { type: 'string' }, lat: { type: 'number', nullable: true }, lng: { type: 'number', nullable: true } } },
                    },
                  },
                },
              },
            },
          },
          400: { description: 'lat or lng missing' },
          401: { description: 'Invalid or missing attendee token' },
        },
      },
    },

    // ── Cron ──────────────────────────────────────────────────────────────────
    '/cron/match': {
      get: {
        tags: ['Cron'],
        summary: 'Trigger scheduled matchmaking for all due events',
        description:
          'Called every minute by an external cron service (e.g. cron-job.org). ' +
          'Finds unmatched events whose earliest `match_time` has passed and runs `triggerMatch()` for each sequentially.',
        security: [{ cronSecret: [] }],
        responses: {
          200: { description: 'Ran successfully', content: { 'application/json': { schema: { type: 'object', properties: { triggered: { type: 'integer', description: 'Number of events matched this run.' } } } } } },
          401: { description: 'Missing or invalid CRON_SECRET' },
        },
      },
    },

    // ── Media ─────────────────────────────────────────────────────────────────
    '/media/upload': {
      post: {
        tags: ['Media'],
        summary: 'Upload image to Cloudinary',
        description: 'Validates type (JPEG/PNG/WebP/GIF) and size (max 5 MB), then proxies to Cloudinary via server-side SDK. Returns the `secure_url`.',
        requestBody: {
          required: true,
          content: { 'multipart/form-data': { schema: { type: 'object', required: ['file'], properties: { file: { type: 'string', format: 'binary' } } } } },
        },
        responses: {
          200: { description: 'Upload successful', content: { 'application/json': { schema: { type: 'object', properties: { url: { type: 'string', format: 'uri' } } } } } },
          400: { description: 'No file provided' },
          413: { description: 'File exceeds 5 MB limit' },
          415: { description: 'Unsupported file type' },
          500: { description: 'Upload failed' },
        },
      },
    },
  },
}

export async function GET() {
  return NextResponse.json(spec)
}
