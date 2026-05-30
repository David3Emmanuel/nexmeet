'use client';

interface LogoProps {
  size?: number;
  dark?: boolean;
}

export default function Logo({ size = 22, dark = false }: LogoProps) {
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
