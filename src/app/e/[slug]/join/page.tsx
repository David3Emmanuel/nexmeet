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
  
  // Track if we are currently polling to avoid overlapping requests
  const pollingRef = useRef(false)

  useEffect(() => {
    // Check if we already have a token
    const token = localStorage.getItem(`nexmeet:token:${slug}`)
    if (token) {
      setAuthToken(token)
      // Check if already matched
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
        // Map DB matches to frontend format
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

  // Polling effect while on finding screen
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
          email: profile.email || `${profile.name.replace(/\s/g, '').toLowerCase()}${Math.random().toString().substring(2,6)}@example.com`,
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
            onBack={() => router.push(`/e/${slug}`)}
            onSubmit={submit}
          />
        )}
        {screen === 'finding' && (
          <FindingScreen you={you} onDone={() => { /* now driven by polling */ }} />
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
                  onRestart={() => router.push(`/e/${slug}`)}
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
