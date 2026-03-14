/** Beyond The Body — Mock/empty data for dashboards */

import type {
  UserDashboardData,
  User,
  AdminPlatformStats,
  SpecialistApplication,
  SpecialistType,
  AdminSessionRow,
  SpecialistRosterEntry,
  ActivityLogEntry,
  TherapistDashboardData,
  ClientRosterEntry,
  SessionNote,
  BookingRequest,
  ReviewEntry,
  ScheduleSlot,
} from './dashboard-types';

const specialistType = (s: string) => s as 'LIFE_COACH' | 'HYPNOTHERAPIST' | 'THERAPIST' | 'MUSIC_TUTOR';

/** Empty dashboard for a real user when API fails or they have no data yet */
export function emptyUserDashboard(user: User): UserDashboardData {
  const firstName = user.name.split(' ')[0] || user.name;
  return {
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
    healingScore: { value: 0, label: 'Healing Journey' },
    stats: { sessionsCompleted: 0, streak: 0, moodAverage: 0, communityPosts: 0 },
    affirmation: 'I am worthy of healing and growth.',
    brainTip: { title: 'Box Breathing', description: 'Inhale 4s, hold 4s, exhale 4s. Repeat for calm.', icon: '🫁' },
    upcomingSessions: [],
    specialists: [],
    moodLog: [],
    milestones: [],
    communityFeed: [],
    dailyBrainTip: { title: '5-4-3-2-1 Grounding', description: 'Name 5 things you see, 4 you touch, 3 you hear, 2 you smell, 1 you taste.', category: 'Grounding' },
  };
}

export const mockUserDashboard: UserDashboardData = {
  user: { id: 'u1', name: 'Alex Rivera', email: 'alex@example.com', role: 'USER' },
  healingScore: { value: 72, label: 'Healing Journey' },
  stats: { sessionsCompleted: 24, streak: 7, moodAverage: 7.2, communityPosts: 12 },
  affirmation: 'I am worthy of healing, growth, and unconditional love. Every step I take brings me closer to peace.',
  brainTip: {
    title: 'Box Breathing',
    description: 'Inhale 4s → Hold 4s → Exhale 4s → Hold 4s. Repeat for instant calm.',
    icon: '🫁',
  },
  upcomingSessions: [
    { id: 's1', clientName: 'Alex', specialistName: 'Dr. Sarah Chen', specialistType: specialistType('THERAPIST'), type: '1:1 Therapy', time: '2:00 PM', durationMinutes: 50, status: 'UPCOMING' },
    { id: 's2', clientName: 'Alex', specialistName: 'James Miller', specialistType: specialistType('LIFE_COACH'), type: 'Goal Setting', time: 'Fri 10:00 AM', durationMinutes: 45, status: 'UPCOMING' },
  ],
  specialists: [
    { id: 'sp1', name: 'Dr. Sarah Chen', type: specialistType('THERAPIST'), rating: 4.9, sessionCount: 12 },
    { id: 'sp2', name: 'James Miller', type: specialistType('LIFE_COACH'), rating: 4.8, sessionCount: 8 },
    { id: 'sp3', name: 'Maya Foster', type: specialistType('HYPNOTHERAPIST'), rating: 5.0, sessionCount: 4 },
  ],
  moodLog: Array.from({ length: 14 }, (_, i) => ({
    date: new Date(Date.now() - (13 - i) * 86400000).toISOString().slice(0, 10),
    value: 5 + Math.round(Math.random() * 4),
    note: i === 13 ? 'Feeling grounded after session' : undefined,
  })),
  milestones: [
    { id: 'm1', title: 'First session completed', description: 'You began your healing journey', date: '2024-01-15', icon: '🌱' },
    { id: 'm2', title: '10 sessions milestone', description: 'Consistency is your superpower', date: '2024-03-01', icon: '✨' },
    { id: 'm3', title: '7-day streak', description: 'Daily check-ins for 7 days', date: new Date().toISOString().slice(0, 10), icon: '🔥' },
  ],
  communityFeed: [
    { id: 'c1', authorName: 'Jordan K.', content: 'Today I finally spoke about my anxiety in group. So grateful for this safe space.', timestamp: '2h ago', likes: 24, comments: 5 },
    { id: 'c2', authorName: 'Sam T.', content: 'Three months in and my sleep has never been better. Mind-body connection is real.', timestamp: '5h ago', likes: 41, comments: 8 },
  ],
  dailyBrainTip: { title: '5-4-3-2-1 Grounding', description: 'Name 5 things you see, 4 you touch, 3 you hear, 2 you smell, 1 you taste.', category: 'Grounding' },
};

/** Empty stats when API fails or no data yet */
export const emptyAdminPlatformStats: AdminPlatformStats = {
  platformScore: 0,
  uptimePercent: 0,
  activeSessions: 0,
  errorRate: 0,
  revenueToday: 0,
  revenueDeltaPercent: 0,
  revenueSparkline: [],
  liveUsers: 0,
  liveSessions: 0,
  specialistsOnline: 0,
  totalUsers: 0,
  totalSpecialists: 0,
  sessionsThisMonth: 0,
  avgSessionRating: 0,
  revenueMTD: 0,
  newApplications: 0,
};

export const mockAdminPlatformStats: AdminPlatformStats = {
  platformScore: 87,
  uptimePercent: 99.9,
  activeSessions: 12,
  errorRate: 0.02,
  revenueToday: 4280,
  revenueDeltaPercent: 18,
  revenueSparkline: [3200, 3500, 3800, 3600, 4000, 4200, 4280],
  liveUsers: 48,
  liveSessions: 12,
  specialistsOnline: 22,
  totalUsers: 1240,
  totalSpecialists: 84,
  sessionsThisMonth: 892,
  avgSessionRating: 4.7,
  revenueMTD: 98420,
  newApplications: 5,
};

export const emptyApplications: SpecialistApplication[] = [];
export const emptyAdminSessions: AdminSessionRow[] = [];
export const emptySpecialistRoster: SpecialistRosterEntry[] = [];
export const emptyActivityLog: ActivityLogEntry[] = [];

export const mockApplications: SpecialistApplication[] = [
  { id: 'a1', name: 'Elena Vasquez', email: 'elena@example.com', specialty: specialistType('THERAPIST'), appliedAt: '2024-03-12T10:00:00Z', status: 'PENDING' },
  { id: 'a2', name: 'David Park', email: 'david@example.com', specialty: specialistType('LIFE_COACH'), appliedAt: '2024-03-11T14:30:00Z', status: 'REVIEWING' },
  { id: 'a3', name: 'Priya Sharma', email: 'priya@example.com', specialty: specialistType('HYPNOTHERAPIST'), appliedAt: '2024-03-10T09:15:00Z', status: 'PENDING' },
];

export const mockAdminSessions: AdminSessionRow[] = [
  { id: 's1', userName: 'Alex R.', specialistName: 'Dr. Sarah Chen', specialty: specialistType('THERAPIST'), durationMinutes: 50, rating: 5, status: 'COMPLETED' },
  { id: 's2', userName: 'Jordan K.', specialistName: 'Maya Foster', specialty: specialistType('HYPNOTHERAPIST'), durationMinutes: 60, rating: 5, status: 'COMPLETED' },
  { id: 's3', userName: 'Sam T.', specialistName: 'James Miller', specialty: specialistType('LIFE_COACH'), durationMinutes: 45, rating: 4, status: 'IN_PROGRESS' },
];

export const mockSpecialistRoster: SpecialistRosterEntry[] = [
  { id: 'sp1', name: 'Dr. Sarah Chen', specialty: specialistType('THERAPIST'), active: true, sessionCount: 124, rating: 4.9 },
  { id: 'sp2', name: 'James Miller', specialty: specialistType('LIFE_COACH'), active: true, sessionCount: 89, rating: 4.8 },
  { id: 'sp3', name: 'Maya Foster', specialty: specialistType('HYPNOTHERAPIST'), active: true, sessionCount: 67, rating: 5.0 },
  { id: 'sp4', name: 'Leo Torres', specialty: specialistType('MUSIC_TUTOR'), active: false, sessionCount: 42, rating: 4.7 },
];

export const mockActivityLog: ActivityLogEntry[] = [
  { id: 'l1', type: 'user_signup', message: 'New user signed up: alex@example.com', timestamp: '2 min ago' },
  { id: 'l2', type: 'session_completed', message: 'Session completed — Alex R. & Dr. Sarah Chen', timestamp: '12 min ago' },
  { id: 'l3', type: 'application_submitted', message: 'New specialist application: Elena Vasquez (Therapist)', timestamp: '1 hour ago' },
  { id: 'l4', type: 'payment_received', message: 'Payment received: £120.00', timestamp: '2 hours ago' },
];

export const mockSessionsDailyChart = Array.from({ length: 30 }, (_, i) => 15 + Math.floor(Math.random() * 40));

export const mockUserGrowthChart = [120, 145, 168, 190, 210, 245, 280, 310, 340, 380, 420, 460, 510, 560, 620, 680, 740, 820, 900, 980, 1060, 1120, 1180, 1240];

/** Empty therapist dashboard when API fails or no data yet */
export const emptyTherapistDashboard = (role: SpecialistType, specialist?: { id: string; name: string; email: string; role?: SpecialistType }): TherapistDashboardData => ({
  specialist: specialist ? { ...specialist, role: specialist.role ?? role } : { id: '', name: '', email: '', role },
  practiceScore: 0,
  todayStats: { sessionsToday: 0, hoursBooked: 0, newRequests: 0, completionRate: 0 },
  earningsThisMonth: 0,
  earningsDeltaPercent: 0,
  earningsSparkline: [],
  stats: { activeClients: 0, sessionsThisWeek: 0, avgRating: 0, completionRate: 0, responseTimeMinutes: 0 },
  todaySchedule: [],
  clients: [],
  recentNotes: [],
  pendingRequests: [],
  clientMilestones: [],
  reviews: [],
  earningsBreakdown: { sessionsCount: 0, rate: 0, pendingPayout: 0, paidOut: 0 },
});

export const mockTherapistDashboard = (role: 'LIFE_COACH' | 'HYPNOTHERAPIST' | 'THERAPIST' | 'MUSIC_TUTOR'): TherapistDashboardData => {
  const name = role === 'THERAPIST' ? 'Dr. Sarah Chen' : role === 'LIFE_COACH' ? 'James Miller' : role === 'HYPNOTHERAPIST' ? 'Maya Foster' : 'Leo Torres';
  return {
    specialist: { id: 'sp1', name, email: 'specialist@btb.fit', role },
    practiceScore: 96,
    todayStats: { sessionsToday: 5, hoursBooked: 4.5, newRequests: 2, completionRate: 94 },
    earningsThisMonth: 3240,
    earningsDeltaPercent: 12,
    earningsSparkline: [2800, 2900, 3000, 3100, 3050, 3180, 3240],
    stats: { activeClients: 28, sessionsThisWeek: 22, avgRating: 4.8, completionRate: 94, responseTimeMinutes: 45 },
    todaySchedule: [
      { id: 't1', clientName: 'Alex R.', specialistName: name, specialistType: role, type: '1:1', time: '10:00 AM', durationMinutes: 50, status: 'COMPLETED' },
      { id: 't2', clientName: 'Jordan K.', specialistName: name, specialistType: role, type: 'Session', time: '11:00 AM', durationMinutes: 60, status: 'IN_PROGRESS' },
      { id: 't3', clientName: 'Sam T.', specialistName: name, specialistType: role, type: 'Coaching', time: '2:00 PM', durationMinutes: 45, status: 'UPCOMING' },
    ],
    clients: [
      { id: 'c1', name: 'Alex Rivera', sessionCount: 12, lastSessionDate: '2024-03-13', progressScore: 72, metricLabel: 'Mood trend', metricValue: '↑ Improving' },
      { id: 'c2', name: 'Jordan Kim', sessionCount: 8, lastSessionDate: '2024-03-12', progressScore: 65, metricLabel: 'Goal completion', metricValue: '78%' },
      { id: 'c3', name: 'Sam Taylor', sessionCount: 5, lastSessionDate: '2024-03-10', progressScore: 58, metricLabel: 'Practice streak', metricValue: '14 days' },
    ],
    recentNotes: [
      { id: 'n1', clientName: 'Alex R.', date: '2024-03-13', preview: 'Client reported reduced anxiety after practicing grounding techniques. Will continue...', tags: ['#anxiety', '#breakthrough'], isPrivate: true },
      { id: 'n2', clientName: 'Jordan K.', date: '2024-03-12', preview: 'Deep trance achieved. Client explored root cause of sleep issue. Follow-up in 1 week.', tags: ['#hypnosis', '#sleep'], isPrivate: true },
    ],
    pendingRequests: [
      { id: 'r1', clientName: 'Morgan L.', requestedAt: '1 hour ago', proposedTime: 'Fri 3:00 PM', sessionType: '1:1 Therapy' },
      { id: 'r2', clientName: 'Casey W.', requestedAt: '3 hours ago', proposedTime: 'Mon 11:00 AM', sessionType: 'Initial Consult' },
    ],
    clientMilestones: [
      { clientName: 'Sarah', achievement: 'Completed 10 sessions', date: 'Today' },
      { clientName: 'James', achievement: '30-day streak', date: 'Yesterday' },
    ],
    reviews: [
      { id: 'rv1', clientName: 'Alex R.', date: 'Mar 10', rating: 5, excerpt: 'Sarah creates such a safe space. I\'ve made more progress in 3 months than years on my own.' },
      { id: 'rv2', clientName: 'Jordan K.', date: 'Mar 8', rating: 5, excerpt: 'Life-changing sessions. Grateful for this platform.' },
    ],
    earningsBreakdown: { sessionsCount: 42, rate: 75, pendingPayout: 480, paidOut: 2760 },
  };
};

export const mockAvailabilitySlots: ScheduleSlot[] = [
  { day: 'Mon', slots: [8,9,10,11,14,15,16].map(h => ({ hour: h, status: (h === 10 ? 'booked' : h === 14 ? 'blocked' : 'open') as 'open' | 'booked' | 'blocked' })) },
  { day: 'Tue', slots: [9,10,11,15,16].map(h => ({ hour: h, status: 'open' as const })) },
  { day: 'Wed', slots: [8,9,10,11,14,15].map(h => ({ hour: h, status: (h === 9 || h === 15 ? 'booked' : 'open') as 'open' | 'booked' | 'blocked' })) },
];
