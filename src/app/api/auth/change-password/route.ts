import { NextRequest, NextResponse } from 'next/server';
import { AUTH_MESSAGES } from '@/lib/auth-messages';
import { validateChangePasswordInput } from '@/lib/validations';
import { findUserById, updateUserPassword } from '@/lib/db';
import {
  getSessionFromCookies,
  hashPassword,
  verifyPassword,
} from '@/lib/auth';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromCookies();
    if (!session) {
      return NextResponse.json({ error: AUTH_MESSAGES.sessionExpired }, { status: 401 });
    }

    const body = await request.json();
    const validationError = validateChangePasswordInput(body);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const user = findUserById(session.userId);
    if (!user) {
      return NextResponse.json({ error: AUTH_MESSAGES.sessionExpired }, { status: 401 });
    }

    const currentPassword = String(body.currentPassword);
    const newPassword = String(body.newPassword);

    if (!(await verifyPassword(currentPassword, user.password_hash))) {
      return NextResponse.json(
        { error: AUTH_MESSAGES.currentPasswordIncorrect },
        { status: 401 }
      );
    }

    const password_hash = await hashPassword(newPassword);
    updateUserPassword(user.id, password_hash);

    return NextResponse.json({ message: AUTH_MESSAGES.changePasswordSuccess });
  } catch (error) {
    console.error('Change password error:', error);
    return NextResponse.json(
      { error: AUTH_MESSAGES.changePasswordFailed },
      { status: 500 }
    );
  }
}
