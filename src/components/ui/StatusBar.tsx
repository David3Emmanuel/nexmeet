'use client';

import { useState, useEffect } from 'react';

interface StatusBarProps {
  dark?: boolean;
}

export default function StatusBar({ dark = false }: StatusBarProps) {
  const [t, setT] = useState("");

  useEffect(() => {
    const f = () => setT(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }).replace(/^0/, ""));
    f();
    const id = setInterval(f, 10000);
    return () => clearInterval(id);
  }, []);

  const c = dark ? "var(--paper)" : "var(--ink)";
  return (
    <div className="statusbar" style={{ color: c }}>
      <span>{t}</span>
      <span className="dots">
        <span /><span /><span style={{ opacity: 1 }} />
        <span style={{ width: 18, height: 10, borderRadius: 3, background: "transparent", border: "1.5px solid " + c, opacity: .65 }} />
      </span>
    </div>
  );
}
