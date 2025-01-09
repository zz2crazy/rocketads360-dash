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