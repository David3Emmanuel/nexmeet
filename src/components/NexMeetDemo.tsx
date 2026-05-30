'use client';

import { useState, useEffect } from 'react';
import PhoneShell from '@/components/PhoneShell';
import CoverScreen from '@/components/attendee/CoverScreen';
import FormScreen from '@/components/attendee/FormScreen';
import FindingScreen from '@/components/attendee/FindingScreen';
import MatchesScreen from '@/components/attendee/MatchesScreen';
import DetailScreen from '@/components/attendee/DetailScreen';
import ShareSheet from '@/components/attendee/ShareSheet';
import MapScreen from '@/components/attendee/MapScreen';
import BottomNav from '@/components/attendee/BottomNav';
import OrganizerHome from '@/components/organizer/OrganizerHome';
import OrganizerCreate from '@/components/organizer/OrganizerCreate';
import OrganizerDashboard from '@/components/organizer/OrganizerDashboard';
import TweaksPanel, {
  useTweaks, TweakSection, TweakColor, TweakSelect, TweakSlider, TweakToggle,
} from '@/components/TweaksPanel';
import { DEMO_YOU, EVENT, SEED, Match, YouProfile, generateMatches } from '@/lib/data';

const TWEAK_DEFAULTS = { accent: "#FF5A2C", radius: 26, font: "Bricolage", dark: false };

const FONT_MAP: Record<string, { display: string; body: string }> = {
  "Bricolage": { display: '"Bricolage Grotesque", sans-serif', body: '"Hanken Grotesk", sans-serif' },
  "Clean": { display: '"Space Grotesk", sans-serif', body: '"Hanken Grotesk", sans-serif' },
  "Serif": { display: '"Fraunces", serif', body: '"Hanken Grotesk", sans-serif' },
};

const ACCENTS = ["#FF5A2C", "#2F6BFF", "#1F8A5B", "#7A3E9D", "#E0356B"];

type AttendeeScreen = "cover" | "form" | "finding" | "matches" | "detail" | "map";
type OrgScreen = "home" | "create" | "dashboard";

export default function NexMeetDemo() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [tweaksOpen, setTweaksOpen] = useState(false);
  const [role, setRole] = useState<"attendee" | "organizer">("attendee");
  const [orgScreen, setOrgScreen] = useState<OrgScreen>("home");
  const [createdEvent, setCreatedEvent] = useState<{ name: string; type: string }>({ name: EVENT.name, type: "hackathon" });
  const [screen, setScreen] = useState<AttendeeScreen>("cover");
  const [you, setYou] = useState<YouProfile>(DEMO_YOU);
  const [matches, setMatches] = useState<Match[]>([]);
  const [active, setActive] = useState<Match | null>(null);
  const [share, setShare] = useState(false);
  const [met, setMet] = useState<Record<string, boolean>>({});
  const [locGranted, setLocGranted] = useState(false);
  const [roomCount, setRoomCount] = useState(SEED.length + 1);

  // Apply tweaks to :root CSS variables
  useEffect(() => {
    const r = document.documentElement;
    r.style.setProperty("--accent", t.accent);
    r.style.setProperty("--radius", t.radius + "px");
    const f = FONT_MAP[t.font] || FONT_MAP.Bricolage;
    r.style.setProperty("--font-display", f.display);
    r.style.setProperty("--font-body", f.body);
    r.setAttribute("data-theme", t.dark ? "dark" : "light");
  }, [t]);

  const runMatch = (profile: YouProfile) => setMatches(generateMatches(profile, SEED));

  const submit = (profile: YouProfile) => {
    setYou(profile);
    setScreen("finding");
    runMatch(profile);
  };

  const refresh = () => {
    setRoomCount(c => c + 3);
    runMatch(you);
  };

  const applyTheme = (th?: { accent: string; font: string }) => {
    if (!th) return;
    setTweak({ accent: th.accent, font: th.font });
  };

  const attendeeView = (
    <PhoneShell>
      {screen === "cover" && <CoverScreen onStart={() => setScreen("form")} onOrganizer={() => setRole("organizer")} />}
      {screen === "form" && <FormScreen initial={you} onBack={() => setScreen("cover")} onSubmit={submit} />}
      {screen === "finding" && <FindingScreen you={you} onDone={() => setScreen("matches")} />}
      {(screen === "matches" || screen === "map") && (
        <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
          <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
            {screen === "matches" && (
              <MatchesScreen
                you={you} matches={matches} count={roomCount}
                onOpen={m => { setActive(m); setScreen("detail"); }}
                onMap={() => setScreen("map")}
                onRefresh={refresh}
                onRestart={() => setScreen("cover")}
              />
            )}
            {screen === "map" && (
              <MapScreen
                you={you} matches={matches} granted={locGranted}
                onGrant={() => setLocGranted(true)}
                onSkip={() => setScreen("matches")}
                onOpenMatch={m => { setActive(m); setScreen("detail"); }}
              />
            )}
          </div>
          <BottomNav active={screen} onNav={id => setScreen(id as AttendeeScreen)} />
        </div>
      )}
      {screen === "detail" && active && (
        <>
          <DetailScreen
            you={you} match={active} met={!!met[active.id]}
            onBack={() => setScreen("matches")}
            onShare={() => setShare(true)}
            onMet={() => setMet({ ...met, [active.id]: !met[active.id] })}
          />
          {share && <ShareSheet match={active} you={you} onClose={() => setShare(false)} />}
        </>
      )}
    </PhoneShell>
  );

  return (
    <div className="stage">
      {role === "attendee"
        ? attendeeView
        : orgScreen === "home"
          ? <OrganizerHome
              onCreate={() => setOrgScreen("create")}
              onOpenEvent={e => { setCreatedEvent({ name: e.name, type: "hackathon" }); setOrgScreen("dashboard"); }}
              onExit={() => setRole("attendee")}
            />
          : orgScreen === "create"
            ? <OrganizerCreate
                defaults={{ title: "", about: "", type: "hackathon" }}
                applyTheme={applyTheme}
                onHome={() => setOrgScreen("home")}
                onExit={() => setRole("attendee")}
                onLaunch={d => { setCreatedEvent({ name: d.title || EVENT.name, type: d.type }); setOrgScreen("dashboard"); }}
              />
            : <OrganizerDashboard
                event={createdEvent}
                onExit={() => setRole("attendee")}
                onHome={() => setOrgScreen("home")}
                onNewEvent={() => setOrgScreen("create")}
              />}

      {/* Role + tweaks FAB */}
      <div className="role-fab">
        <button className={role === "attendee" ? "on" : ""} onClick={() => setRole("attendee")}>Attendee</button>
        <button className={role === "organizer" ? "on" : ""} onClick={() => setRole("organizer")}>Organizer</button>
        <button className={tweaksOpen ? "on" : ""} onClick={() => setTweaksOpen(o => !o)}>✦</button>
      </div>

      <TweaksPanel open={tweaksOpen} onClose={() => setTweaksOpen(false)}>
        <TweakSection label="Brand" />
        <TweakColor label="Accent" value={t.accent} options={ACCENTS} onChange={v => setTweak("accent", v)} />
        <TweakSelect label="Type" value={t.font} options={["Bricolage", "Clean", "Serif"]} onChange={v => setTweak("font", v)} />
        <TweakSection label="Shape & mood" />
        <TweakSlider label="Corner radius" value={t.radius} min={8} max={36} unit="px" onChange={v => setTweak("radius", v)} />
        <TweakToggle label="Dark mode" value={t.dark} onChange={v => setTweak("dark", v)} />
      </TweaksPanel>
    </div>
  );
}
