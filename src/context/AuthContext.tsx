import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import staffApi from "@/services/api/staff.api";
import type { Staff, StaffLoginResponse } from "@/types/api.types";

const ACCESS_KEY = "authToken";
const REFRESH_KEY = "authRefreshToken";

interface AuthContextValue {
  user: Staff | null;
  loading: boolean;
  /** True after the initial /me check has finished. */
  initialized: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  /** Returns true if the logged-in staff has any of the given role codes. */
  hasRole: (...codes: string[]) => boolean;
  /** True for super_admin / it_head — bypass all role gates. */
  isSuperUser: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<Staff | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);

  /** Loads the currently-authenticated user from /staff/me. */
  const loadMe = useCallback(async () => {
    const token = localStorage.getItem(ACCESS_KEY);
    if (!token) {
      setUser(null);
      return;
    }
    try {
      const r = await staffApi.me();
      if (r.success && r.data) setUser(r.data);
      else setUser(null);
    } catch {
      // Token likely expired/invalid. Try a refresh once before giving up.
      const refreshTok = localStorage.getItem(REFRESH_KEY);
      if (!refreshTok) {
        clearTokens();
        setUser(null);
        return;
      }
      try {
        const r = await staffApi.refresh(refreshTok);
        if (r.success && r.data) {
          storeTokens(r.data);
          const me = await staffApi.me();
          if (me.success && me.data) setUser(me.data);
          else setUser(null);
        } else {
          clearTokens();
          setUser(null);
        }
      } catch {
        clearTokens();
        setUser(null);
      }
    }
  }, []);

  // Run once on mount.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      await loadMe();
      if (!cancelled) {
        setLoading(false);
        setInitialized(true);
      }
    })();
    return () => { cancelled = true; };
  }, [loadMe]);

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    try {
      const r = await staffApi.login({ email: email.trim().toLowerCase(), password });
      if (!r.success || !r.data) {
        throw new Error(r.message || "Login failed");
      }
      storeTokens(r.data);
      // The login response includes the staff object — use it directly.
      if (r.data.staff) setUser(r.data.staff as Staff);
      else await loadMe();
    } finally {
      setLoading(false);
    }
  }, [loadMe]);

  const logout = useCallback(async () => {
    const refreshTok = localStorage.getItem(REFRESH_KEY) || undefined;
    try {
      await staffApi.logout(refreshTok);
    } catch {/* ignore */}
    clearTokens();
    setUser(null);
  }, []);

  const refresh = useCallback(async () => {
    await loadMe();
  }, [loadMe]);

  const hasRole = useCallback(
    (...codes: string[]) => {
      if (!user?.roles) return false;
      return user.roles.some((r: any) => codes.includes(r.role) && !r.revoked_at);
    },
    [user],
  );

  const isSuperUser = !!user && (
    hasRole("super_admin", "admin", "it_head")
  );

  const value: AuthContextValue = {
    user,
    loading,
    initialized,
    isAuthenticated: !!user,
    login,
    logout,
    refresh,
    hasRole,
    isSuperUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
};

// ─── Token plumbing ────────────────────────────────────────────────

function storeTokens(payload: StaffLoginResponse) {
  if ((payload as any).access_token) localStorage.setItem(ACCESS_KEY, (payload as any).access_token);
  if ((payload as any).refresh_token) localStorage.setItem(REFRESH_KEY, (payload as any).refresh_token);
}

function clearTokens() {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
}
