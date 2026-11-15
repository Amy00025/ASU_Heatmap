import { NextRequest, NextResponse } from 'next/server';
import { AUTH_MESSAGES } from '@/lib/auth-messages';
import { validateSignupInput } from '@/lib/validations';
import { createUser, findUserByEmail, toPublicUser } from '@/lib/db';
import {
  createSessionToken,
  hashPassword,
  newUserId,
  setSessionCookie,
} from '@/lib/auth';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validationError = validateSignupInput(body);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const email = String(body.email).trim().toLowerCase();
    const name = String(body.name).trim();
    const role = String(body.role).trim();
    const password = String(body.password);

    if (findUserByEmail(email)) {
      return NextResponse.json({ error: AUTH_MESSAGES.emailExists }, { status: 409 });
    }

    const password_hash = await hashPassword(password);
    const user = createUser({
      id: newUserId(),
      email,
      name,
      role,
      password_hash,
    });

    const token = await createSessionToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    const response = NextResponse.json({
      user: toPublicUser(user),
      message: AUTH_MESSAGES.signupSuccess(user.name),
    });
    setSessionCookie(response, token);
    return response;
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json({ error: AUTH_MESSAGES.signupFailed }, { status: 500 });
  }
}
