export const ERROR_MESSAGES = {
  INVALID_CREDENTIALS: 'Incorrect email or password. Please check your credentials and try again.',
  EMAIL_NOT_CONFIRMED: 'Please confirm your email address before signing in.',
  PROFILE_NOT_FOUND: 'User profile not found. Please contact support.',
  UNEXPECTED_ERROR: 'An unexpected error occurred. Please try again.',
  NO_USER_DATA: 'No user data returned after authentication',
  SIGN_OUT_FAILED: 'Failed to sign out. Please try again.',
  CLIENT_CREATION_FAILED: 'Failed to create client. Please try again.',
  AUTH_IN_PROGRESS: 'Authentication already in progress',
  SESSION_FAILED: 'Failed to establish session',
  PROFILE_FETCH_FAILED: 'Failed to fetch user profile',
} as const;