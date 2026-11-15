'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronDown, LogOut, User } from 'lucide-react';
import { toast } from 'sonner';
import { AUTH_MESSAGES } from '@/lib/auth-messages';

interface PublicUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

export function UserMenu() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<PublicUser | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled) setUser(data.user);
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const handleLogout = async () => {
    setOpen(false);
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST' });
      const data = await res.json().catch(() => ({}));
      toast.success(data.message || AUTH_MESSAGES.loggedOut);
      router.push('/login');
      router.refresh();
    } catch {
      toast.error(AUTH_MESSAGES.loginFailed);
    }
  };

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((p) => p[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : '?';

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center space-x-1.5 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs transition-all hover:border-slate-300 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
        aria-expanded={open}
        aria-haspopup="menu"
        title="User profile"
      >
        <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-asu-maroon text-[10px] font-bold text-asu-gold">
          {initials}
        </span>
        <span className="hidden max-w-[100px] truncate sm:inline">
          {user?.name || 'Profile'}
        </span>
        <ChevronDown className={`h-3.5 w-3.5 transition ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-[60] mt-2 w-56 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg dark:border-slate-600 dark:bg-slate-800"
        >
          <div className="border-b border-slate-100 px-3 py-2 dark:border-slate-700">
            <p className="truncate text-xs font-bold text-slate-900 dark:text-slate-100">
              {user?.name || 'Account'}
            </p>
            <p className="truncate text-[11px] text-slate-500 dark:text-slate-400">
              {user?.email || ''}
            </p>
          </div>
          <Link
            href="/profile"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex items-center space-x-2 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            <User className="h-3.5 w-3.5 text-asu-maroon" />
            <span>View details</span>
          </Link>
          <button
            type="button"
            role="menuitem"
            onClick={handleLogout}
            className="flex w-full items-center space-x-2 px-3 py-2 text-left text-xs font-semibold text-slate-700 transition hover:bg-rose-50 hover:text-asu-maroon dark:text-slate-200 dark:hover:bg-slate-700"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Log out</span>
          </button>
        </div>
      )}
    </div>
  );
}
