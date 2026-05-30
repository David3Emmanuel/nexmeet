/* ===========================================================
   NexMeet — shared components & icons
   =========================================================== */
const { useState, useEffect, useRef } = React;

/* ---- icon set (stroke, inherit color) ---- */
function Icon({ name, size = 22, stroke = 2 }) {
  const p = {
    arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
    back: <path d="M19 12H5M11 6l-6 6 6 6" />,
    check: <path d="M5 13l4 4L19 7" />,
    close: <path d="M6 6l12 12M18 6L6 18" />,
    share: <><path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4" /><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /></>,
    refresh: <path d="M20 11a8 8 0 10-2.3 6M20 5v6h-6" />,
    spark: <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3z" />,
    user: <><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" /></>,
    users: <><circle cx="9" cy="8" r="3.4" /><path d="M2.5 20c0-3.4 2.9-6 6.5-6s6.5 2.6 6.5 6" /><path d="M16 5.2A3.4 3.4 0 0119 11M21.5 20c0-2.6-1.4-4.7-3.6-5.6" /></>,
    qr: <><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><path d="M14 14h3v3M20 14v.01M14 20v.01M20 20v.01M17 17v.01M20 17h.01M17 20h.01" /></>,
    location: <><path d="M12 21s7-6.3 7-11a7 7 0 10-14 0c0 4.7 7 11 7 11z" /><circle cx="12" cy="10" r="2.5" /></>,
    bolt: <path d="M13 2L4 14h6l-1 8 9-12h-6l1-8z" />,
    chat: <path d="M21 12a8 8 0 01-11.5 7.2L4 21l1.8-5.5A8 8 0 1121 12z" />,
    grid: <><rect x="3" y="3" width="8" height="8" rx="1.5" /><rect x="13" y="3" width="8" height="8" rx="1.5" /><rect x="3" y="13" width="8" height="8" rx="1.5" /><rect x="13" y="13" width="8" height="8" rx="1.5" /></>,
    pin: <path d="M9 11l3 3 9-9M21 12v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2h7" />,
    heart: <path d="M12 20s-7-4.5-9.2-9C1.3 8 3 5 6 5c2 0 3.2 1.3 4 2.5C10.8 6.3 12 5 14 5c3 0 4.7 3 3.2 6-2.2 4.5-9.2 9-9.2 9z" />,
    eye: <><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" /><circle cx="12" cy="12" r="3" /></>,
    sliders: <><path d="M4 8h10M18 8h2M4 16h2M10 16h10" /><circle cx="16" cy="8" r="2.2" /><circle cx="8" cy="16" r="2.2" /></>,
    copy: <><rect x="9" y="9" width="11" height="11" rx="2" /><path d="M5 15V5a2 2 0 012-2h8" /></>,
    download: <path d="M12 3v12M7 10l5 5 5-5M5 21h14" />,
  }[name];
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">{p}</svg>
  );
}

/* ---- logo: "the room mapped" mark ---- */
function Logo({ size = 22, dark = false }) {
  const c = dark ? "var(--paper)" : "var(--ink)";
  return (
    <div className="row gap8" style={{ alignItems: "center" }}>
      <svg width={size} height={size} viewBox="0 0 28 28" fill="none">
        <circle cx="6" cy="8" r="3" fill="var(--accent)" />
        <circle cx="22" cy="7" r="2.4" fill={c} />
        <circle cx="20" cy="21" r="3.2" fill={c} />
        <circle cx="8" cy="20" r="2.2" fill="var(--accent)" />
        <path d="M6 8L20 21M22 7L8 20M6 8L22 7" stroke={c} strokeWidth="1.4" opacity="0.5" />
      </svg>
      <span className="display" style={{ fontSize: size * 0.92, color: c, letterSpacing: "-0.03em" }}>NexMeet</span>
    </div>
  );
}

function Avatar({ name, color, size = 46, square = false, src }) {
  return (
    <div className={"avatar" + (square ? " sq" : "")} style={{ width: size, height: size, background: color || "var(--ink)", fontSize: size * 0.36 }}>
      {src ? <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : initials(name)}
    </div>
  );
}

function StatusBar({ dark = false }) {
  const [t, setT] = useState("");
  useEffect(() => {
    const f = () => setT(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }).replace(/^0/, ""));
    f(); const id = setInterval(f, 10000); return () => clearInterval(id);
  }, []);
  const c = dark ? "var(--paper)" : "var(--ink)";
  return (
    <div className="statusbar" style={{ color: c }}>
      <span>{t}</span>
      <span className="dots"><span /><span /><span style={{ opacity: 1 }} /><span style={{ width: 18, height: 10, borderRadius: 3, background: "transparent", border: "1.5px solid " + c, opacity: .65 }} /></span>
    </div>
  );
}

/* match-strength meter */
function Strength({ value = 4, light = false }) {
  return (
    <div className="match-strength" title={value + "/5 match"}>
      {[1, 2, 3, 4, 5].map(i => <i key={i} className={i <= value ? "on" : ""} style={light ? {} : { background: i <= value ? "var(--accent)" : "var(--card-edge)" }} />)}
    </div>
  );
}

/* a faux QR built from a deterministic grid (no external lib) */
function QrCode({ seed = "NEXMEET", size = 140, color = "var(--ink)" }) {
  const n = 21;
  const cells = [];
  let h = 0; for (let i = 0; i < seed.length; i++) h = (h * 33 + seed.charCodeAt(i)) >>> 0;
  const rand = () => { h = (h * 1103515245 + 12345) & 0x7fffffff; return h / 0x7fffffff; };
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
    const finder = (x < 7 && y < 7) || (x >= n - 7 && y < 7) || (x < 7 && y >= n - 7);
    if (finder) continue;
    if (rand() > 0.52) cells.push([x, y]);
  }
  const cs = size / n;
  const Finder = ({ x, y }) => (
    <g>
      <rect x={x * cs} y={y * cs} width={cs * 7} height={cs * 7} rx={cs * 1.4} fill={color} />
      <rect x={(x + 1) * cs} y={(y + 1) * cs} width={cs * 5} height={cs * 5} rx={cs} fill="var(--card)" />
      <rect x={(x + 2) * cs} y={(y + 2) * cs} width={cs * 3} height={cs * 3} rx={cs * .7} fill={color} />
    </g>
  );
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: "block" }}>
      {cells.map(([x, y], i) => <rect key={i} x={x * cs + cs * .12} y={y * cs + cs * .12} width={cs * .76} height={cs * .76} rx={cs * .25} fill={color} />)}
      <Finder x={0} y={0} /><Finder x={n - 7} y={0} /><Finder x={0} y={n - 7} />
    </svg>
  );
}

Object.assign(window, { Icon, Logo, Avatar, StatusBar, Strength, QrCode });
