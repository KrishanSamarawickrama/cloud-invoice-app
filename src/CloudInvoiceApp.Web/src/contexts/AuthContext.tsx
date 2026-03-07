import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
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

// Module-level dedup — survives StrictMode unmount/remount cycles
let refreshPromise: Promise<AuthResponse | null> | null = null;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const handleAuthResponse = useCallback((data: AuthResponse) => {
    setUser(data.user);
    setAccessToken(data.accessToken);
  }, []);

  const clearAuth = useCallback(() => {
    setUser(null);
    setAccessToken(null);
  }, []);

  const refreshAccessToken = useCallback(async (): Promise<string | null> => {
    if (!refreshPromise) {
      refreshPromise = api
        .post<AuthResponse>("/auth/refresh")
        .then((res) => res.data)
        .catch(() => null)
        .finally(() => { refreshPromise = null; });
    }

    const data = await refreshPromise;
    if (data) {
      handleAuthResponse(data);
      return data.accessToken;
    }
    clearAuth();
    return null;
  }, [handleAuthResponse, clearAuth]);

  // Configure API interceptors whenever accessToken changes
  useEffect(() => {
    configureApiAuth(
      () => accessToken,
      refreshAccessToken,
      clearAuth
    );
  }, [accessToken, refreshAccessToken, clearAuth]);

  // Attempt session restore on mount (cookie sent automatically)
  useEffect(() => {
    const restore = async () => {
      await refreshAccessToken();
      setIsLoading(false);
    };
    restore();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loginInProgress = useRef(false);

  const loginWithGoogle = useCallback(
    async (credential: string) => {
      if (loginInProgress.current) return;
      loginInProgress.current = true;
      try {
        const response = await api.post<AuthResponse>("/auth/google", {
          credential,
        });
        handleAuthResponse(response.data);
      } finally {
        loginInProgress.current = false;
      }
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
