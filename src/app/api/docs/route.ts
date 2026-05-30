import { NextResponse } from 'next/server'

const spec = {
  openapi: '3.0.3',
  info: { title: 'NexMeet API', version: '1.0.0', description: 'Backend API for the NexMeet event networking platform.' },
  servers: [{ url: '/api' }],
  components: {
    securitySchemes: {
      sessionCookie: { type: 'apiKey', in: 'cookie', name: 'nexmeet_session' },
      attendeeToken: { type: 'apiKey', in: 'header', name: 'X-Attendee-Token' },
    },
    schemas: {
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
        description: 'Full theme returned by AI generation. Extends ThemeConfig with accessibility and font metadata.',
        properties: {
          background: { type: 'string', example: '#ffffff' },
          foreground: { type: 'string', example: '#111111' },
          accent: { type: 'string', example: '#4f46e5' },
          fontFamily: { type: 'string', example: 'Inter, sans-serif' },
          accentForeground: { type: 'string', example: '#ffffff', description: 'Text/icon color that sits ON the accent color' },
          fontKind: { type: 'string', enum: ['sans', 'serif', 'display', 'mono'] },
          mood: { type: 'string', example: 'sleek corporate', description: 'One-line vibe description from the AI' },
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
      Error: {
        type: 'object',
        properties: { error: { type: 'string' } },
      },
    },
  },
  paths: {
    '/auth/otp/request': {
      post: {
        tags: ['Auth'],
        summary: 'Request OTP',
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['email'], properties: { email: { type: 'string', format: 'email' } } } } } },
        responses: {
          200: { description: 'OTP sent', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' } } } } } },
          400: { description: 'Bad request', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/auth/otp/verify': {
      post: {
        tags: ['Auth'],
        summary: 'Verify OTP and set session cookie',
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['email', 'code'], properties: { email: { type: 'string', format: 'email' }, code: { type: 'string', example: '123456' } } } } } },
        responses: {
          200: { description: 'Authenticated', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' } } } } } },
          401: { description: 'Invalid or expired code', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
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
    '/events/generate/theme': {
      post: {
        tags: ['Events — AI'],
        summary: 'Generate theme from event flyer',
        security: [{ sessionCookie: [] }],
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['image_url'], properties: { title: { type: 'string' }, about: { type: 'string' }, image_url: { type: 'string', format: 'uri' } } } } } },
        responses: {
          200: { description: 'Generated theme', content: { 'application/json': { schema: { type: 'object', properties: { theme_config: { $ref: '#/components/schemas/GeneratedTheme' } } } } } },
          400: { description: 'image_url missing', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          401: { description: 'Unauthorized' },
        },
      },
    },
    '/events/generate/questions': {
      post: {
        tags: ['Events — AI'],
        summary: 'Generate form questions for an event',
        security: [{ sessionCookie: [] }],
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['title', 'about'], properties: { title: { type: 'string' }, about: { type: 'string' }, count: { type: 'integer', minimum: 1, maximum: 5, default: 5 } } } } } },
        responses: {
          200: { description: 'Generated questions', content: { 'application/json': { schema: { type: 'object', properties: { form_fields: { type: 'array', items: { $ref: '#/components/schemas/FormQuestion' } } } } } } },
          400: { description: 'title or about missing', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          401: { description: 'Unauthorized' },
        },
      },
    },
    '/events': {
      post: {
        tags: ['Events'],
        summary: 'Create an event',
        security: [{ sessionCookie: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['title', 'about', 'form_fields', 'theme_config', 'match_times'],
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
          201: { description: 'Event created', content: { 'application/json': { schema: { type: 'object', properties: { event_id: { type: 'string', format: 'uuid' } } } } } },
          401: { description: 'Unauthorized' },
        },
      },
    },
    '/events/{id}': {
      get: {
        tags: ['Events'],
        summary: 'Get event (attendee-facing)',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: {
          200: { description: 'Event data', content: { 'application/json': { schema: { type: 'object', properties: { title: { type: 'string' }, about: { type: 'string' }, image_url: { type: 'string' }, form_fields: { type: 'array', items: { $ref: '#/components/schemas/FormQuestion' } }, theme_config: { $ref: '#/components/schemas/ThemeConfig' } } } } } },
          404: { description: 'Not found' },
        },
      },
    },
    '/events/{id}/register': {
      post: {
        tags: ['Events'],
        summary: 'Register as attendee',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['name', 'email', 'phone'], properties: { name: { type: 'string' }, email: { type: 'string', format: 'email' }, phone: { type: 'string' }, responses: { type: 'object', additionalProperties: { type: 'string' } } } } } } },
        responses: {
          200: { description: 'Registered — confirmation email sent', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' } } } } } },
          404: { description: 'Event not found' },
        },
      },
    },
    '/events/{id}/match': {
      post: {
        tags: ['Events'],
        summary: 'Trigger AI matchmaking',
        security: [{ sessionCookie: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: {
          200: { description: 'Matching complete' },
          401: { description: 'Unauthorized' },
          403: { description: 'Not your event' },
          404: { description: 'Event not found' },
        },
      },
    },
    '/attendees/location': {
      put: {
        tags: ['Attendees'],
        summary: 'Update location and poll matches',
        security: [{ attendeeToken: [] }],
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['lat', 'lng'], properties: { lat: { type: 'number' }, lng: { type: 'number' } } } } } },
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
                      items: { type: 'object', properties: { name: { type: 'string' }, lat: { type: 'number' }, lng: { type: 'number' } } },
                    },
                  },
                },
              },
            },
          },
          401: { description: 'Invalid or missing attendee token' },
        },
      },
    },
    '/media/upload': {
      post: {
        tags: ['Media'],
        summary: 'Upload image to Cloudinary',
        requestBody: { required: true, content: { 'multipart/form-data': { schema: { type: 'object', required: ['file'], properties: { file: { type: 'string', format: 'binary' } } } } } },
        responses: {
          200: { description: 'Upload successful', content: { 'application/json': { schema: { type: 'object', properties: { url: { type: 'string', format: 'uri' } } } } } },
          400: { description: 'No file provided' },
          500: { description: 'Upload failed' },
        },
      },
    },
  },
}

export async function GET() {
  return NextResponse.json(spec)
}
