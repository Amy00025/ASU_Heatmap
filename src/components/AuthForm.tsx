'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Flame, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { PasswordInput } from '@/components/PasswordInput';
import { AUTH_MESSAGES, USER_ROLES } from '@/lib/auth-messages';
import {
  validateLoginInput,
  validateSignupInput,
} from '@/lib/validations';

type Mode = 'login' | 'signup';

interface AuthFormProps {
  initialMode?: Mode;
  redirectTo?: string;
}

export function AuthForm({ initialMode = 'login', redirectTo = '/home' }: AuthFormProps) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>(initialMode);
  const [submitting, setSubmitting] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const switchMode = (next: Mode) => {
    setMode(next);
    setPassword('');
    setConfirmPassword('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === 'signup') {
      const error = validateSignupInput({
        name,
        email,
        role,
        password,
        confirmPassword,
      });
      if (error) {
        toast.error(error);
        return;
      }
    } else {
      const error = validateLoginInput({ email, password });
      if (error) {
        toast.error(error);
        return;
      }
    }

    setSubmitting(true);
    try {
      const endpoint = mode === 'signup' ? '/api/auth/signup' : '/api/auth/login';
      const body =
        mode === 'signup'
          ? { name, email, role, password, confirmPassword }
          : { email, password };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        toast.error(
          data.error ||
            (mode === 'signup' ? AUTH_MESSAGES.signupFailed : AUTH_MESSAGES.loginFailed)
        );
        return;
      }

      toast.success(
        data.message ||
          (mode === 'signup'
            ? AUTH_MESSAGES.signupSuccess(name)
            : AUTH_MESSAGES.loginSuccess(name || 'Sun Devil'))
      );
      router.push(redirectTo);
      router.refresh();
    } catch {
      toast.error(mode === 'signup' ? AUTH_MESSAGES.signupFailed : AUTH_MESSAGES.loginFailed);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="mb-6 flex items-center gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-[13px] border border-asu-gold/40 bg-white/10 text-asu-gold shadow-[0_0_28px_rgba(255,198,39,0.12)]">
          <Flame size={22} />
        </div>
        <div>
          <p className="text-[11px] font-bold tracking-[0.18em] text-asu-gold">SUN DEVIL</p>
          <p className="text-sm font-semibold text-white/90">Campus Pulse Access</p>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-1 rounded-full border border-white/15 bg-black/20 p-1">
        <button
          type="button"
          onClick={() => switchMode('login')}
          className={`rounded-full px-4 py-2 text-xs font-bold tracking-wide transition ${
            mode === 'login'
              ? 'bg-asu-maroon text-white shadow-sm'
              : 'text-white/60 hover:text-white'
          }`}
        >
          Log in
        </button>
        <button
          type="button"
          onClick={() => switchMode('signup')}
          className={`rounded-full px-4 py-2 text-xs font-bold tracking-wide transition ${
            mode === 'signup'
              ? 'bg-asu-maroon text-white shadow-sm'
              : 'text-white/60 hover:text-white'
          }`}
        >
          Sign up
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {mode === 'signup' && (
          <>
            <label className="block space-y-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-white/70">
                Full name
              </span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Sparky Sun Devil"
                autoComplete="name"
                className="w-full rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/40 outline-none transition focus:border-asu-gold/60 focus:bg-white/15"
              />
            </label>

            <label className="block space-y-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-white/70">
                Role
              </span>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full rounded-xl border border-white/15 bg-[#4b1027] px-4 py-3 text-sm text-white outline-none transition focus:border-asu-gold/60"
              >
                <option value="" disabled>
                  Select your role
                </option>
                {USER_ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </label>
          </>
        )}

        <label className="block space-y-1.5">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-white/70">
            ASU email
          </span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@asu.edu"
            autoComplete="email"
            className="w-full rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/40 outline-none transition focus:border-asu-gold/60 focus:bg-white/15"
          />
        </label>

        <label className="block space-y-1.5">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-white/70">
            Password
          </span>
          <PasswordInput
            id="auth-password"
            name="password"
            value={password}
            onChange={setPassword}
            autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
          />
          {mode === 'signup' && (
            <span className="text-[11px] text-white/45">At least 6 characters</span>
          )}
        </label>

        {mode === 'signup' && (
          <label className="block space-y-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-white/70">
              Confirm password
            </span>
            <PasswordInput
              id="auth-confirm-password"
              name="confirmPassword"
              value={confirmPassword}
              onChange={setConfirmPassword}
              autoComplete="new-password"
            />
          </label>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-asu-gold px-5 py-3.5 text-sm font-extrabold text-[#4b1027] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {mode === 'signup' ? 'Create account' : 'Log in'}
        </button>
      </form>

      <p className="mt-5 text-center text-[11px] text-white/50">
        {mode === 'signup' ? 'Already have an account?' : 'New to Campus Pulse?'}{' '}
        <button
          type="button"
          onClick={() => switchMode(mode === 'signup' ? 'login' : 'signup')}
          className="font-semibold text-asu-gold hover:underline"
        >
          {mode === 'signup' ? 'Log in' : 'Sign up'}
        </button>
      </p>
    </div>
  );
}
