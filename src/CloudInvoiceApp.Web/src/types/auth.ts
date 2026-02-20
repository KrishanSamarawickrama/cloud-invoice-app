export interface UserInfo {
  id: number;
  email: string;
  name: string;
  pictureUrl?: string | null;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: UserInfo;
}

export interface AuthState {
  user: UserInfo | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
