'use client';

import { useEffect, useRef, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface PasswordInputProps {
  id: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  autoComplete?: string;
  className?: string;
  required?: boolean;
  /** `welcome` matches the maroon landing/auth theme; `panel` matches light/dark dashboard forms. */
  variant?: 'welcome' | 'panel';
}

/** Password field with eye toggle that reveals plaintext for 3 seconds. */
export function PasswordInput({
  id,
  name,
  value,
  onChange,
  placeholder = '••••••••',
  autoComplete = 'current-password',
  className = '',
  required,
  variant = 'welcome',
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, []);

  const revealForThreeSeconds = () => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    setVisible(true);
    hideTimer.current = setTimeout(() => setVisible(false), 3000);
  };

  const hide = () => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    setVisible(false);
  };

  const inputClass =
    variant === 'welcome'
      ? 'w-full rounded-xl border border-white/15 bg-white/10 px-4 py-3 pr-12 text-sm text-white placeholder:text-white/40 outline-none transition focus:border-asu-gold/60 focus:bg-white/15'
      : 'w-full rounded-xl border border-slate-200 bg-white px-4 py-3 pr-12 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-asu-maroon/40 focus:ring-2 focus:ring-asu-maroon/10 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500';

  const buttonClass =
    variant === 'welcome'
      ? 'absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-white/60 transition hover:bg-white/10 hover:text-asu-gold'
      : 'absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-asu-maroon dark:hover:bg-slate-700 dark:hover:text-asu-gold';

  return (
    <div className={`relative ${className}`}>
      <input
        id={id}
        name={name}
        type={visible ? 'text' : 'password'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required={required}
        className={inputClass}
      />
      <button
        type="button"
        onClick={() => (visible ? hide() : revealForThreeSeconds())}
        className={buttonClass}
        aria-label={visible ? 'Hide password' : 'Show password for 3 seconds'}
        title={visible ? 'Hide password' : 'Show password for 3 seconds'}
      >
        {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}
