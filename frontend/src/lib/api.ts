/**
 * Beyond The Body — API client.
 * Uses NEXT_PUBLIC_API_URL (default http://localhost:3000) for the Express backend.
 */

const API_BASE = typeof window !== 'undefined' ? (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000') : process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

const AUTH_TOKEN_KEY = 'btb_token';
const AUTH_COOKIE_NAME = 'btb_token';
const AUTH_COOKIE_MAX_AGE_DAYS = 1;

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function setToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(AUTH_TOKEN_KEY, token);
  const maxAge = AUTH_COOKIE_MAX_AGE_DAYS * 86400;
  document.cookie = `${AUTH_COOKIE_NAME}=${encodeURIComponent(token)}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

export function clearToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(AUTH_TOKEN_KEY);
  document.cookie = `${AUTH_COOKIE_NAME}=; path=/; max-age=0`;
}

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, { ...options, headers: { 'Content-Type': 'application/json', ...options?.headers } });
  if (!res.ok) throw new Error(await res.text().catch(() => res.statusText));
  return res.json();
}

function authHeaders(): Record<string, string> {
  const token = getToken();
  const h: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) h['Authorization'] = `Bearer ${token}`;
  return h;
}

async function fetchWithAuth<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, { ...options, headers: { ...authHeaders(), ...(options?.headers as Record<string, string>) } });
  if (!res.ok) throw new Error(await res.text().catch(() => res.statusText));
  return res.json();
}

// ---------- Public site API (used by app/page, Contact, JoinSection) ----------
export async function fetchAffirmations(): Promise<string[]> {
  const r = await fetchJson<string[] | string>(`${API_BASE}/api/affirmations`);
  return Array.isArray(r) ? r : [r as string];
}

export async function fetchConditions(): Promise<{ name: string; fact: string; treatment: string; signs: string[]; treatments: string[]; color: string }[]> {
  return fetchJson(`${API_BASE}/api/conditions`);
}

export async function fetchBrainTips(): Promise<{ title: string; description: string; category: string; icon: string }[]> {
  const r = await fetchJson<{ title: string; description: string; category: string; icon: string }[] | { title: string; description: string; category: string; icon: string }>(`${API_BASE}/api/brain-tips`);
  return Array.isArray(r) ? r : [r];
}

export async function fetchQuotes(): Promise<{ quote_text: string; author: string }[]> {
  return fetchJson(`${API_BASE}/api/quotes`);
}

export async function postContact(data: { name: string; email: string; message: string; service?: string }) {
  return fetchJson<{ success: boolean; message: string }>(`${API_BASE}/api/contact`, { method: 'POST', body: JSON.stringify(data) });
}

export async function postConsultation(data: { name: string; email: string; phone?: string; concern?: string; message?: string }) {
  return fetchJson<{ success: boolean; message: string }>(`${API_BASE}/api/consultation`, { method: 'POST', body: JSON.stringify(data) });
}

export async function postSpecialistApplication(data: { name: string; email: string; specialty: string; message?: string }) {
  return fetchJson<{ success: boolean; message: string }>(`${API_BASE}/api/specialist-applications`, { method: 'POST', body: JSON.stringify(data) });
}

export type SpecialistBrowse = { id: string; name: string; role: string; avatarUrl?: string | null; rating?: number | null; sessionCount: number };

export async function browseSpecialists(): Promise<SpecialistBrowse[]> {
  return fetchJson(`${API_BASE}/api/specialists/browse`);
}

// ---------- Auth ----------
export type AuthUser = { id: string; name: string; email: string; role: string };

export async function login(email: string, password: string): Promise<{ user: AuthUser; token: string }> {
  const r = await fetchJson<{ user: AuthUser; token: string }>(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  return r;
}

export async function signup(name: string, email: string, password: string): Promise<{ user: AuthUser; token: string }> {
  const r = await fetchJson<{ user: AuthUser; token: string }>(`${API_BASE}/api/auth/signup`, {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  });
  return r;
}

// ---------- Dashboard API ----------
export const api = {
  async getMe(): Promise<AuthUser> {
    return fetchWithAuth<AuthUser>(`${API_BASE}/api/auth/me`);
  },

  async getUserDashboard(userId: string): Promise<import('./dashboard-types').UserDashboardData> {
    return fetchWithAuth(`${API_BASE}/api/users/${userId}/dashboard`);
  },

  async getUpcomingSessions(userId: string) {
    return fetchWithAuth(`${API_BASE}/api/users/${userId}/sessions/upcoming`);
  },

  async getSpecialists(userId: string) {
    return fetchWithAuth(`${API_BASE}/api/users/${userId}/specialists`);
  },

  async getMoodLog(userId: string) {
    return fetchWithAuth(`${API_BASE}/api/users/${userId}/mood-log`);
  },

  async postMoodLog(userId: string, data: { date: string; value: number; note?: string }) {
    return fetchWithAuth(`${API_BASE}/api/users/${userId}/mood-log`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getCommunityFeed() {
    return fetchWithAuth(`${API_BASE}/api/community/feed`);
  },

  async getAdminPlatformStats() {
    return fetchWithAuth(`${API_BASE}/api/admin/platform-stats`);
  },

  async getAdminApplications() {
    return fetchWithAuth(`${API_BASE}/api/admin/applications`);
  },

  async patchApplication(id: string, status: string): Promise<{ success: boolean; newUser?: { id: string; name: string; email: string; role: string; tempPassword: string } | null }> {
    return fetchWithAuth(`${API_BASE}/api/admin/applications/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  async browseSpecialists(): Promise<SpecialistBrowse[]> {
    return fetchWithAuth(`${API_BASE}/api/specialists/browse`);
  },

  async getAdminSessions() {
    return fetchWithAuth(`${API_BASE}/api/admin/sessions`);
  },

  async getAdminUsers() {
    return fetchWithAuth(`${API_BASE}/api/admin/users`);
  },

  async getAdminSpecialists() {
    return fetchWithAuth(`${API_BASE}/api/admin/specialists`);
  },

  async getAdminActivityLog() {
    return fetchWithAuth(`${API_BASE}/api/admin/activity-log`);
  },

  async getSpecialistDashboard(specialistId: string) {
    return fetchWithAuth(`${API_BASE}/api/specialists/${specialistId}/dashboard`);
  },

  async getSpecialistClients(specialistId: string) {
    return fetchWithAuth(`${API_BASE}/api/specialists/${specialistId}/clients`);
  },

  async getSpecialistSessionsToday(specialistId: string) {
    return fetchWithAuth(`${API_BASE}/api/specialists/${specialistId}/sessions/today`);
  },

  async getSpecialistNotes(specialistId: string) {
    return fetchWithAuth(`${API_BASE}/api/specialists/${specialistId}/notes`);
  },

  async getSpecialistRequests(specialistId: string) {
    return fetchWithAuth(`${API_BASE}/api/specialists/${specialistId}/requests`);
  },

  async patchBookingRequest(specialistId: string, requestId: string, status: 'accepted' | 'declined') {
    return fetchWithAuth(`${API_BASE}/api/specialists/${specialistId}/requests/${requestId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  async getSpecialistReviews(specialistId: string) {
    return fetchWithAuth(`${API_BASE}/api/specialists/${specialistId}/reviews`);
  },
};
