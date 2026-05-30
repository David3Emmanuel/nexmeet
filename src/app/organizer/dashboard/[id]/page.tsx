'use client'

import { use } from 'react'
import { useRouter } from 'next/navigation'
import AuthGuard from '@/components/auth/AuthGuard'
import OrganizerShell from '@/components/organizer/OrganizerShell'
import OrganizerDashboard from '@/components/organizer/OrganizerDashboard'

export default function DashboardPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()

  const eventName = id
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())

  return (
    <AuthGuard>
      <OrganizerShell>
        <div
          style={{
            flex: 1,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <OrganizerDashboard
            eventId={id}
            onExit={() => router.push(`/e/${id}`)}
            onHome={() => router.push('/organizer')}
            onNewEvent={() => router.push('/organizer/create')}
          />
        </div>
      </OrganizerShell>
    </AuthGuard>
  )
}
