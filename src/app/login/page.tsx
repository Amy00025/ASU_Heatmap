'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { ArrowLeft, Flame } from 'lucide-react';
import { AuthForm } from '@/components/AuthForm';

function LoginContent() {
  const searchParams = useSearchParams();
  const next = searchParams.get('next') || '/home';
  const mode = searchParams.get('mode') === 'signup' ? 'signup' : 'login';

  return (
    <main className="welcome-screen" aria-label="ASU Campus Pulse login">
      <div className="welcome-orbit welcome-orbit-one" />
      <div className="welcome-orbit welcome-orbit-two" />

      <header className="welcome-header">
        <Link href="/" className="welcome-brand">
          <div className="welcome-brand-mark">
            <Flame aria-hidden="true" size={22} />
          </div>
          <div>
            <span className="welcome-brand-name">SUN DEVIL</span>
            <span className="welcome-brand-subtitle">CAMPUS PULSE</span>
          </div>
        </Link>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-[11px] font-semibold tracking-wide text-white/80 transition hover:bg-white/10"
        >
          <ArrowLeft size={14} />
          Back to landing
        </Link>
      </header>

      <section className="relative z-[1] flex flex-1 items-center justify-center py-10">
        <div className="w-full max-w-md rounded-3xl border border-white/10 bg-black/25 p-6 shadow-2xl backdrop-blur-md sm:p-8">
          <AuthForm initialMode={mode} redirectTo={next.startsWith('/') ? next : '/home'} />
        </div>
      </section>

      <footer className="welcome-footer">
        <span>ASU SUN DEVIL CROWD TRACKER</span>
        <span className="welcome-footer-center">ASU EMAIL REQUIRED · LOCAL AUTH</span>
        <Link href="/login?mode=signup" className="welcome-skip-button">
          Create account
        </Link>
      </footer>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="welcome-screen flex items-center justify-center">
          <p className="text-sm text-white/70">Loading…</p>
        </main>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
