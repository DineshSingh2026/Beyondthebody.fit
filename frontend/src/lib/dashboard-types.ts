/** Beyond The Body — Dashboard TypeScript interfaces */

export type UserRole =
  | 'USER'
  | 'ADMIN'
  | 'LIFE_COACH'
  | 'HYPNOTHERAPIST'
  | 'THERAPIST'
  | 'MUSIC_TUTOR';

export type SpecialistType = 'LIFE_COACH' | 'HYPNOTHERAPIST' | 'THERAPIST' | 'MUSIC_TUTOR';

export type SessionStatus = 'UPCOMING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
export type ApplicationStatus = 'PENDING' | 'REVIEWING' | 'APPROVED' | 'REJECTED';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: UserRole;
}

export interface HealingScore {
  value: number; // 0-100
  label?: string;
}

export interface UserDashboardData {
  user: User;
  healingScore: HealingScore;
  stats: { sessionsCompleted: number; streak: number; moodAverage: number; communityPosts: number };
  affirmation: string;
  brainTip: { title: string; description: string; icon: string };
  upcomingSessions: SessionSummary[];
  specialists: SpecialistSummary[];
  moodLog: MoodDay[];
  milestones: Milestone[];
  communityFeed: CommunityPost[];
  dailyBrainTip: { title: string; description: string; category: string };
}

export interface SessionSummary {
  id: string;
  clientName: string;
  specialistName: string;
  specialistType: SpecialistType;
  type: string;
  time: string;
  date?: string;
  scheduledAt?: string;
  durationMinutes: number;
  status: SessionStatus;
  rating?: number;
  meetingLink?: string | null;
}

export interface SpecialistSummary {
  id: string;
  name: string;
  type: SpecialistType;
  avatar?: string;
  rating: number;
  sessionCount?: number;
}

export interface MoodDay {
  date: string;
  value: number; // 1-10
  note?: string;
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  date: string;
  icon?: string;
}

export interface CommunityPost {
  id: string;
  authorName: string;
  authorAvatar?: string;
  content: string;
  timestamp: string;
  likes: number;
  comments: number;
}

export interface AdminPlatformStats {
  platformScore: number;
  uptimePercent: number;
  activeSessions: number;
  errorRate: number;
  revenueToday: number;
  revenueDeltaPercent: number;
  revenueSparkline: number[];
  liveUsers: number;
  liveSessions: number;
  specialistsOnline: number;
  totalUsers: number;
  totalSpecialists: number;
  sessionsThisMonth: number;
  avgSessionRating: number;
  revenueMTD: number;
  newApplications: number;
}

export interface SpecialistApplication {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  specialty: SpecialistType;
  appliedAt: string;
  status: ApplicationStatus;
}

export interface AdminSessionRow {
  id: string;
  userName: string;
  specialistName: string;
  specialty: SpecialistType;
  durationMinutes: number;
  rating: number;
  status: SessionStatus;
}

export interface SpecialistRosterEntry {
  id: string;
  name: string;
  avatar?: string;
  specialty: SpecialistType;
  active: boolean;
  sessionCount: number;
  rating: number;
}

export interface ActivityLogEntry {
  id: string;
  type: 'user_signup' | 'session_completed' | 'application_submitted' | 'payment_received';
  message: string;
  timestamp: string;
}

export interface TherapistDashboardData {
  specialist: User & { role: SpecialistType };
  practiceScore: number; // 0-100 (e.g. 4.8/5 -> 96)
  todayStats: { sessionsToday: number; hoursBooked: number; newRequests: number; completionRate: number };
  earningsThisMonth: number;
  earningsDeltaPercent: number;
  earningsSparkline: number[];
  stats: { activeClients: number; sessionsThisWeek: number; avgRating: number; completionRate: number; responseTimeMinutes: number };
  todaySchedule: SessionSummary[];
  clients: ClientRosterEntry[];
  recentNotes: SessionNote[];
  pendingRequests: BookingRequest[];
  clientMilestones: { clientName: string; achievement: string; date: string }[];
  reviews: ReviewEntry[];
  earningsBreakdown: { sessionsCount: number; rate: number; pendingPayout: number; paidOut: number };
}

export interface ClientRosterEntry {
  id: string;
  name: string;
  avatar?: string;
  sessionCount: number;
  lastSessionDate: string;
  progressScore: number;
  metricLabel: string;
  metricValue: string;
}

export interface SessionNote {
  id: string;
  clientName: string;
  date: string;
  preview: string;
  tags: string[];
  isPrivate: boolean;
}

export interface BookingRequest {
  id: string;
  clientName: string;
  clientAvatar?: string;
  requestedAt: string;
  proposedTime: string;
  sessionType: string;
}

export interface ReviewEntry {
  id: string;
  clientName: string;
  date: string;
  rating: number;
  excerpt: string;
}

export interface ScheduleSlot {
  day: string;
  slots: { hour: number; status: 'open' | 'booked' | 'blocked' }[];
}
