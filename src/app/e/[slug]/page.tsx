import type { Metadata } from 'next';
import EventLanding from '../../../components/attendee/EventLanding';
import { pool } from '@/lib/db';
import { notFound } from 'next/navigation';

async function getEventBySlug(slug: string) {
  const { rows } = await pool.query(
    `SELECT e.id, e.title as name, e.about, e.image_url as flyer, e.theme_config, e.event_date as date, e.venue,
            (SELECT count(*) FROM attendees a WHERE a.event_id = e.id) as "attendeeCount"
     FROM events e 
     WHERE e.slug = $1 OR e.id::text = $1 OR upper(e.short_code) = upper($1)`,
    [slug]
  );
  
  if (rows.length === 0) return null;
  
  const ev = rows[0];
  const theme = ev.theme_config ? (typeof ev.theme_config === 'string' ? JSON.parse(ev.theme_config) : ev.theme_config) : {};

  return {
    slug,
    name: ev.name,
    type: 'Event',
    date: ev.date || 'TBA',
    venue: ev.venue || 'TBA',
    organizer: 'Organizer',
    about: ev.about || '',
    attendeeCount: parseInt(ev.attendeeCount, 10),
    accent: theme.accent || '#FF5A2C',
    flyer: ev.flyer,
    theme: theme,
  };
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const event = await getEventBySlug(resolvedParams.slug);
  
  if (!event) return { title: 'Not Found — NexMeet' };
  
  return {
    title: `${event.name} — NexMeet`,
    description: `Join ${event.name} on NexMeet. AI matches you with the right people in seconds.`,
  };
}

export default async function EventPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const event = await getEventBySlug(resolvedParams.slug);
  
  if (!event) notFound();
  
  return <EventLanding event={event} />;
}
