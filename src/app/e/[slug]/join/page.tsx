'use client'

import { use, useState } from 'react'
import FormScreen from '@/components/attendee/FormScreen'
import FindingScreen from '@/components/attendee/FindingScreen'
import MatchesScreen from '@/components/attendee/MatchesScreen'
import DetailScreen from '@/components/attendee/DetailScreen'
import ShareSheet from '@/components/attendee/ShareSheet'
import MapScreen from '@/components/attendee/MapScreen'
import BottomNav from '@/components/attendee/BottomNav'
import { useRouter } from 'next/navigation'
import { DEMO_YOU, SEED, Match, YouProfile, generateMatches } from '@/lib/data'

type Screen = 'form' | 'finding' | 'matches' | 'detail' | 'map'

export default function JoinPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = use(params)
  const router = useRouter()
  const [screen, setScreen] = useState<Screen>('form')
  const [you, setYou] = useState<YouProfile>(DEMO_YOU)
  const [matches, setMatches] = useState<Match[]>([])
  const [active, setActive] = useState<Match | null>(null)
  const [share, setShare] = useState(false)
  const [met, setMet] = useState<Record<string, boolean>>({})
  const [locGranted, setLocGranted] = useState(false)
  const [roomCount, setRoomCount] = useState(SEED.length + 1)

  const submit = (profile: YouProfile) => {
    setYou(profile)
    setScreen('finding')
    setMatches(generateMatches(profile, SEED))
  }

  const refresh = () => {
    setRoomCount((c) => c + 3)
    setMatches(generateMatches(you, SEED))
  }

  return (
    /* Responsive attendee container — no phone shell */
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--paper)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      {/* Constrained content column */}
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
          <FindingScreen you={you} onDone={() => setScreen('matches')} />
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
                  count={roomCount}
                  onOpen={(m) => {
                    setActive(m)
                    setScreen('detail')
                  }}
                  onMap={() => setScreen('map')}
                  onRefresh={refresh}
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
