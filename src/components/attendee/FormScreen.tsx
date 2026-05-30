'use client';

import { useState } from 'react';
import Icon from '@/components/ui/Icon';

interface FormField {
  id: string;
  label: string;
  name?: string;
  type?: string;
  required?: boolean;
}

interface FormScreenProps {
  initial: any;
  formFields: FormField[];
  onBack: () => void;
  onSubmit: (profile: any) => void;
}

export default function FormScreen({ initial, formFields, onBack, onSubmit }: FormScreenProps) {
  // Use the DB form_fields directly — they already contain name/email/phone + AI questions.
  // Fallback if the event has no form_fields saved yet.
  const allFields: FormField[] = formFields.length > 0
    ? formFields
    : [
        { id: 'name', label: 'Your full name', type: 'text', required: true },
        { id: 'email', label: 'Your email address', type: 'email', required: true },
        { id: 'phone', label: 'Phone number', type: 'text', required: false },
      ];

  const total = allFields.length;
  const [step, setStep] = useState(0);
  const cur = allFields[step];

  const [answers, setAnswers] = useState<Record<string, string>>(() => ({
    name: initial?.name || '',
    email: initial?.email || '',
  }));

  const fieldId = cur.id || cur.name || String(step);
  const val = answers[fieldId] || '';
  const valid = val.trim().length > 0;

  const set = (v: string) => setAnswers(a => ({ ...a, [fieldId]: v }));

  const next = () => {
    if (step < total - 1) {
      setStep(step + 1);
    } else {
      const { name, email, ...rest } = answers;
      onSubmit({ name: name || answers['name'] || '', email: email || answers['email'] || '', answers });
    }
  };

  const back = () => {
    if (step === 0) onBack();
    else setStep(step - 1);
  };

  const isEmail = cur.type === 'email' || cur.id === 'email' || cur.name === 'email';
  const isPhone = cur.type === 'tel' || cur.id === 'phone' || cur.name === 'phone';
  const isLong = cur.type === 'textarea' || (!isEmail && !isPhone && cur.label && cur.label.length > 50);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Sticky header + progress bar */}
      <div style={{
        position: 'sticky', top: 0,
        background: 'color-mix(in srgb, var(--paper) 85%, transparent)',
        backdropFilter: 'blur(12px)',
        padding: '16px 22px',
        borderBottom: '1px solid var(--line)',
        zIndex: 100, flexShrink: 0,
      }}>
        <div className="row gap12" style={{ alignItems: 'center' }}>
          <button className="icon-btn" onClick={back}><Icon name="back" size={20} /></button>
          <div className="progress-track grow">
            <div className="progress-fill" style={{ width: ((step + 1) / total * 100) + '%' }} />
          </div>
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink-3)', minWidth: 34, textAlign: 'right' }}>
            {step + 1}/{total}
          </span>
        </div>
      </div>

      {/* Question */}
      <div className="scroll" style={{ padding: '30px 26px 10px' }} key={step}>
        <div className="screen-enter">
          <div className="eyebrow">Step {step + 1} of {total}</div>
          <h2 className="display" style={{ fontSize: 30, marginTop: 10, lineHeight: 1.1 }}>
            {cur.label}
          </h2>

          {!isLong ? (
            <input
              className="input"
              autoFocus
              type={isEmail ? 'email' : isPhone ? 'tel' : 'text'}
              placeholder={isEmail ? 'you@email.com' : isPhone ? '+1 234 567 8900' : 'Your answer…'}
              value={val}
              onChange={e => set(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && valid && next()}
              style={{ marginTop: 24 }}
            />
          ) : (
            <textarea
              className="textarea"
              autoFocus
              rows={4}
              placeholder="Your answer…"
              value={val}
              onChange={e => set(e.target.value)}
              style={{ marginTop: 24 }}
            />
          )}
        </div>
      </div>

      {/* Next / Submit CTA */}
      <div style={{ padding: '12px 26px 26px', background: 'linear-gradient(transparent, var(--paper) 26%)' }}>
        <button
          className="btn btn-primary btn-full"
          disabled={!valid}
          onClick={next}
          style={{ opacity: valid ? 1 : 0.4, transition: 'opacity .2s' }}
        >
          {step < total - 1
            ? <><span>Continue</span> <Icon name="arrow" size={19} /></>
            : <><span>See my matches</span> <Icon name="spark" size={19} /></>}
        </button>
        {!cur.required && (
          <button
            onClick={next}
            style={{ width: '100%', marginTop: 10, fontSize: 13.5, color: 'var(--ink-3)', fontWeight: 600, textAlign: 'center' }}
          >
            Skip
          </button>
        )}
      </div>
    </div>
  );
}
