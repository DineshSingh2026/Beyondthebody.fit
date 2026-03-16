'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import styles from './page.module.css';

interface BrainTip {
  title: string;
  description: string;
  category: string;
  icon: string;
}

const categoryColors: Record<string, string> = {
  'Anxiety Relief':    '#60a5fa',
  'Grounding':         '#4ade80',
  'Mental Clarity':    '#d4af37',
  'Stress Relief':     '#f87171',
  'Mindfulness':       '#a78bfa',
  'Emotional Health':  '#fb923c',
};

function categoryColor(cat: string) {
  return categoryColors[cat] ?? '#9ca89e';
}

export default function TipsPage() {
  const [tips, setTips] = useState<BrainTip[]>([]);
  const [loading, setLoading] = useState(true);
  const [practiced, setPracticed] = useState<Set<string>>(new Set());
  const [userId, setUserId] = useState<string | null>(null);
  const [scoreFlash, setScoreFlash] = useState<number | null>(null);

  useEffect(() => {
    api.getMe().then((me) => setUserId(me.id)).catch(() => {});
    api.getBrainTips()
      .then((data) => { setTips(Array.isArray(data) ? data : []); })
      .catch(() => {
        setTips([
          { title: 'Box Breathing',         description: 'Inhale 4s → Hold 4s → Exhale 4s → Hold 4s. Repeat for instant calm.',                   category: 'Anxiety Relief',   icon: '🫁' },
          { title: '5-4-3-2-1 Grounding',   description: 'Name 5 things you see, 4 you can touch, 3 you hear, 2 you smell, 1 you taste.',         category: 'Grounding',        icon: '🌿' },
          { title: 'Cognitive Reframing',    description: 'Ask: Is this thought 100% true? What would I tell a friend in this situation?',          category: 'Mental Clarity',   icon: '🧠' },
          { title: 'Progressive Relaxation', description: 'Tense each muscle group for 5 seconds, then release. Start from your toes.',            category: 'Stress Relief',    icon: '💪' },
          { title: 'Body Scan Meditation',   description: 'Close your eyes and scan from head to toe, releasing tension you find.',                 category: 'Mindfulness',      icon: '✨' },
          { title: 'Journaling Reset',       description: 'Write 3 feelings, 3 gratitudes, 1 intention. Takes 5 minutes, shifts everything.',      category: 'Emotional Health', icon: '📝' },
        ]);
      })
      .finally(() => setLoading(false));
  }, []);

  const togglePracticed = async (title: string) => {
    const alreadyDone = practiced.has(title);
    // Optimistic UI update
    setPracticed((prev) => {
      const next = new Set(prev);
      if (alreadyDone) next.delete(title); else next.add(title);
      return next;
    });
    // If marking as practiced (not un-marking), call backend to increment & recalculate score
    if (!alreadyDone && userId) {
      try {
        const result = await api.practiceBrainTip(userId);
        if (result.healingScore !== undefined) {
          setScoreFlash(result.healingScore);
          setTimeout(() => setScoreFlash(null), 3000);
        }
      } catch {
        // fail silently — UI already updated
      }
    }
  };

  return (
    <div className={styles.page}>
      {scoreFlash !== null && (
        <div className={styles.scoreToast}>
          🌱 Healing score updated — <strong>{scoreFlash}</strong>/100
        </div>
      )}
      <div className={styles.header}>
        <h1 className={styles.title}>✨ Brain Tips</h1>
        <p className={styles.subtitle}>
          Evidence-based techniques to calm your mind and lift your mood.
          {practiced.size > 0 && (
            <span className={styles.practicedCount}> {practiced.size} practiced today</span>
          )}
        </p>
      </div>

      {loading ? (
        <div className={styles.loadWrap}>
          <div className={styles.spinner} />
        </div>
      ) : (
        <div className={styles.grid}>
          {tips.map((tip) => {
            const done = practiced.has(tip.title);
            const color = categoryColor(tip.category);
            return (
              <div
                key={tip.title}
                className={`${styles.card} ${done ? styles.done : ''}`}
                style={{ '--tip-color': color } as React.CSSProperties}
              >
                <div className={styles.cardTop}>
                  <span className={styles.icon}>{tip.icon}</span>
                  <span className={styles.category} style={{ color }}>
                    {tip.category}
                  </span>
                </div>
                <h3 className={styles.tipTitle}>{tip.title}</h3>
                <p className={styles.desc}>{tip.description}</p>
                <button
                  type="button"
                  className={`${styles.practiceBtn} ${done ? styles.practiceBtnDone : ''}`}
                  onClick={() => togglePracticed(tip.title)}
                >
                  {done ? '✓ Practiced' : 'Mark as Practiced'}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
