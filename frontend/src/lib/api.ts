/**
 * Beyond The Body — API client.
 * Uses NEXT_PUBLIC_API_URL (default http://localhost:3000) for the Express backend.
 */

import type { TherapistDashboardData } from './dashboard-types';

const API_BASE = typeof window !== 'undefined' ? (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000') : process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

const AUTH_TOKEN_KEY = 'btb_token';
const AUTH_COOKIE_NAME = 'btb_token';
const AUTH_COOKIE_MAX_AGE_DAYS = 30;

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

export interface SpecialistProfileData {
  professionalTitle?: string;
  yearsExperience?: number | null;
  location?: string;
  qualification?: string;
  certifications?: string;
  licenseNumber?: string;
  specializations?: string[];
  bio?: string;
  services?: { name: string; duration: string; price: string; type: string }[];
  availableDays?: string[];
  availableTimes?: string;
  profilePhotoUrl?: string;
  introVideoUrl?: string;
  certDocsUrl?: string;
  clientReviews?: string;
  successStories?: string;
  message?: string;
}

export async function postSpecialistApplication(data: { name: string; email: string; specialty: string } & SpecialistProfileData) {
  return fetchJson<{ success: boolean; message: string }>(`${API_BASE}/api/specialist-applications`, { method: 'POST', body: JSON.stringify(data) });
}

export type SpecialistBrowse = { id: string; name: string; role: string; avatarUrl?: string | null; rating?: number | null; sessionCount: number };

export type SpecialistProfile = {
  id: string; name: string; role: string; avatarUrl?: string | null;
  rating?: number | null; sessionCount: number; clientCount: number;
  bio: string; specializations: string[]; qualifications: string[];
  languages: string[]; experience: string; sessionTypes: string[];
  education: string; approach: string; availability: string;
};

export async function browseSpecialists(): Promise<SpecialistBrowse[]> {
  return fetchJson(`${API_BASE}/api/specialists/browse`);
}

// ---------- Auth ----------
export type AuthUser = { id: string; name: string; email: string; role: string; avatarUrl?: string | null };

export async function login(email: string, password: string): Promise<{ user: AuthUser; token: string }> {
  const r = await fetchJson<{ user: AuthUser; token: string }>(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  return r;
}

export async function signup(
  name: string,
  email: string,
  password: string,
  mobile?: string,
  country?: string
): Promise<{ user: AuthUser; token: string }> {
  const r = await fetchJson<{ user: AuthUser; token: string }>(`${API_BASE}/api/auth/signup`, {
    method: 'POST',
    body: JSON.stringify({ name, email, password, mobile, country }),
  });
  return r;
}

// ---------- Dashboard API ----------
export const api = {
  async getMe(): Promise<AuthUser> {
    return fetchWithAuth<AuthUser>(`${API_BASE}/api/auth/me`);
  },

  async getBrainTips(): Promise<{ title: string; description: string; category: string; icon: string }[]> {
    return fetchBrainTips();
  },

  async getUserDashboard(userId: string): Promise<import('./dashboard-types').UserDashboardData> {
    return fetchWithAuth(`${API_BASE}/api/users/${userId}/dashboard`);
  },

  async getUpcomingSessions(userId: string) {
    return fetchWithAuth(`${API_BASE}/api/users/${userId}/sessions/upcoming`);
  },

  async getUserSessions(userId: string) {
    return fetchWithAuth(`${API_BASE}/api/users/${userId}/sessions`);
  },

  async getBookingRequests(userId: string) {
    return fetchWithAuth<{ id: string; specialistId: string; status: string; proposedAt: string; sessionType: string; createdAt: string }[]>(`${API_BASE}/api/users/${userId}/booking-requests`);
  },

  async postBookingRequest(userId: string, data: { specialistId: string; proposedAt: string; sessionType: string; message?: string }) {
    return fetchWithAuth<{ success: boolean; id: string; message: string }>(`${API_BASE}/api/users/${userId}/booking-request`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getAssignmentRequests(userId: string) {
    return fetchWithAuth<{ id: string; specialistId: string; status: string; createdAt: string }[]>(`${API_BASE}/api/users/${userId}/assignment-requests`);
  },

  async postAssignmentRequest(userId: string, specialistId: string) {
    return fetchWithAuth<{ success: boolean; message: string; alreadyAssigned?: boolean }>(`${API_BASE}/api/users/${userId}/assignment-request`, {
      method: 'POST',
      body: JSON.stringify({ specialistId }),
    });
  },

  async getAdminAssignmentRequests() {
    return fetchWithAuth<{ id: string; userId: string; specialistId: string; clientName: string; clientEmail: string; specialistName: string; specialistRole: string; consultationCount: number; createdAt: string }[]>(`${API_BASE}/api/admin/assignment-requests`);
  },

  async patchAdminAssignmentRequest(id: string, status: 'approved' | 'rejected') {
    return fetchWithAuth<{ success: boolean }>(`${API_BASE}/api/admin/assignment-requests/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  async getSpecialists(userId: string) {
    return fetchWithAuth<{ id: string; name: string; role: string }[]>(`${API_BASE}/api/users/${userId}/specialists`);
  },

  async getConversationPartners(userId: string) {
    return fetchWithAuth<{ id: string; name: string; type: string }[]>(`${API_BASE}/api/users/${userId}/conversation-partners`);
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

  async uploadAvatar(userId: string, avatarUrl: string) {
    return fetchWithAuth<{ success: boolean; avatarUrl: string }>(`${API_BASE}/api/users/${userId}/avatar`, {
      method: 'PATCH',
      body: JSON.stringify({ avatarUrl }),
    });
  },

  async getCommunityFeed() {
    return fetchWithAuth<import('@/lib/dashboard-types').CommunityPost[]>(`${API_BASE}/api/community/feed`);
  },

  async postCommunityPost(content: string) {
    return fetchWithAuth<import('@/lib/dashboard-types').CommunityPost>(`${API_BASE}/api/community/post`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  },

  async likeCommunityPost(postId: string) {
    return fetchWithAuth<{ liked: boolean; likes: number }>(`${API_BASE}/api/community/posts/${postId}/like`, {
      method: 'PATCH',
    });
  },

  async getAdminPlatformStats() {
    return fetchWithAuth(`${API_BASE}/api/admin/platform-stats`);
  },

  async getAdminApplications() {
    return fetchWithAuth(`${API_BASE}/api/admin/applications`);
  },

  async getAdminApplication(id: string): Promise<{ id: string; name: string; email: string; specialty: string; status: string; appliedAt: string }> {
    return fetchWithAuth(`${API_BASE}/api/admin/applications/${id}`);
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

  async getSpecialistProfile(specialistId: string): Promise<SpecialistProfile> {
    return fetchWithAuth(`${API_BASE}/api/specialists/${specialistId}/profile`);
  },

  async getAdminSessions() {
    return fetchWithAuth(`${API_BASE}/api/admin/sessions`);
  },

  async getAdminBookingRequests() {
    return fetchWithAuth(`${API_BASE}/api/admin/booking-requests`);
  },

  async getAdminMessages() {
    return fetchWithAuth(`${API_BASE}/api/admin/messages`);
  },

  async getAdminUsers() {
    return fetchWithAuth(`${API_BASE}/api/admin/users`);
  },

  async getAdminSpecialists() {
    return fetchWithAuth(`${API_BASE}/api/admin/specialists`);
  },

  async postAdminCreateSpecialist(data: { name: string; email: string; password: string; role: string } & SpecialistProfileData): Promise<{ id: string; name: string; email: string; role: string }> {
    return fetchWithAuth(`${API_BASE}/api/admin/specialists`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getAdminActivityLog() {
    return fetchWithAuth(`${API_BASE}/api/admin/activity-log`);
  },

  async getAdminNotifications(): Promise<{ notifications: { id: string; type: string; title: string; message: string; timestamp: string; createdAt: string }[]; pendingApplications: number; pendingBookingRequests: number; pendingAssignments: number }> {
    return fetchWithAuth(`${API_BASE}/api/admin/notifications`);
  },

  async patchUserSuspend(userId: string, suspended: boolean) {
    return fetchWithAuth(`${API_BASE}/api/admin/users/${userId}/suspend`, {
      method: 'PATCH',
      body: JSON.stringify({ suspended }),
    });
  },

  async getAdminUserMetrics(userId: string) {
    return fetchWithAuth(`${API_BASE}/api/admin/users/${userId}/metrics`);
  },

  async getAdminSpecialistMetrics(specialistId: string) {
    return fetchWithAuth(`${API_BASE}/api/admin/specialists/${specialistId}/metrics`);
  },

  async postAdminSession(data: { userId: string; specialistId: string; scheduledAt: string; sessionType?: string; durationMinutes?: number }) {
    return fetchWithAuth(`${API_BASE}/api/admin/sessions`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getSpecialistDashboard(specialistId: string): Promise<TherapistDashboardData> {
    return fetchWithAuth<TherapistDashboardData>(`${API_BASE}/api/specialists/${specialistId}/dashboard`);
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

  async postSpecialistSession(specialistId: string, data: { userId: string; scheduledAt: string; sessionType?: string; durationMinutes?: number }) {
    return fetchWithAuth(`${API_BASE}/api/specialists/${specialistId}/sessions`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async postMessage(toUserId: string, content: string) {
    return fetchWithAuth(`${API_BASE}/api/messages`, {
      method: 'POST',
      body: JSON.stringify({ toUserId, content }),
    });
  },

  async getMessages(withUserId: string) {
    return fetchWithAuth(`${API_BASE}/api/messages?with=${encodeURIComponent(withUserId)}`);
  },

  async getSpecialistReviews(specialistId: string) {
    return fetchWithAuth(`${API_BASE}/api/specialists/${specialistId}/reviews`);
  },

  // Phase 1 — Wellness Score
  async getWellnessScore(): Promise<{ score: number; label: string; components: { label: string; value: number; weight: string }[] }> {
    return fetchWithAuth(`${API_BASE}/api/wellness-score`);
  },

  // Phase 1 — Session Recaps
  async getSessionRecaps(): Promise<{ id: string; takeaways: string[]; homework: string[]; recommended_brain_tip: string | null; therapist_name: string | null; scheduled_at: string | null; next_session_at: string | null }[]> {
    return fetchWithAuth(`${API_BASE}/api/session-recaps`);
  },
  async postSessionRecap(data: { session_id?: string; user_id: string; takeaways?: string[]; homework?: string[]; recommended_brain_tip?: string; therapist_note?: string }) {
    return fetchWithAuth(`${API_BASE}/api/session-recaps`, { method: 'POST', body: JSON.stringify(data) });
  },
  async dismissSessionRecap(id: string) {
    return fetchWithAuth(`${API_BASE}/api/session-recaps`, { method: 'PATCH', body: JSON.stringify({ id }) });
  },

  // Phase 1 — Body Bank
  async getBodyBank(): Promise<{ connected: boolean; nutrition?: number; recovery?: number; fitness?: number; hydration?: number; synced_at?: string; stale?: boolean; error?: string }> {
    return fetchWithAuth(`${API_BASE}/api/bodybank`);
  },

  // Phase 1 — Mood Insights
  async getMoodInsights(): Promise<{ insights: string[] }> {
    return fetchWithAuth(`${API_BASE}/api/mood-insights`);
  },

  // Phase 1 — Healing Goals
  async getHealingGoals(): Promise<{ id: string; title: string; category: string; progress_history: { rating: number }[] }[]> {
    return fetchWithAuth(`${API_BASE}/api/healing-goals`);
  },
  async postHealingGoal(data: { title: string; category?: string }) {
    return fetchWithAuth(`${API_BASE}/api/healing-goals`, { method: 'POST', body: JSON.stringify(data) });
  },
  async patchHealingGoal(data: { action: 'log_progress'; goal_id: string; rating: number } | { action: 'deactivate'; goal_id: string }) {
    return fetchWithAuth(`${API_BASE}/api/healing-goals`, { method: 'PATCH', body: JSON.stringify(data) });
  },

  // Mark a brain tip as practiced — increments count & recalculates healing score
  async practiceBrainTip(userId: string): Promise<{ success: boolean; healingScore?: number; alreadyPracticed?: boolean }> {
    return fetchWithAuth(`${API_BASE}/api/users/${userId}/brain-tip-practiced`, { method: 'POST' });
  },

  // Mark a session as completed (callable by user or therapist)
  async completeSession(sessionId: string): Promise<{ success: boolean }> {
    return fetchWithAuth(`${API_BASE}/api/sessions/${sessionId}/complete`, { method: 'PATCH' });
  },
};
