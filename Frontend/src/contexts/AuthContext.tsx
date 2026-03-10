import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: "customer" | "pharmacy_owner";
  token: string;
  redirectPath: string;
};

type AuthContextValue = {
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<AuthUser>;
  register: (payload: {
    name: string;
    email: string;
    password: string;
    role: "customer" | "pharmacy_owner";
    pharmacyName?: string;
    pharmacyAddress?: string;
    phone?: string;
  }) => Promise<AuthUser>;
  logout: () => Promise<void>;
  getAuthHeaders: () => Record<string, string>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const STORAGE_KEY = "pharmalovo_auth";
const API_BASE_URL = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

const getApiUrl = (path: string) => {
  if (API_BASE_URL) {
    return `${API_BASE_URL}${path}`;
  }
  // In Vite dev, this is served through the proxy in vite.config.ts.
  return path;
};

const getNetworkErrorMessage = () =>
  "Cannot reach backend API. Start backend on http://localhost:8080 or set VITE_API_URL.";

const getAuthHeaders = (user: AuthUser | null) => {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (user?.token) {
    headers.Authorization = `Bearer ${user.token}`;
  }
  return headers;
};

const parseApiResponse = async (
  response: Response,
): Promise<Record<string, unknown>> => {
  const raw = await response.text();

  if (!raw) {
    return {};
  }

  try {
    return JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return { message: raw };
  }
};

const readErrorMessage = (data: Record<string, unknown>, fallback: string) => {
  const fromError = typeof data.error === "string" ? data.error : undefined;
  const fromMessage =
    typeof data.message === "string" ? data.message : undefined;
  if (fromError || fromMessage) {
    return fromError || fromMessage || fallback;
  }

  // Spring validation can return a field -> message map (e.g. { email: "Email must be valid" }).
  const firstFieldError = Object.values(data).find(
    (value) => typeof value === "string",
  );
  if (typeof firstFieldError === "string" && firstFieldError.trim()) {
    return firstFieldError;
  }

  return fallback;
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setUser(JSON.parse(stored) as AuthUser);
    }
  }, []);

  const persistUser = (nextUser: AuthUser) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextUser));
    setUser(nextUser);
  };

  const login: AuthContextValue["login"] = async (email, password) => {
    let response: Response;
    try {
      response = await fetch(getApiUrl("/api/auth/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
    } catch {
      throw new Error(getNetworkErrorMessage());
    }

    const data = await parseApiResponse(response);
    if (!response.ok) {
      throw new Error(readErrorMessage(data, "Login failed"));
    }

    const nextUser: AuthUser = {
      id: String(data.userId ?? ""),
      name: typeof data.name === "string" ? data.name : email,
      email,
      role: data.role === "pharmacy_owner" ? "pharmacy_owner" : "customer",
      token: typeof data.token === "string" ? data.token : "",
      redirectPath:
        typeof data.redirectPath === "string"
          ? data.redirectPath
          : data.role === "pharmacy_owner"
            ? "/dashboard"
            : "/dashboard",
    };

    if (!nextUser.id) {
      throw new Error("Login succeeded but user payload is incomplete.");
    }

    persistUser(nextUser);
    return nextUser;
  };

  const register: AuthContextValue["register"] = async (payload) => {
    let response: Response;
    try {
      response = await fetch(getApiUrl("/api/auth/register"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch {
      throw new Error(getNetworkErrorMessage());
    }

    const data = await parseApiResponse(response);
    if (!response.ok) {
      throw new Error(readErrorMessage(data, "Registration failed"));
    }

    const nextUser: AuthUser = {
      id: String(data.userId ?? ""),
      name: typeof data.name === "string" ? data.name : payload.name,
      email: payload.email,
      role: data.role === "pharmacy_owner" ? "pharmacy_owner" : "customer",
      token: typeof data.token === "string" ? data.token : "",
      redirectPath:
        typeof data.redirectPath === "string"
          ? data.redirectPath
          : data.role === "pharmacy_owner"
            ? "/dashboard"
            : "/dashboard",
    };

    if (!nextUser.id) {
      throw new Error("Registration succeeded but user payload is incomplete.");
    }

    persistUser(nextUser);
    return nextUser;
  };

  const logout: AuthContextValue["logout"] = async () => {
    try {
      await fetch(getApiUrl("/api/auth/logout"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
    } finally {
      localStorage.removeItem(STORAGE_KEY);
      setUser(null);
    }
  };

  const value = useMemo(() => ({ user, login, register, logout, getAuthHeaders: () => getAuthHeaders(user) }), [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
