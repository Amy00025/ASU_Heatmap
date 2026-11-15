import { NextResponse } from 'next/server';
import { AUTH_MESSAGES } from '@/lib/auth-messages';
import { clearSessionCookie } from '@/lib/auth';

export async function POST() {
  const response = NextResponse.json({ message: AUTH_MESSAGES.loggedOut });
  clearSessionCookie(response);
  return response;
}
