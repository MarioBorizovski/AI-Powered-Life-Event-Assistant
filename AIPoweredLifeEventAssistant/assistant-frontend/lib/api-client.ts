/**
 * api-client.ts
 * Typed REST client for the еУслуги backend (FastAPI).
 * Token is stored in localStorage under "euslugi_token".
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const TOKEN_KEY = "euslugi_token";

// ── Types ─────────────────────────────────────────────────
export interface ApiUser {
  id: string;
  email: string;
  name: string;
  role: "user" | "admin";
  embg?: string | null;
  phone_number?: string | null;
  address?: string | null;
  city?: string | null;
  created_at: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  user: ApiUser;
}

export interface ApiTodo {
  id: string;
  text: string;
  description?: string | null;
  deadline?: string | null;
  priority: "high" | "medium" | "low";
  completed: boolean;
}

export interface ApiDocument {
  name: string;
  description?: string | null;
  required: boolean;
}

export interface ApiService {
  id: string;
  name: string;
  description?: string | null;
  location?: string | null;
  link?: string | null;
}

export interface ApiRequest {
  id: string;
  user_id: string;
  life_event: string;
  description?: string | null;
  status: "pending" | "completed" | "cancelled";
  created_at: string;
  todos: ApiTodo[];
  documents: ApiDocument[];
  services: ApiService[];
}

export interface AdminStats {
  totalUsers: number;
  totalRequests: number;
  pendingRequests: number;
  completedRequests: number;
  cancelledRequests: number;
  requestsByLifeEvent: { lifeEvent: string; count: number }[];
}

// ── Token helpers ─────────────────────────────────────────
export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

// ── Core fetch wrapper ────────────────────────────────────
async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  if (res.status === 204) return undefined as unknown as T;

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const message =
      data?.detail ?? `HTTP ${res.status}: ${res.statusText}`;
    throw new Error(message);
  }

  return data as T;
}

// ── Auth ──────────────────────────────────────────────────
export const apiAuth = {
  async login(email: string, password: string): Promise<TokenResponse> {
    return apiFetch<TokenResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },

  async register(
    name: string,
    email: string,
    password: string
  ): Promise<TokenResponse> {
    return apiFetch<TokenResponse>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    });
  },

  async me(): Promise<ApiUser> {
    return apiFetch<ApiUser>("/api/auth/me");
  },

  async updateMe(data: {
    name?: string;
    email?: string;
    password?: string;
    embg?: string;
    phone_number?: string;
    address?: string;
    city?: string;
  }): Promise<ApiUser> {
    return apiFetch<ApiUser>("/api/auth/me", {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },
};

// ── Life Events (Requests) ────────────────────────────────
export const apiEvents = {
  async list(): Promise<ApiRequest[]> {
    return apiFetch<ApiRequest[]>("/api/events/");
  },

  async get(id: string): Promise<ApiRequest> {
    return apiFetch<ApiRequest>(`/api/events/${id}`);
  },

  async create(data: {
    life_event: string;
    description?: string;
    options?: string[];
  }): Promise<ApiRequest> {
    return apiFetch<ApiRequest>("/api/events/", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async updateStatus(
    id: string,
    status: "pending" | "completed" | "cancelled"
  ): Promise<void> {
    return apiFetch<void>(`/api/events/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  },

  async delete(id: string): Promise<void> {
    return apiFetch<void>(`/api/events/${id}`, { method: "DELETE" });
  },
};

// ── Tasks ─────────────────────────────────────────────────
export const apiTasks = {
  async toggle(todoId: string): Promise<ApiTodo> {
    return apiFetch<ApiTodo>(`/api/tasks/${todoId}/toggle`, {
      method: "PATCH",
    });
  },
};

// ── Admin ─────────────────────────────────────────────────
export const apiAdmin = {
  async stats(): Promise<AdminStats> {
    return apiFetch<AdminStats>("/api/admin/stats");
  },

  async listUsers(): Promise<ApiUser[]> {
    return apiFetch<ApiUser[]>("/api/admin/users");
  },

  async listRequests(): Promise<ApiRequest[]> {
    return apiFetch<ApiRequest[]>("/api/admin/requests");
  },

  async updateUserRole(userId: string, role: "user" | "admin"): Promise<void> {
    return apiFetch<void>(`/api/admin/users/${userId}/role`, {
      method: "PATCH",
      body: JSON.stringify({ role }),
    });
  },

  async deleteUser(userId: string): Promise<void> {
    return apiFetch<void>(`/api/admin/users/${userId}`, { method: "DELETE" });
  },
};

// ── Health ────────────────────────────────────────────────
export const apiHealth = {
  async check(): Promise<{ status: string; message: string }> {
    return apiFetch("/api/health");
  },
};
