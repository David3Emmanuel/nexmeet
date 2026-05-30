'use client'

import { use, useState, useEffect, useRef } from 'react'
import FormScreen from '@/components/attendee/FormScreen'
import FindingScreen from '@/components/attendee/FindingScreen'
import MatchesScreen from '@/components/attendee/MatchesScreen'
import DetailScreen from '@/components/attendee/DetailScreen'
import ShareSheet from '@/components/attendee/ShareSheet'
import MapScreen from '@/components/attendee/MapScreen'
import BottomNav from '@/components/attendee/BottomNav'
import { useRouter } from 'next/navigation'

type Screen = 'form' | 'finding' | 'matches' | 'detail' | 'map'

export default function JoinPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = use(params)
  const router = useRouter()
  const [screen, setScreen] = useState<Screen>('form')
  const [you, setYou] = useState<any>({ name: '', email: '', responses: {} })
  const [matches, setMatches] = useState<any[]>([])
  const [active, setActive] = useState<any | null>(null)
  const [share, setShare] = useState(false)
  const [met, setMet] = useState<Record<string, boolean>>({})
  const [locGranted, setLocGranted] = useState(false)
  const [authToken, setAuthToken] = useState<string | null>(null)

  // Real event data from DB
  const [eventData, setEventData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const pollingRef = useRef(false)

  // Fetch event (form_fields + theme_config) on mount
  useEffect(() => {
    fetch(`/api/events/${slug}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (d) setEventData(d)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [slug])

  // Apply the event theme to CSS vars on this page
  useEffect(() => {
    if (!eventData?.theme_config) return
    const tc = typeof eventData.theme_config === 'string'
      ? JSON.parse(eventData.theme_config)
      : eventData.theme_config

    const root = document.documentElement
    if (tc.background) root.style.setProperty('--paper', tc.background)
    if (tc.foreground) {
      root.style.setProperty('--ink', tc.foreground)
      root.style.setProperty('--ink-2', `color-mix(in srgb, ${tc.foreground} 75%, ${tc.background || '#fff'})`)
      root.style.setProperty('--ink-3', `color-mix(in srgb, ${tc.foreground} 45%, ${tc.background || '#fff'})`)
    }
    if (tc.accent) root.style.setProperty('--accent', tc.accent)
    if (tc.fontFamily) root.style.setProperty('font-family', tc.fontFamily)
  }, [eventData])

  useEffect(() => {
    const token = localStorage.getItem(`nexmeet:token:${slug}`)
    if (token) {
      setAuthToken(token)
      checkMatchStatus(token)
    }
  }, [slug])

  const checkMatchStatus = async (token: string) => {
    try {
      const res = await fetch(`/api/events/${slug}`)
      const data = await res.json()
      if (data.matched) {
        await fetchMatches(token)
      } else {
        setScreen('finding')
      }
    } catch (e) {}
  }

  const fetchMatches = async (token: string) => {
    try {
      const res = await fetch(`/api/events/${slug}/matches?auth_token=${token}`)
      const data = await res.json()
      if (data.matches) {
        const mappedMatches = data.matches.map((m: any, i: number) => ({
          id: m.id,
          name: m.matched_name,
          color: ['var(--plum)', 'var(--forest)', 'var(--sky)', 'var(--tangerine)', 'var(--berry)'][i % 5],
          reason: m.matched_responses?.looking_for || 'Great potential connection based on your profiles.',
          score: 90 + (i % 10),
          lookingFor: m.matched_responses?.looking_for || '',
          answers: m.matched_responses || {}
        }))
        setMatches(mappedMatches)
        setScreen('matches')
      }
    } catch (e) {}
  }

  // Poll while on finding screen
  useEffect(() => {
    if (screen !== 'finding' || !authToken) return

    const id = setInterval(async () => {
      if (pollingRef.current) return
      pollingRef.current = true
      try {
        const res = await fetch(`/api/events/${slug}`)
        const data = await res.json()
        if (data.matched) {
          clearInterval(id)
          await fetchMatches(authToken)
        }
      } catch (e) {}
      finally {
        pollingRef.current = false
      }
    }, 3000)

    return () => clearInterval(id)
  }, [screen, authToken, slug])

  const submit = async (profile: any) => {
    setYou(profile)
    setScreen('finding')

    try {
      const res = await fetch(`/api/events/${slug}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: profile.name,
          email: profile.email || `${profile.name.replace(/\s/g, '').toLowerCase()}${Math.random().toString().substring(2, 6)}@example.com`,
          responses: profile.answers,
        }),
      })
      const data = await res.json()
      if (data.auth_token) {
        setAuthToken(data.auth_token)
        localStorage.setItem(`nexmeet:token:${slug}`, data.auth_token)
      }
    } catch (e) {
      console.error(e)
    }
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--paper)' }}>
        <div style={{ textAlign: 'center', color: 'var(--ink-3)' }}>Loading event...</div>
      </div>
    )
  }

  // Parse form_fields from DB — DB stores { name, label, type, required }
  // FormScreen expects { id, label, type, required }
  const rawFields = eventData?.form_fields
  const parsedRaw: any[] = Array.isArray(rawFields)
    ? rawFields
    : (typeof rawFields === 'string' ? (() => { try { return JSON.parse(rawFields); } catch { return []; } })() : [])
  const formFields = parsedRaw.map((f: any) => ({
    id: f.id || f.name || f.label?.toLowerCase().replace(/[^a-z0-9]/g, '') || String(Math.random()),
    label: f.label || f.question || f.name || '',
    type: f.type || 'text',
    required: !!f.required,
  }))

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--paper)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 480,
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {screen === 'form' && (
          <FormScreen
            initial={you}
            formFields={formFields}
            onBack={() => router.push(`/e/${slug}`)}
            onSubmit={submit}
          />
        )}
        {screen === 'finding' && (
          <FindingScreen you={you} onDone={() => { /* driven by polling */ }} onRestart={() => {
            localStorage.removeItem(`nexmeet:token:${slug}`);
            setAuthToken(null);
            setYou({ name: '', email: '', responses: {} });
            setMatches([]);
            setScreen('form');
          }} />
        )}
        {(screen === 'matches' || screen === 'map') && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                flex: 1,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {screen === 'matches' && (
                <MatchesScreen
                  you={you}
                  matches={matches}
                  count={matches.length}
                  onOpen={(m) => {
                    setActive(m)
                    setScreen('detail')
                  }}
                  onMap={() => setScreen('map')}
                  onRefresh={() => fetchMatches(authToken!)}
                  onRestart={() => {
                    localStorage.removeItem(`nexmeet:token:${slug}`);
                    setAuthToken(null);
                    setYou({ name: '', email: '', responses: {} });
                    setMatches([]);
                    setScreen('form');
                  }}
                />
              )}
              {screen === 'map' && (
                <MapScreen
                  you={you}
                  matches={matches}
                  granted={locGranted}
                  onGrant={() => setLocGranted(true)}
                  onSkip={() => setScreen('matches')}
                  onOpenMatch={(m) => {
                    setActive(m)
                    setScreen('detail')
                  }}
                />
              )}
            </div>
            <BottomNav
              active={screen}
              onNav={(id) => setScreen(id as Screen)}
            />
          </div>
        )}
        {screen === 'detail' && active && (
          <>
            <DetailScreen
              you={you}
              match={active}
              met={!!met[active.id]}
              onBack={() => setScreen('matches')}
              onShare={() => setShare(true)}
              onMet={() => setMet({ ...met, [active.id]: !met[active.id] })}
            />
            {share && (
              <ShareSheet
                match={active}
                you={you}
                onClose={() => setShare(false)}
              />
            )}
          </>
        )}
      </div>
    </div>
  )
}
