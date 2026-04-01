'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { api } from '@/lib/api';
import styles from './page.module.css';

interface BrainTip {
  title: string;
  description: string;
  category: string;
  icon: string;
}

const categoryColors: Record<string, string> = {
  'Anxiety Relief':   '#60a5fa',
  'Grounding':        '#4ade80',
  'Mental Clarity':   '#d4af37',
  'Stress Relief':    '#f87171',
  'Mindfulness':      '#a78bfa',
  'Emotional Health': '#fb923c',
};
const categoryColor = (cat: string) => categoryColors[cat] ?? '#9ca89e';

const TODAY_KEY = `btb_tips_practiced_${new Date().toISOString().slice(0, 10)}`;
const loadPracticed = (): Set<string> => {
  if (typeof window === 'undefined') return new Set();
  try { const r = localStorage.getItem(TODAY_KEY); return r ? new Set(JSON.parse(r)) : new Set(); }
  catch { return new Set(); }
};
const savePracticed = (s: Set<string>) => {
  try { localStorage.setItem(TODAY_KEY, JSON.stringify(Array.from(s))); } catch { /* noop */ }
};

const PHASES = [
  { label: 'Inhale…',  step: 'inhale', cls: 'inhale', dur: 4000 },
  { label: 'Hold…',    step: 'hold1',  cls: 'hold-inhale', dur: 4000 },
  { label: 'Exhale…',  step: 'exhale', cls: 'exhale',  dur: 4000 },
  { label: 'Hold…',    step: 'hold2',  cls: 'hold-exhale', dur: 4000 },
];

export default function TipsPage() {
  const [tips, setTips]         = useState<BrainTip[]>([]);
  const [loading, setLoading]   = useState(true);
  const [practiced, setPracticed] = useState<Set<string>>(new Set());
  const [userId, setUserId]     = useState<string | null>(null);
  const [scoreFlash, setScoreFlash] = useState<number | null>(null);

  // Breathing
  const [breathOpen, setBreathOpen]       = useState(false);
  const [breathActive, setBreathActive]   = useState(false);
  const [breathText, setBreathText]       = useState('Press Start');
  const [breathPhaseClass, setBreathPhaseClass] = useState('');
  const [activeStep, setActiveStep]       = useState('');
  const breathRef     = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activeRef     = useRef(false);
  const breathSectRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setPracticed(loadPracticed()); }, []);

  useEffect(() => {
    api.getMe().then(m => setUserId(m.id)).catch(() => {});
    api.getBrainTips()
      .then(d => setTips(Array.isArray(d) ? d : []))
      .catch(() => setTips([
        { title: 'Box Breathing',         description: 'Inhale 4s → Hold 4s → Exhale 4s → Hold 4s. Repeat for instant calm.',             category: 'Anxiety Relief',   icon: '🫁' },
        { title: '5-4-3-2-1 Grounding',   description: 'Name 5 things you see, 4 you can touch, 3 you hear, 2 you smell, 1 you taste.',    category: 'Grounding',        icon: '🌿' },
        { title: 'Cognitive Reframing',    description: 'Ask: Is this thought 100% true? What would I tell a friend in this situation?',     category: 'Mental Clarity',   icon: '🧠' },
        { title: 'Progressive Relaxation', description: 'Tense each muscle group for 5 seconds, then release. Start from your toes.',       category: 'Stress Relief',    icon: '💪' },
        { title: 'Body Scan Meditation',   description: 'Close your eyes and scan from head to toe, releasing tension you find.',            category: 'Mindfulness',      icon: '✨' },
        { title: 'Journaling Reset',       description: 'Write 3 feelings, 3 gratitudes, 1 intention. Takes 5 minutes, shifts everything.', category: 'Emotional Health', icon: '📝' },
      ]))
      .finally(() => setLoading(false));
  }, []);

  const togglePracticed = async (title: string) => {
    const alreadyDone = practiced.has(title);
    setPracticed(prev => {
      const next = new Set(prev);
      if (alreadyDone) next.delete(title); else next.add(title);
      savePracticed(next);
      return next;
    });
    if (!alreadyDone && userId) {
      try {
        const result = await api.practiceBrainTip(userId);
        if (result.healingScore !== undefined) {
          setScoreFlash(result.healingScore);
          setTimeout(() => setScoreFlash(null), 3000);
        }
      } catch { /* silent */ }
    }
  };

  // ── Breathing exercise ───────────────────────────────────────
  const stopBreathing = () => {
    activeRef.current = false;
    if (breathRef.current) clearTimeout(breathRef.current);
    setBreathActive(false);
    setBreathText('Press Start');
    setBreathPhaseClass('');
    setActiveStep('');
  };

  const runPhase = (idx: number, cycles: number) => {
    if (!activeRef.current || cycles >= 4) {
      setBreathText('Well done! 🌿');
      setBreathPhaseClass('');
      setActiveStep('');
      setBreathActive(false);
      activeRef.current = false;
      return;
    }
    const p = PHASES[idx];
    setBreathText(p.label);
    setBreathPhaseClass(p.cls);
    setActiveStep(p.step);
    breathRef.current = setTimeout(() => {
      const next = (idx + 1) % PHASES.length;
      runPhase(next, next === 0 ? cycles + 1 : cycles);
    }, p.dur);
  };

  const toggleBreathing = () => {
    if (breathActive) { stopBreathing(); return; }
    activeRef.current = true;
    setBreathActive(true);
    runPhase(0, 0);
  };

  useEffect(() => () => { if (breathRef.current) clearTimeout(breathRef.current); }, []);

  const openBreathing = useCallback(() => {
    setBreathOpen(true);
    // Small delay so the section renders before we scroll to it
    setTimeout(() => {
      breathSectRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 60);
  }, []);

  const breathBtnLabel = breathActive
    ? 'Stop'
    : breathText === 'Well done! 🌿' ? 'Try Again' : 'Start Breathing';

  return (
    <div className={styles.page}>
      {scoreFlash !== null && (
        <div className={styles.scoreToast}>
          🌱 Healing score updated — <strong>{scoreFlash}</strong>/100
        </div>
      )}

      {/* ── Header ── */}
      <div className={styles.header}>
        <div className={styles.sectionTag}>Evidence-Based</div>
        <h1 className={styles.title}>✨ Brain Tips™</h1>
        <p className={styles.subtitle}>
          60-second techniques, expert-backed strategies. When you&apos;re overwhelmed, we&apos;ve got you.
          {practiced.size > 0 && (
            <span className={styles.practicedCount}> {practiced.size} practiced today</span>
          )}
        </p>
      </div>

      {/* ── Tips grid ── */}
      {loading ? (
        <div className={styles.loadWrap}><div className={styles.spinner} /></div>
      ) : (
        <div className={styles.grid}>
          {tips.map((tip) => {
            const done  = practiced.has(tip.title);
            const color = categoryColor(tip.category);
            return (
              <div
                key={tip.title}
                className={`${styles.card} ${done ? styles.done : ''}`}
                style={{ '--tip-color': color } as React.CSSProperties}
              >
                <div className={styles.cardTop}>
                  <span className={styles.icon}>{tip.icon}</span>
                  <span className={styles.category} style={{ color }}>{tip.category}</span>
                </div>
                <h3 className={styles.tipTitle}>{tip.title}</h3>
                <p className={styles.desc}>{tip.description}</p>
                <div className={styles.cardActions}>
                  <button
                    type="button"
                    className={`${styles.practiceBtn} ${done ? styles.practiceBtnDone : ''}`}
                    onClick={() => togglePracticed(tip.title)}
                  >
                    {done ? '✓ Practiced' : 'Mark as Practiced'}
                  </button>
                  {tip.title === 'Box Breathing' && (
                    <button
                      type="button"
                      className={styles.tryNowBtn}
                      onClick={openBreathing}
                    >
                      Try it Now →
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Breathing exercise — opens when user clicks "Try it Now" on Box Breathing ── */}
      {breathOpen && <div ref={breathSectRef} className={styles.breathSection}>
        <h2 className={styles.breathTitle}>Try it Now: Box Breathing</h2>
        <div className={styles.breathVisual}>
          {/* Animated circle */}
          <div className={`${styles.breathCircle} ${breathPhaseClass === 'inhale' ? styles.breathInhale : breathPhaseClass === 'exhale' ? styles.breathExhale : ''}`}>
            <span className={styles.breathText}>{breathText}</span>
            <div className={styles.breathGlow} />
          </div>

          {/* Phase indicators */}
          <div className={styles.breathSteps}>
            {(['inhale','hold1','exhale','hold2'] as const).map((step, i) => (
              <div
                key={step}
                className={`${styles.bs} ${activeStep === step ? styles.bsActive : ''}`}
              >
                {['Inhale','Hold','Exhale','Hold'][i]}
                <span className={styles.bsDur}>4s</span>
              </div>
            ))}
          </div>

          <button
            type="button"
            className={`${styles.breathBtn} ${breathActive ? styles.breathBtnStop : ''}`}
            onClick={toggleBreathing}
          >
            {breathBtnLabel}
          </button>
        </div>
      </div>}
    </div>
  );
}
