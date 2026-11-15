/** Canonical toast / API error copy for auth flows. */

export const AUTH_MESSAGES = {
  // Sign up
  asuEmailOnly: 'Please use an ASU email address to sign up (name@asu.edu only).',
  invalidEmail: 'Enter a valid email address.',
  nameRequired: 'Enter your name.',
  roleRequired: 'Select your role.',
  passwordTooShort: 'Password must be at least 6 characters.',
  passwordsMismatch: 'Passwords do not match.',
  emailExists: 'An account with this email already exists. Try logging in.',
  signupFailed: 'Sign up failed. Please try again.',
  signupSuccess: (name: string) => `Account created. Welcome, ${name}!`,

  // Login
  loginFieldsRequired: 'Enter your email and password.',
  loginAsuEmail: 'Please sign in with your ASU email (@asu.edu).',
  invalidCredentials: 'Incorrect email or password.',
  loginFailed: 'Login failed. Please try again.',
  loginSuccess: (name: string) => `Welcome back, ${name}!`,

  // Change password
  changePasswordFieldsRequired:
    'Fill in your current password and both new password fields.',
  newPasswordTooShort: 'New password must be at least 6 characters.',
  newPasswordsMismatch: 'New passwords do not match.',
  newPasswordSameAsOld: 'New password must be different from your current password.',
  currentPasswordIncorrect: 'Current password is incorrect.',
  changePasswordFailed: "Couldn't update password. Please try again.",
  changePasswordSuccess: 'Password updated successfully.',

  // Session
  loggedOut: "You've been logged out.",
  loginRequired: 'Please log in to continue.',
  sessionExpired: 'Your session expired. Please log in again.',
} as const;

export const USER_ROLES = ['Student', 'Faculty', 'Staff', 'Other'] as const;
export type UserRole = (typeof USER_ROLES)[number];
