'use client';

import { useState, useEffect } from 'react';
import Icon from '@/components/ui/Icon';
import Avatar from '@/components/ui/Avatar';
import { getSession, NexSession } from '@/lib/auth-client';

export default function SettingsPage() {
  const [session, setSession] = useState<NexSession | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [orgName, setOrgName] = useState('My Organization');
  const [defaultAccent, setDefaultAccent] = useState('#FF5A2C');
  const [notifMatches, setNotifMatches] = useState(true);
  const [notifRegistrations, setNotifRegistrations] = useState(true);
  const [slackWebhook, setSlackWebhook] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getSession().then(s => {
      if (s) {
        setSession(s);
        setEmail(s.email);
        setName(s.name || s.email.split('@')[0]);
      }
    });
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const ACCENTS = [
    { name: 'Coral', color: 'var(--coral)' },
    { name: 'Plum', color: 'var(--plum)' },
    { name: 'Forest', color: 'var(--forest)' },
    { name: 'Spark', color: 'var(--spark)' },
    { name: 'Sky', color: 'var(--sky)' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div className="org-header-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div className="eyebrow" style={{ marginBottom: 8 }}>Configuration · Preferences</div>
          <h1 className="display" style={{ fontSize: 32 }}>Settings</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {saved && (
            <span style={{ color: 'var(--forest)', fontSize: 13.5, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
              <Icon name="check" size={15} stroke={3} /> Saved
            </span>
          )}
          <button type="submit" form="settings-form" className="btn btn-primary btn-save" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, height: 42, padding: '0 16px', minHeight: 'auto' }}>
            <Icon name="check" size={16} stroke={3} />
            <span className="btn-save-text">Save Changes</span>
          </button>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="org-content-container">
        <form id="settings-form" onSubmit={handleSave} style={{ width: '100%' }}>
          <div className="settings-grid">
          
          {/* Profile Section */}
          <div className="panel" style={{ padding: 28 }}>
            <h3 className="display" style={{ fontSize: 20, marginBottom: 6 }}>Profile Details</h3>
            <p className="lead" style={{ fontSize: 13, marginBottom: 20 }}>Manage your personal details and organizer profile.</p>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 24 }}>
              <Avatar name={name || 'O'} color="var(--accent)" size={64} style={{ fontSize: 24, fontWeight: 700 }} />
              <div>
                <button type="button" className="btn btn-ghost btn-sm" style={{ marginBottom: 6 }}>
                  Change Avatar
                </button>
                <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>JPG, PNG or GIF. Max size 2MB.</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <label className="field">
                <span className="field-label">Display Name</span>
                <input 
                  className="input" 
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                  placeholder="e.g. Kenzy Codex" 
                />
              </label>

              <label className="field">
                <span className="field-label">Email Address</span>
                <input 
                  className="input" 
                  type="email" 
                  value={email} 
                  disabled 
                  style={{ opacity: 0.6, cursor: 'not-allowed' }} 
                />
              </label>
            </div>
          </div>

          {/* Right Column: Branding & Notifications */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Branding Section */}
          <div className="panel" style={{ padding: 28 }}>
            <h3 className="display" style={{ fontSize: 20, marginBottom: 6 }}>Branding & Styling</h3>
            <p className="lead" style={{ fontSize: 13, marginBottom: 20 }}>Configure default colors and branding for your events.</p>

            <div style={{ marginBottom: 20 }}>
              <span className="field-label" style={{ marginBottom: 10, display: 'block' }}>Default Accent Color</span>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                {ACCENTS.map(acc => {
                  const active = defaultAccent === acc.color || (defaultAccent.startsWith('var(') && defaultAccent === acc.color);
                  return (
                    <button
                      key={acc.name}
                      type="button"
                      onClick={() => setDefaultAccent(acc.color)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '10px 16px',
                        borderRadius: 999,
                        border: `1.5px solid ${active ? 'var(--ink)' : 'var(--card-edge)'}`,
                        background: active ? 'var(--paper-2)' : 'transparent',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <span style={{ width: 14, height: 14, borderRadius: '50%', background: acc.color }} />
                      <span style={{ fontSize: 13.5, fontWeight: 700 }}>{acc.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <label className="field">
              <span className="field-label">Organization Name</span>
              <input 
                className="input" 
                value={orgName} 
                onChange={e => setOrgName(e.target.value)} 
                placeholder="e.g. Lagos Tech Club" 
              />
            </label>
          </div>

          {/* Notifications Section - Commented out for now
          <div className="panel" style={{ padding: 28 }}>
            <h3 className="display" style={{ fontSize: 20, marginBottom: 6 }}>Notification & Webhooks</h3>
            <p className="lead" style={{ fontSize: 13, marginBottom: 20 }}>Get updates about attendee matches and sign-ups.</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 18, marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14.5 }}>New registration notifications</div>
                  <div style={{ fontSize: 12.5, color: 'var(--ink-3)' }}>Send email digests daily with attendee summaries.</div>
                </div>
                <button
                  type="button"
                  onClick={() => setNotifRegistrations(!notifRegistrations)}
                  style={{
                    width: 48,
                    height: 26,
                    borderRadius: 999,
                    background: notifRegistrations ? 'var(--accent)' : 'var(--paper-2)',
                    position: 'relative',
                    transition: 'background-color 0.2s',
                  }}
                >
                  <span style={{
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    background: '#fff',
                    position: 'absolute',
                    top: 3,
                    left: notifRegistrations ? 25 : 3,
                    transition: 'left 0.2s',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  }} />
                </button>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14.5 }}>Match generation status alerts</div>
                  <div style={{ fontSize: 12.5, color: 'var(--ink-3)' }}>Receive instant notifications when matches generate.</div>
                </div>
                <button
                  type="button"
                  onClick={() => setNotifMatches(!notifMatches)}
                  style={{
                    width: 48,
                    height: 26,
                    borderRadius: 999,
                    background: notifMatches ? 'var(--accent)' : 'var(--paper-2)',
                    position: 'relative',
                    transition: 'background-color 0.2s',
                  }}
                >
                  <span style={{
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    background: '#fff',
                    position: 'absolute',
                    top: 3,
                    left: notifMatches ? 25 : 3,
                    transition: 'left 0.2s',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  }} />
                </button>
              </div>
            </div>

            <label className="field">
              <span className="field-label">Slack Webhook URL (Optional)</span>
              <span className="field-hint">Post live check-in summaries straight to your Slack channel.</span>
              <input 
                className="input" 
                value={slackWebhook} 
                onChange={e => setSlackWebhook(e.target.value)} 
                placeholder="https://hooks.slack.com/services/..." 
              />
            </label>
          </div>
          */}
          
          </div>
          </div>

        </form>
      </div>
    </div>
  );
}
