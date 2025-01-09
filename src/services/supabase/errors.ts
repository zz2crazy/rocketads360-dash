export class SupabaseError extends Error {
  constructor(message: string, public code?: string, public cause?: Error) {
    super(message);
    this.name = 'SupabaseError';
  }
}

export class ProfileNotFoundError extends SupabaseError {
  constructor(userId: string) {
    super(`Profile not found for user: ${userId}`);
    this.name = 'ProfileNotFoundError';
    this.code = 'PROFILE_NOT_FOUND';
  }
}

export class AuthenticationError extends SupabaseError {
  constructor(message: string, cause?: Error) {
    super(message, 'AUTHENTICATION_FAILED', cause);
    this.name = 'AuthenticationError';
  }
}