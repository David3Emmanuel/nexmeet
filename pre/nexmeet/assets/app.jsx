/* ===========================================================
   NexMeet — root app: routing, state, tweaks
   =========================================================== */
const { useState: useS, useEffect: useE } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "#FF5A2C",
  "radius": 26,
  "font": "Bricolage",
  "dark": false
}/*EDITMODE-END*/;

const FONT_MAP = {
  "Bricolage": { display: '"Bricolage Grotesque", sans-serif', body: '"Hanken Grotesk", sans-serif' },
  "Clean": { display: '"Space Grotesk", sans-serif', body: '"Hanken Grotesk", sans-serif' },
  "Serif": { display: '"Fraunces", serif', body: '"Hanken Grotesk", sans-serif' },
};
const ACCENTS = ["#FF5A2C", "#2F6BFF", "#1F8A5B", "#7A3E9D", "#E0356B"];

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [role, setRole] = useS("attendee");      // attendee | organizer
  const [orgScreen, setOrgScreen] = useS("home"); // home | create | dashboard
  const [createdEvent, setCreatedEvent] = useS({ name: EVENT.name, type: "hackathon" });
  const [screen, setScreen] = useS("cover");      // cover|form|finding|matches|detail
  const [you, setYou] = useS(DEMO_YOU);
  const [matches, setMatches] = useS([]);
  const [active, setActive] = useS(null);
  const [share, setShare] = useS(false);
  const [met, setMet] = useS({});
  const [locGranted, setLocGranted] = useS(false);
  const [roomCount, setRoomCount] = useS(SEED.length + 1);

  // apply tweaks to :root
  useE(() => {
    const r = document.documentElement;
    r.style.setProperty("--accent", t.accent);
    r.style.setProperty("--radius", t.radius + "px");
    const f = FONT_MAP[t.font] || FONT_MAP.Bricolage;
    r.style.setProperty("--font-display", f.display);
    r.style.setProperty("--font-body", f.body);
    r.setAttribute("data-theme", t.dark ? "dark" : "light");
  }, [t]);

  const runMatch = (profile) => {
    const m = generateMatches(profile, SEED);
    setMatches(m);
  };

  const submit = (profile) => {
    setYou(profile); setScreen("finding");
    runMatch(profile);
  };
  const refresh = () => { setRoomCount(c => c + 3); runMatch(you); };

  const applyTheme = (th) => { if (!th) return; setTweak({ accent: th.accent, font: th.font }); };

  const attendee = (
    <div className="phone-wrap">
      <div className="phone">
        <div className="phone-screen">
          <div className="notch" />
          <StatusBar dark={screen === "cover" ? false : false} />
          <div style={{ flex: 1, position: "relative", overflow: "hidden", display: "flex", flexDirection: "column" }}>
            {screen === "cover" && <CoverScreen onStart={() => setScreen("form")} onOrganizer={() => setRole("organizer")} />}
            {screen === "form" && <FormScreen initial={you} onBack={() => setScreen("cover")} onSubmit={submit} />}
            {screen === "finding" && <FindingScreen you={you} onDone={() => setScreen("matches")} />}
            {(screen === "matches" || screen === "map") && (
              <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
                <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
                  {screen === "matches" && <MatchesScreen you={you} matches={matches} count={roomCount} onOpen={(m) => { setActive(m); setScreen("detail"); }} onMap={() => setScreen("map")} onRefresh={refresh} onRestart={() => setScreen("cover")} />}
                  {screen === "map" && <MapScreen you={you} matches={matches} granted={locGranted} onGrant={() => setLocGranted(true)} onSkip={() => setScreen("matches")} onOpenMatch={(m) => { setActive(m); setScreen("detail"); }} />}
                </div>
                <BottomNav active={screen} onNav={(id) => setScreen(id)} />
              </div>
            )}
            {screen === "detail" && active && (
              <>
                <DetailScreen you={you} match={active} met={!!met[active.id]} onBack={() => setScreen("matches")} onShare={() => setShare(true)} onMet={() => setMet({ ...met, [active.id]: !met[active.id] })} />
                {share && <ShareSheet match={active} you={you} onClose={() => setShare(false)} />}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="stage">
      {role === "attendee"
        ? attendee
        : (orgScreen === "home"
            ? <OrganizerHome
                onCreate={() => setOrgScreen("create")}
                onOpenEvent={(e) => { setCreatedEvent({ name: e.name, type: "hackathon" }); setOrgScreen("dashboard"); }}
                onExit={() => setRole("attendee")}
              />
            : orgScreen === "create"
            ? <OrganizerCreate
                defaults={{ title: "", about: "", type: "hackathon" }}
                applyTheme={applyTheme}
                onHome={() => setOrgScreen("home")}
                onExit={() => setRole("attendee")}
                onLaunch={(d) => { setCreatedEvent({ name: d.title || EVENT.name, type: d.type }); setOrgScreen("dashboard"); }}
              />
            : <OrganizerScreen event={createdEvent} onExit={() => setRole("attendee")} onHome={() => setOrgScreen("home")} onNewEvent={() => setOrgScreen("create")} />)}

      {/* role switcher */}
      <div className="role-fab">
        <button className={role === "attendee" ? "on" : ""} onClick={() => setRole("attendee")}>Attendee</button>
        <button className={role === "organizer" ? "on" : ""} onClick={() => setRole("organizer")}>Organizer</button>
      </div>

      {/* tweaks */}
      <TweaksPanel>
        <TweakSection label="Brand" />
        <TweakColor label="Accent" value={t.accent} options={ACCENTS} onChange={(v) => setTweak("accent", v)} />
        <TweakSelect label="Type" value={t.font} options={["Bricolage", "Clean", "Serif"]} onChange={(v) => setTweak("font", v)} />
        <TweakSection label="Shape & mood" />
        <TweakSlider label="Corner radius" value={t.radius} min={8} max={36} unit="px" onChange={(v) => setTweak("radius", v)} />
        <TweakToggle label="Dark mode" value={t.dark} onChange={(v) => setTweak("dark", v)} />
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
