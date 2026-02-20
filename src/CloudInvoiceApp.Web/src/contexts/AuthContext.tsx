import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import type { UserInfo, AuthResponse } from "@/types/auth";
import { api, configureApiAuth } from "@/services/ApiService";

interface AuthContextValue {
  user: UserInfo | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loginWithGoogle: (credential: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const REFRESH_TOKEN_KEY = "cloud_invoice_refresh_token";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const handleAuthResponse = useCallback((data: AuthResponse) => {
    setUser(data.user);
    setAccessToken(data.accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken);
  }, []);

  const clearAuth = useCallback(() => {
    setUser(null);
    setAccessToken(null);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }, []);

  const refreshAccessToken = useCallback(async (): Promise<string | null> => {
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    if (!refreshToken) return null;

    try {
      const response = await api.post<AuthResponse>("/auth/refresh", {
        refreshToken,
      });
      handleAuthResponse(response.data);
      return response.data.accessToken;
    } catch {
      clearAuth();
      return null;
    }
  }, [handleAuthResponse, clearAuth]);

  // Configure API interceptors whenever accessToken changes
  useEffect(() => {
    configureApiAuth(
      () => accessToken,
      refreshAccessToken,
      clearAuth
    );
  }, [accessToken, refreshAccessToken, clearAuth]);

  // Attempt session restore on mount
  useEffect(() => {
    const restore = async () => {
      const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
      if (refreshToken) {
        await refreshAccessToken();
      }
      setIsLoading(false);
    };
    restore();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loginWithGoogle = useCallback(
    async (credential: string) => {
      const response = await api.post<AuthResponse>("/auth/google", {
        credential,
      });
      handleAuthResponse(response.data);
    },
    [handleAuthResponse]
  );

  const logout = useCallback(async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      // Ignore errors during logout
    }
    clearAuth();
  }, [clearAuth]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        loginWithGoogle,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
