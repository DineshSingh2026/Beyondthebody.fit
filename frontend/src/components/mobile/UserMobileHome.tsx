'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { emptyUserDashboard } from '@/lib/mock-data';
import { api } from '@/lib/api';
import type { UserDashboardData, UserRole } from '@/lib/dashboard-types';
import MiniHealingRing from './MiniHealingRing';
import MobileCard from './MobileCard';
import HapticButton from './HapticButton';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import WellnessScore from '@/components/dashboard/WellnessScore';
import SessionRecap from '@/components/dashboard/SessionRecap';
import HealingGoals from '@/components/dashboard/HealingGoals';
import MoodInsights from '@/components/dashboard/MoodInsights';
import BodyBankSync from '@/components/dashboard/BodyBankSync';
import styles from './UserMobileHome.module.css';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

export default function UserMobileHome({ userId, userName }: { userId: string; userName?: string }) {
  const [d, setD] = useState<UserDashboardData | null>(null);
  const [completingId, setCompletingId] = useState<string | null>(null);

  const refreshDashboard = () => {
    if (!userId) return;
    api.getUserDashboard(userId).then(setD).catch(() => {});
  };

  useEffect(() => {
    if (!userId) return;
    api.getUserDashboard(userId)
      .then(setD)
      .catch(() => {
        api.getMe().then((me) => setD(emptyUserDashboard({ ...me, role: me.role as UserRole }))).catch(() => {
          setD(emptyUserDashboard({ id: userId, name: userName ?? 'User', email: '', role: 'USER' }));
        });
      });
  }, [userId, userName]);

  const handleComplete = async (sessionId: string) => {
    setCompletingId(sessionId);
    try {
      await api.completeSession(sessionId);
      refreshDashboard();
    } finally {
      setCompletingId(null);
    }
  };
  if (!d) {
    return (
      <div className={styles.hero}>
        <p style={{ color: 'var(--muted)', textAlign: 'center', padding: 24 }}>Loading…</p>
      </div>
    );
  }
  const firstName = d.user.name.split(' ')[0] ?? 'there';
  const nextSession = d.upcomingSessions[0];
  const moodLast7 = d.moodLog.slice(-7);

  return (
    <div className="mobile-card-enter">
      <section className={styles.hero}>
        <h2 className={styles.greeting}>{getGreeting()}, {firstName}</h2>
        <p className={styles.sub}>Your healing awaits</p>
        <div className={styles.heroRow}>
          <MiniHealingRing score={d.healingScore.value} size={100} label={d.healingScore.label} />
        </div>
        <div className={styles.weekStrip}>Week 6 of your healing journey</div>
        <div className={styles.progressBar}>
          <div className={styles.progressFill} />
        </div>
      </section>

      {/* Phase 1: Wellness Score */}
      <section className={styles.section}>
        <WellnessScore />
      </section>

      {/* Phase 1: Session Recap (self-hides when empty) */}
      <SessionRecap />

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Next Session</h3>
        {nextSession ? (
          <MobileCard accent="gold">
            <span className={styles.timeChip}>{nextSession.date || 'Upcoming'}, {nextSession.time}</span>
            <div className={styles.specialistName}>{nextSession.specialistName}</div>
            <Badge variant={nextSession.specialistType === 'THERAPIST' ? 'green' : 'gold'}>
              {nextSession.type}
            </Badge>
            <div className={styles.ctaRow}>
              {nextSession.meetingLink ? (
                <a
                  href={nextSession.meetingLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.joinNowBtn}
                >
                  🎥 Join Now
                </a>
              ) : (
                <HapticButton variant="primary" pill>Join Session</HapticButton>
              )}
              {nextSession.status !== 'COMPLETED' && (
                <button
                  type="button"
                  className={styles.markCompleteBtn}
                  onClick={() => handleComplete(nextSession.id)}
                  disabled={completingId === nextSession.id}
                >
                  {completingId === nextSession.id ? '…' : '✓ Mark Complete'}
                </button>
              )}
            </div>
          </MobileCard>
        ) : (
          <div className={styles.noSession}>
            <p>No upcoming sessions</p>
            <Link href="/dashboard/user/sessions" className={styles.bookCta}>
              <HapticButton variant="primary" pill fullWidth>Book a Session</HapticButton>
            </Link>
          </div>
        )}
      </section>

      <section className={styles.affirmation}>
        &ldquo;{d.affirmation}&rdquo;
      </section>

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Quick Actions</h3>
        <div className={styles.quickGrid}>
          <Link href="/dashboard/user/sessions" className={styles.quickBtn}>
            <span className={styles.quickIcon}>📅</span>
            Book
          </Link>
          <Link href="/dashboard/user/mood" className={styles.quickBtn}>
            <span className={styles.quickIcon}>💚</span>
            Mood Log
          </Link>
          <Link href="/dashboard/user/tips" className={styles.quickBtn}>
            <span className={styles.quickIcon}>✨</span>
            Tips
          </Link>
        </div>
      </section>

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>7-Day Mood</h3>
        <div className={styles.moodRow}>
          {moodLast7.map((day, i) => (
            <div
              key={day.date}
              className={`${styles.moodDot} ${i === moodLast7.length - 1 ? styles.today : ''}`}
              title={day.date}
            >
              {day.value}
            </div>
          ))}
        </div>
        <p className={styles.moodTrend}>Your mood trend is improving ↑</p>
        {/* Phase 1: Mood Pattern Insights */}
        <MoodInsights />
      </section>

      {/* Phase 1: Body Bank Sync */}
      <section className={styles.section}>
        <BodyBankSync />
      </section>

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>My Specialists</h3>
        <div className={styles.specialistScroll}>
          {d.specialists.map((sp) => (
            <div key={sp.id} className={styles.specialistCard}>
              <Avatar name={sp.name} src={sp.avatarUrl ?? sp.avatar} size="md" />
              <span className={styles.specialistName}>{sp.name}</span>
              <Badge variant={sp.type === 'THERAPIST' ? 'green' : sp.type === 'LIFE_COACH' ? 'gold' : 'purple'}>
                {sp.type.replace('_', ' ')}
              </Badge>
              <span className={styles.rating}>★ {sp.rating}</span>
              <Link href={`/dashboard/user/messages?with=${sp.id}`}>
                <HapticButton variant="secondary" pill>Message</HapticButton>
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Phase 1: Healing Goals */}
      <section className={styles.section}>
        <HealingGoals />
      </section>

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Upcoming Sessions</h3>
        {d.upcomingSessions.length === 0 ? (
          <p className={styles.noSession}>No upcoming sessions</p>
        ) : (
          d.upcomingSessions.map((s) => (
            <div key={s.id} className={styles.sessionItem}>
              <Avatar name={s.specialistName} src={s.specialistAvatarUrl} size="sm" />
              <div className={styles.sessionMeta}>
                <div className={styles.specialistName}>{s.specialistName}</div>
                <div className={styles.sessionType}>{s.type}</div>
                <div className={styles.sessionTime}>{s.date ? `${s.date} · ` : ''}{s.time}</div>
              </div>
              <div className={styles.sessionActions}>
                {s.meetingLink && s.status !== 'COMPLETED' && (
                  <a
                    href={s.meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.joinNowBtn}
                  >
                    🎥 Join
                  </a>
                )}
                {s.status !== 'COMPLETED' && (
                  <button
                    type="button"
                    className={styles.markCompleteBtn}
                    onClick={() => handleComplete(s.id)}
                    disabled={completingId === s.id}
                  >
                    {completingId === s.id ? '…' : '✓'}
                  </button>
                )}
                {s.status === 'COMPLETED' && (
                  <span className={styles.completedBadge}>Done</span>
                )}
              </div>
            </div>
          ))
        )}
      </section>

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Community Feed</h3>
        {d.communityFeed.slice(0, 3).map((post) => (
          <div key={post.id} className={styles.feedItem}>
            <span className={styles.feedAuthor}>{post.authorName}</span>
            <p className={styles.feedContent}>{post.content}</p>
            <span className={styles.feedMeta}>{post.timestamp} · {post.likes} likes</span>
          </div>
        ))}
        <Link href="/dashboard/user/community">
          <button type="button" className={styles.seeAll}>See All</button>
        </Link>
      </section>

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Milestones</h3>
        <div className={styles.milestoneScroll}>
          {d.milestones.map((m) => (
            <div key={m.id} className={styles.milestoneCard}>
              <div className={styles.milestoneIcon}>{m.icon}</div>
              <div className={styles.milestoneTitle}>{m.title}</div>
              <div className={styles.milestoneDesc}>{m.description}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
