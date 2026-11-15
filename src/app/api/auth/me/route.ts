import { NextResponse } from 'next/server';
import { AUTH_MESSAGES } from '@/lib/auth-messages';
import { getSessionFromCookies } from '@/lib/auth';
import { findUserById, toPublicUser } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getSessionFromCookies();
    if (!session) {
      return NextResponse.json({ error: AUTH_MESSAGES.loginRequired }, { status: 401 });
    }

    const user = findUserById(session.userId);
    if (!user) {
      return NextResponse.json({ error: AUTH_MESSAGES.sessionExpired }, { status: 401 });
    }

    return NextResponse.json({ user: toPublicUser(user) });
  } catch (error) {
    console.error('Me error:', error);
    return NextResponse.json({ error: AUTH_MESSAGES.loginRequired }, { status: 500 });
  }
}
