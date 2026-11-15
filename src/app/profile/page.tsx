'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Flame, Loader2, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { PasswordInput } from '@/components/PasswordInput';
import { ThemeToggle } from '@/components/ThemeToggle';
import { UserMenu } from '@/components/UserMenu';
import { AUTH_MESSAGES } from '@/lib/auth-messages';
import { validateChangePasswordInput } from '@/lib/validations';

interface PublicUser {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt?: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<PublicUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (res.status === 401) {
          toast.error(AUTH_MESSAGES.loginRequired);
          router.push('/login?next=/profile');
          return;
        }
        const data = await res.json();
        if (!cancelled) setUser(data.user);
      } catch {
        toast.error(AUTH_MESSAGES.loginRequired);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const error = validateChangePasswordInput({
      currentPassword,
      newPassword,
      confirmPassword,
    });
    if (error) {
      toast.error(error);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        toast.error(data.error || AUTH_MESSAGES.changePasswordFailed);
        if (res.status === 401 && data.error === AUTH_MESSAGES.sessionExpired) {
          router.push('/login?next=/profile');
        }
        return;
      }

      toast.success(data.message || AUTH_MESSAGES.changePasswordSuccess);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch {
      toast.error(AUTH_MESSAGES.changePasswordFailed);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/70 font-sans text-slate-900 minimal-grid dark:bg-slate-950 dark:text-slate-100">
      <div className="h-1 w-full bg-gradient-to-r from-asu-maroon via-asu-gold to-asu-maroon" />

      <header className="sticky top-0 z-[500] border-b border-slate-200/90 bg-white/95 shadow-sm backdrop-blur-md dark:border-slate-700 dark:bg-slate-900/95">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6">
          <div className="flex items-center gap-3">
            <Link
              href="/home"
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Home
            </Link>
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-asu-maroon">
                <Flame className="h-4 w-4 text-asu-gold" />
              </div>
              <h1 className="text-sm font-bold text-slate-900 dark:text-white">User profile</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <UserMenu />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-6 px-4 py-8 sm:px-6">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-slate-500">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : (
          <>
            <section className="rounded-2xl border border-slate-300/90 bg-white p-6 shadow-sm dark:border-slate-600 dark:bg-slate-900">
              <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Account details
              </h2>
              <dl className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-700 dark:bg-slate-800/60">
                  <dt className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    Name
                  </dt>
                  <dd className="mt-1 text-sm font-bold text-slate-900 dark:text-white">
                    {user?.name}
                  </dd>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-700 dark:bg-slate-800/60">
                  <dt className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    Role
                  </dt>
                  <dd className="mt-1 text-sm font-bold text-slate-900 dark:text-white">
                    {user?.role}
                  </dd>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4 sm:col-span-2 dark:border-slate-700 dark:bg-slate-800/60">
                  <dt className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    Email
                  </dt>
                  <dd className="mt-1 break-all text-sm font-bold text-slate-900 dark:text-white">
                    {user?.email}
                  </dd>
                </div>
              </dl>
            </section>

            <section className="rounded-2xl border border-slate-300/90 bg-white p-6 shadow-sm dark:border-slate-600 dark:bg-slate-900">
              <div className="mb-4 flex items-center gap-2">
                <Shield className="h-4 w-4 text-asu-maroon" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Change password
                </h2>
              </div>

              <form onSubmit={handleChangePassword} className="space-y-4" noValidate>
                <label className="block space-y-1.5">
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                    Current password
                  </span>
                  <PasswordInput
                    id="current-password"
                    name="currentPassword"
                    value={currentPassword}
                    onChange={setCurrentPassword}
                    variant="panel"
                    autoComplete="current-password"
                  />
                </label>
                <label className="block space-y-1.5">
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                    New password
                  </span>
                  <PasswordInput
                    id="new-password"
                    name="newPassword"
                    value={newPassword}
                    onChange={setNewPassword}
                    variant="panel"
                    autoComplete="new-password"
                  />
                  <span className="text-[11px] text-slate-400">At least 6 characters</span>
                </label>
                <label className="block space-y-1.5">
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                    Confirm new password
                  </span>
                  <PasswordInput
                    id="confirm-new-password"
                    name="confirmPassword"
                    value={confirmPassword}
                    onChange={setConfirmPassword}
                    variant="panel"
                    autoComplete="new-password"
                  />
                </label>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-asu-maroon px-5 py-2.5 text-sm font-bold text-white transition hover:bg-asu-maroon-dark disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  Update password
                </button>
              </form>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
