'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useIsMobile } from '@/hooks/useMediaQuery';
import { emptyUserDashboard } from '@/lib/mock-data';
import { api } from '@/lib/api';
import type { UserDashboardData, UserRole } from '@/lib/dashboard-types';
import UserMobileHome from '@/components/mobile/UserMobileHome';
import HealingScoreRing from '@/components/dashboard/HealingScoreRing';
import StatCard from '@/components/dashboard/StatCard';
import SessionCard from '@/components/dashboard/SessionCard';
import MiniChart from '@/components/dashboard/MiniChart';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import WellnessScore from '@/components/dashboard/WellnessScore';
import SessionRecap from '@/components/dashboard/SessionRecap';
import BodyBankSync from '@/components/dashboard/BodyBankSync';
import MoodInsights from '@/components/dashboard/MoodInsights';
import HealingGoals from '@/components/dashboard/HealingGoals';
import styles from './page.module.css';

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

const SPECIALIST_ROLES = ['THERAPIST', 'LIFE_COACH', 'HYPNOTHERAPIST', 'MUSIC_TUTOR'];

export default function UserDashboardPage() {
  const router = useRouter();
  const isMobile = useIsMobile();
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [data, setData] = useState<UserDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [completingId, setCompletingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      let me: { id: string; name: string; email: string; role: string } | null = null;
      try {
        me = await api.getMe();
        if (cancelled) return;
        if (me.role === 'ADMIN') { router.replace('/dashboard/admin'); return; }
        if (SPECIALIST_ROLES.includes(me.role)) { router.replace('/dashboard/therapist'); return; }
        setUserId(me.id);
        setUserName(me.name);
        const d = await api.getUserDashboard(me.id);
        if (!cancelled) setData(d);
      } catch {
        if (!cancelled && me) setData(emptyUserDashboard({ id: me.id, name: me.name, email: me.email, role: me.role as UserRole }));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [router]);

  if (isMobile) {
    if (loading && !userId) {
      return (
        <div className={styles.page}>
          <p style={{ color: 'var(--muted)', textAlign: 'center', padding: 24 }}>Loading…</p>
        </div>
      );
    }
    if (userId) return <UserMobileHome userId={userId} userName={userName ?? undefined} />;
    return null;
  }

  if (loading || !data) {
    return (
      <div className={styles.page}>
        <div className={styles.heroRow}><div className="dash-skeleton" style={{ height: 200 }} /></div>
        <div className={styles.statsRow}><div className="dash-skeleton" style={{ height: 100 }} /><div className="dash-skeleton" style={{ height: 100 }} /><div className="dash-skeleton" style={{ height: 100 }} /><div className="dash-skeleton" style={{ height: 100 }} /></div>
        <p style={{ color: 'var(--muted)', textAlign: 'center' }}>Loading your dashboard...</p>
      </div>
    );
  }
  const d = data;
  return (
    <motion.div
      className={styles.page}
      variants={container}
      initial="hidden"
      animate="show"
    >
      {/* Phase 1: Wellness Score — top of page */}
      <motion.div variants={item}>
        <WellnessScore />
      </motion.div>

      {/* Phase 1: Session Recap — below wellness score, self-hides if empty */}
      <SessionRecap />

      <div className={styles.heroRow}>
        <motion.div className={styles.heroCard} variants={item}>
          <div className={styles.heroCardLabel}>Healing Journey</div>
          <HealingScoreRing score={d.healingScore.value} size={140} label={d.healingScore.label} />
        </motion.div>
        <motion.div className={styles.heroCard} variants={item}>
          <div className={styles.heroCardLabel}>Today&apos;s Affirmation</div>
          <p className={styles.affirmation}>{d.affirmation}</p>
        </motion.div>
        <motion.div className={styles.heroCard} variants={item}>
          <div className={styles.heroCardLabel}>Brain Tip of the Day</div>
          <span className={styles.brainTipIcon}>{d.brainTip.icon}</span>
          <h3 className={styles.brainTipTitle}>{d.brainTip.title}</h3>
          <p className={styles.brainTipDesc}>{d.brainTip.description}</p>
        </motion.div>
      </div>
      <div className={styles.statsRow}>
        <StatCard label="Sessions Completed" value={d.stats.sessionsCompleted} index={0} />
        <StatCard label="Streak" value={`${d.stats.streak} days`} index={1} />
        <StatCard label="Mood Average" value={d.stats.moodAverage} index={2} />
        <StatCard label="Community Posts" value={d.stats.communityPosts} index={3} />
      </div>
      <div className={styles.grid}>
        <div className={styles.leftCol}>
          <motion.section className={styles.section} variants={item}>
            <h2 className={styles.sectionTitle}>Upcoming Sessions</h2>
            <div className={styles.sessionGrid}>
              {d.upcomingSessions.map((s) => (
                <SessionCard
                  key={s.id}
                  clientName={s.clientName}
                  specialistName={s.specialistName}
                  type={s.type}
                  time={s.time}
                  date={s.date}
                  duration={s.durationMinutes}
                  status={s.status}
                  meetingLink={s.meetingLink}
                  completing={completingId === s.id}
                  onComplete={async () => {
                    setCompletingId(s.id);
                    try {
                      await api.completeSession(s.id);
                      const d2 = await api.getUserDashboard(userId!);
                      setData(d2);
                    } finally {
                      setCompletingId(null);
                    }
                  }}
                />
              ))}
            </div>
          </motion.section>
          <motion.section className={styles.section} variants={item}>
            <h2 className={styles.sectionTitle}>My Specialists</h2>
            <div className={styles.specialistList}>
              {d.specialists.map((sp) => (
                <div key={sp.id} className={styles.specialistItem}>
                  <Avatar name={sp.name} size="md" />
                  <div>
                    <span className={styles.specialistName}>{sp.name}</span>
                    <Badge variant={sp.type === 'THERAPIST' ? 'green' : sp.type === 'LIFE_COACH' ? 'gold' : 'purple'}>{sp.type.replace('_', ' ')}</Badge>
                  </div>
                  <span className={styles.rating}>★ {sp.rating}</span>
                  <Link href={`/dashboard/user/messages?with=${sp.id}`} className={styles.specialistMessageBtn}>
                    Message
                  </Link>
                </div>
              ))}
            </div>
          </motion.section>

          {/* Phase 1: Healing Goals — below My Specialists */}
          <motion.section className={styles.section} variants={item}>
            <HealingGoals />
          </motion.section>

          <motion.section className={styles.section} variants={item}>
            <h2 className={styles.sectionTitle}>Weekly Mood Tracker</h2>
            <div className={styles.chartWrap}>
              <MiniChart data={d.moodLog.slice(-7).map((m) => m.value)} height={80} width={400} color="var(--green)" />
            </div>
            <div className={styles.moodLegend}>
              {d.moodLog.slice(-7).map((m) => (
                <span key={m.date}>{m.date.slice(5)}</span>
              ))}
            </div>
            {/* Phase 1: Mood Pattern Insights — after Weekly Mood Tracker */}
            <MoodInsights />
          </motion.section>
          <motion.section className={styles.section} variants={item}>
            <h2 className={styles.sectionTitle}>Journey Milestones</h2>
            <ul className={styles.milestoneList}>
              {d.milestones.map((m) => (
                <li key={m.id}>
                  <span className={styles.milestoneIcon}>{m.icon}</span>
                  <div>
                    <strong>{m.title}</strong>
                    <span className={styles.milestoneDesc}>{m.description}</span>
                  </div>
                </li>
              ))}
            </ul>
          </motion.section>
          <motion.section className={styles.section} variants={item}>
            <h2 className={styles.sectionTitle}>Community Feed</h2>
            {d.communityFeed.map((post) => (
              <div key={post.id} className={styles.feedItem}>
                <Avatar name={post.authorName} size="sm" />
                <div>
                  <span className={styles.feedAuthor}>{post.authorName}</span>
                  <p className={styles.feedContent}>{post.content}</p>
                  <span className={styles.feedMeta}>{post.timestamp} · {post.likes} likes</span>
                </div>
              </div>
            ))}
          </motion.section>
          <motion.section className={styles.section} variants={item}>
            <h2 className={styles.sectionTitle}>Daily Brain Tip</h2>
            <p className={styles.dailyTipTitle}>{d.dailyBrainTip.title}</p>
            <p className={styles.dailyTipDesc}>{d.dailyBrainTip.description}</p>
            <Badge variant="green">{d.dailyBrainTip.category}</Badge>
          </motion.section>
        </div>
        <aside className={styles.rightCol}>
          <motion.section className={styles.section} variants={item}>
            <h2 className={styles.sectionTitle}>Today&apos;s Schedule</h2>
            <ul className={styles.scheduleList}>
              {d.upcomingSessions.slice(0, 2).map((s) => (
                <li key={s.id}>
                  <span className={styles.scheduleTime}>{s.time}</span>
                  <span>{s.specialistName} — {s.type}</span>
                </li>
              ))}
            </ul>
          </motion.section>

          {/* Phase 1: Body Bank Sync Panel */}
          <motion.section className={styles.section} variants={item}>
            <BodyBankSync />
          </motion.section>

          <motion.section className={styles.section} variants={item}>
            <h2 className={styles.sectionTitle}>Wellness Toolkit</h2>
            <p className={styles.toolkitCopy}>Breathing exercises, journal prompts, and grounding techniques at your fingertips.</p>
          </motion.section>
          <motion.section className={styles.section} variants={item}>
            <h2 className={styles.sectionTitle}>Support Resources</h2>
            <p className={styles.toolkitCopy}>Crisis hotline, community guidelines, and how to get help.</p>
          </motion.section>
        </aside>
      </div>
    </motion.div>
  );
}
