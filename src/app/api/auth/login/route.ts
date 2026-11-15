import { NextRequest, NextResponse } from 'next/server';
import { AUTH_MESSAGES } from '@/lib/auth-messages';
import { validateLoginInput } from '@/lib/validations';
import { findUserByEmail, toPublicUser } from '@/lib/db';
import {
  createSessionToken,
  setSessionCookie,
  verifyPassword,
} from '@/lib/auth';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validationError = validateLoginInput(body);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const email = String(body.email).trim().toLowerCase();
    const password = String(body.password);
    const user = findUserByEmail(email);

    if (!user || !(await verifyPassword(password, user.password_hash))) {
      return NextResponse.json(
        { error: AUTH_MESSAGES.invalidCredentials },
        { status: 401 }
      );
    }

    const token = await createSessionToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    const response = NextResponse.json({
      user: toPublicUser(user),
      message: AUTH_MESSAGES.loginSuccess(user.name),
    });
    setSessionCookie(response, token);
    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: AUTH_MESSAGES.loginFailed }, { status: 500 });
  }
}
