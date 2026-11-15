import { SignJWT, jwtVerify } from 'jose';

export const SESSION_COOKIE = 'asu_session';
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export interface SessionPayload {
  userId: string;
  email: string;
  name: string;
  role: string;
}

function getSecretKey(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 16) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('AUTH_SECRET must be set to a long random string in production.');
    }
    return new TextEncoder().encode('dev-only-asu-crowd-tracker-secret');
  }
  return new TextEncoder().encode(secret);
}

export async function createSessionToken(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(getSecretKey());
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    if (
      typeof payload.userId !== 'string' ||
      typeof payload.email !== 'string' ||
      typeof payload.name !== 'string' ||
      typeof payload.role !== 'string'
    ) {
      return null;
    }
    return {
      userId: payload.userId,
      email: payload.email,
      name: payload.name,
      role: payload.role,
    };
  } catch {
    return null;
  }
}
