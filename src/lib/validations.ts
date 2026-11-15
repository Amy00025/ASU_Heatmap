import { AUTH_MESSAGES, USER_ROLES, type UserRole } from './auth-messages';

export function isAsuEmail(email: string): boolean {
  return /^[^\s@]+@asu\.edu$/i.test(email.trim());
}

export function isValidEmailFormat(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function validateSignupInput(input: {
  name?: string;
  email?: string;
  role?: string;
  password?: string;
  confirmPassword?: string;
}): string | null {
  const name = input.name?.trim() ?? '';
  const email = input.email?.trim() ?? '';
  const role = input.role?.trim() ?? '';
  const password = input.password ?? '';
  const confirmPassword = input.confirmPassword ?? '';

  if (!name) return AUTH_MESSAGES.nameRequired;
  if (!email) return AUTH_MESSAGES.invalidEmail;
  if (!isValidEmailFormat(email)) return AUTH_MESSAGES.invalidEmail;
  if (!isAsuEmail(email)) return AUTH_MESSAGES.asuEmailOnly;
  if (!role || !USER_ROLES.includes(role as UserRole)) {
    return AUTH_MESSAGES.roleRequired;
  }
  if (password.length < 6) return AUTH_MESSAGES.passwordTooShort;
  if (password !== confirmPassword) return AUTH_MESSAGES.passwordsMismatch;
  return null;
}

export function validateLoginInput(input: {
  email?: string;
  password?: string;
}): string | null {
  const email = input.email?.trim() ?? '';
  const password = input.password ?? '';

  if (!email || !password) return AUTH_MESSAGES.loginFieldsRequired;
  if (!isValidEmailFormat(email)) return AUTH_MESSAGES.invalidEmail;
  if (!isAsuEmail(email)) return AUTH_MESSAGES.loginAsuEmail;
  return null;
}

export function validateChangePasswordInput(input: {
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}): string | null {
  const currentPassword = input.currentPassword ?? '';
  const newPassword = input.newPassword ?? '';
  const confirmPassword = input.confirmPassword ?? '';

  if (!currentPassword || !newPassword || !confirmPassword) {
    return AUTH_MESSAGES.changePasswordFieldsRequired;
  }
  if (newPassword.length < 6) return AUTH_MESSAGES.newPasswordTooShort;
  if (newPassword !== confirmPassword) return AUTH_MESSAGES.newPasswordsMismatch;
  if (newPassword === currentPassword) return AUTH_MESSAGES.newPasswordSameAsOld;
  return null;
}
