import type { Profile } from '../../types';

export interface AuthResult {
  user: {
    id: string;
    email: string;
  };
  profile: Profile;
}

export interface ProfileResponse {
  data: Profile | null;
  error: Error | null;
}