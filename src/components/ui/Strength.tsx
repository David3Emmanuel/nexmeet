'use client';

interface StrengthProps {
  value?: number;
  light?: boolean;
}

export default function Strength({ value = 4, light = false }: StrengthProps) {
  return (
    <div className="match-strength" title={value + "/5 match"}>
      {[1, 2, 3, 4, 5].map(i => (
        <i key={i} className={i <= value ? "on" : ""} style={light ? {} : { background: i <= value ? "var(--accent)" : "var(--card-edge)" }} />
      ))}
    </div>
  );
}
