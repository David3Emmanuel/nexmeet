'use client';

import Icon from '@/components/ui/Icon';

interface BottomNavProps {
  active: string;
  onNav: (id: string) => void;
}

const TABS = [
  { id: "matches", label: "Matches", icon: "spark" },
  { id: "map", label: "Live map", icon: "location" },
];

export default function BottomNav({ active, onNav }: BottomNavProps) {
  return (
    <div style={{ flex: "0 0 auto", display: "flex", borderTop: "1px solid var(--line)", background: "var(--paper)", padding: "8px 16px 10px" }}>
      {TABS.map(t => {
        const on = active === t.id;
        return (
          <button key={t.id} onClick={() => onNav(t.id)} className="grow col center gap6" style={{ padding: "6px 0", color: on ? "var(--accent)" : "var(--ink-3)" }}>
            <Icon name={t.icon} size={22} stroke={on ? 2.4 : 2} />
            <span style={{ fontSize: 11.5, fontWeight: on ? 800 : 600 }}>{t.label}</span>
          </button>
        );
      })}
    </div>
  );
}
