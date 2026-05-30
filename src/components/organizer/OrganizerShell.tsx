'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Logo from '@/components/ui/Logo';
import Icon from '@/components/ui/Icon';
import Avatar from '@/components/ui/Avatar';
import { clearSession, getSession, NexSession } from '@/lib/auth-client';

interface NavItem {
  id: string;
  label: string;
  icon: string;
  href: string;
}

const NAV: NavItem[] = [
  { id: 'events', label: 'Events', icon: 'bolt', href: '/organizer' },
  // { id: 'analytics', label: 'Analytics', icon: 'spark', href: '/organizer/analytics' },
  { id: 'settings', label: 'Settings', icon: 'sliders', href: '/organizer/settings' },
];

export default function OrganizerShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  // Read session only after mount to avoid SSR/client hydration mismatch
  const [session, setSession] = useState<NexSession | null>(null);

  useEffect(() => {
    getSession().then(s => setSession(s));
  }, []);

  const email = session?.email ?? '';
  const name = session?.name ?? (email ? email.split('@')[0] : '—');

  const handleLogout = async () => {
    await clearSession();
    window.location.href = '/';
  };

  return (
    <div className="org-container">
      {/* ── Mobile Top Header ── */}
      <header className="org-mobile-header">
        <Logo size={18} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Avatar name={name} color="var(--accent)" size={30} />
            <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--ink-2)' }}>{name}</span>
          </div>
          <button
            onClick={handleLogout}
            title="Logout"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 30, height: 30, borderRadius: '50%',
              background: 'var(--paper-2)', color: 'var(--ink-2)',
            }}
          >
            <Icon name="close" size={14} />
          </button>
        </div>
      </header>

      {/* ── Desktop Sidebar ── */}
      <aside className="org-sidebar">
        {/* Logo */}
        <div style={{ padding: '0 22px', marginBottom: 32 }}>
          <Logo size={20} />
        </div>

        {/* Nav items */}
        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2, padding: '0 10px' }}>
          {NAV.map(item => {
            const active = pathname === item.href || (item.href !== '/organizer' && pathname.startsWith(item.href));
            return (
              <button
                key={item.id}
                id={`nav-${item.id}`}
                onClick={() => router.push(item.href)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '11px 14px',
                  borderRadius: 12,
                  fontWeight: 700,
                  fontSize: 14.5,
                  color: active ? 'var(--accent)' : 'var(--ink-2)',
                  background: active ? 'color-mix(in srgb, var(--accent) 9%, var(--paper))' : 'transparent',
                  transition: 'all .15s',
                  textAlign: 'left',
                  position: 'relative',
                }}
              >
                {active && (
                  <span style={{
                    position: 'absolute',
                    left: 0, top: '50%',
                    transform: 'translateY(-50%)',
                    width: 3, height: 22,
                    background: 'var(--accent)',
                    borderRadius: '0 3px 3px 0',
                  }} />
                )}
                <Icon name={item.icon} size={18} />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Bottom: profile + logout */}
        <div style={{ padding: '0 10px', borderTop: '1px solid var(--line)', marginTop: 16, paddingTop: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 12 }}>
            <Avatar name={name} color="var(--accent)" size={34} />
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 13.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</div>
              <div style={{ fontSize: 11.5, color: 'var(--ink-3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{email}</div>
            </div>
          </div>
          <button
            id="nav-logout"
            onClick={handleLogout}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 14px', borderRadius: 12,
              fontWeight: 700, fontSize: 14, color: 'var(--ink-3)',
              width: '100%', marginTop: 2,
              transition: 'color .15s',
            }}
          >
            <Icon name="close" size={16} /> Logout
          </button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {children}
      </main>

      {/* ── Mobile Bottom Navigation ── */}
      <nav className="org-mobile-bottom-nav">
        {NAV.map(item => {
          const active = pathname === item.href || (item.href !== '/organizer' && pathname.startsWith(item.href));
          return (
            <button
              key={item.id}
              onClick={() => router.push(item.href)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 4,
                height: '100%',
                padding: '0 16px',
                color: active ? 'var(--accent)' : 'var(--ink-3)',
                transition: 'color .15s',
              }}
            >
              <Icon name={item.icon} size={20} />
              <span style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.05em' }}>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
