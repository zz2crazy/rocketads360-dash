export async function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function validatePassword(password: string): void {
  if (password.length < 6) {
    throw new Error('Password must be at least 6 characters long');
  }
}

export function isSupabaseError(error: unknown): error is { code: string; message: string } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'message' in error
  );
}

export function isDatabaseError(error: unknown): boolean {
  return (
    isSupabaseError(error) &&
    error.code.startsWith('PGRST') || 
    error.code.startsWith('23')
  );
}

export function formatError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'An unexpected error occurred';
}