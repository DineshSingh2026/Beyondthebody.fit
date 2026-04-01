'use client';

import { useEffect, useRef, useState } from 'react';

const PHASES = [
  { label: 'Inhale...', duration: 4000, className: 'inhale', step: 'inhale' },
  { label: 'Hold...', duration: 4000, className: 'hold-inhale', step: 'hold1' },
  { label: 'Exhale...', duration: 4000, className: 'exhale', step: 'exhale' },
  { label: 'Hold...', duration: 4000, className: 'hold-exhale', step: 'hold2' },
];

const moods = [
  { emoji: '😔', label: 'Struggling', value: 1 },
  { emoji: '😟', label: 'Low', value: 2 },
  { emoji: '😐', label: 'Okay', value: 3 },
  { emoji: '🙂', label: 'Good', value: 4 },
  { emoji: '😊', label: 'Thriving', value: 5 },
];

const moodRecommendations: Record<number, string> = {
  1: "It sounds like you're going through something heavy. A specialist can help — you don't have to carry this alone.",
  2: "Low days are valid. A quick 15-minute consult can help you understand what your mind needs right now.",
  3: "You're doing okay. Small consistent actions — therapy, journaling, community — build lasting wellbeing.",
  4: "You're in a good place. This is the perfect moment to invest in deeper healing and long-term resilience.",
  5: "Thriving! Share your journey with our community — your story could help someone else take their first step.",
};

export default function WelcomeGateway() {
  const SUPPRESS_KEY = 'btb_wg_suppress_until';
  const SUPPRESS_MS = 24 * 60 * 60 * 1000; // 24 hours
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [breathText, setBreathText] = useState('Get ready...');
  const [breathClass, setBreathClass] = useState('');
  const [breathActiveStep, setBreathActiveStep] = useState('');
  const [breathDone, setBreathDone] = useState(false);
  const [selectedMood, setSelectedMood] = useState<number | null>(null);

  const breathTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const breathActiveRef = useRef(false);

  // Trigger popup when About section starts entering view
  useEffect(() => {
    if (typeof window === 'undefined' || typeof IntersectionObserver === 'undefined') {
      return;
    }

    const suppressUntilRaw = window.localStorage.getItem(SUPPRESS_KEY);
    const suppressUntil = suppressUntilRaw ? Number(suppressUntilRaw) : 0;
    if (Number.isFinite(suppressUntil) && suppressUntil > Date.now()) {
      return;
    }

    const aboutSection = document.getElementById('about');
    if (!aboutSection) return;

    const observer = new IntersectionObserver((entries) => {
      const [entry] = entries;
      if (!entry?.isIntersecting) return;
      setTimeout(() => {
        setVisible(true);
      }, 700);
      observer.disconnect();
    }, { threshold: 0.2 });

    observer.observe(aboutSection);
    return () => observer.disconnect();
  }, []);

  // Fail-safe body scroll lock handling.
  useEffect(() => {
    if (!visible) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow || '';
    };
  }, [visible]);

  const runPhase = (phaseIndex: number, cycles: number) => {
    if (!breathActiveRef.current || cycles >= 4) {
      setBreathText('Well done 🌿');
      setBreathClass('');
      setBreathActiveStep('');
      setBreathDone(true);
      breathActiveRef.current = false;
      return;
    }
    const phase = PHASES[phaseIndex];
    setBreathText(phase.label);
    setBreathClass(phase.className);
    setBreathActiveStep(phase.step);
    breathTimerRef.current = setTimeout(() => {
      const next = (phaseIndex + 1) % PHASES.length;
      const nextCycles = next === 0 ? cycles + 1 : cycles;
      runPhase(next, nextCycles);
    }, phase.duration);
  };

  // Auto-start breathing when step 2 mounts
  useEffect(() => {
    if (step !== 2) return;
    breathActiveRef.current = true;
    setBreathDone(false);
    const countdown = setTimeout(() => runPhase(0, 0), 800);
    return () => {
      breathActiveRef.current = false;
      clearTimeout(countdown);
      if (breathTimerRef.current) clearTimeout(breathTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  const stopBreath = () => {
    breathActiveRef.current = false;
    if (breathTimerRef.current) clearTimeout(breathTimerRef.current);
  };

  const close = () => {
    stopBreath();
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(SUPPRESS_KEY, String(Date.now() + SUPPRESS_MS));
    }
    setVisible(false);
  };

  const skipToMood = () => {
    stopBreath();
    setStep(3);
  };

  if (!visible) return null;

  return (
    <div className="wg-overlay wg-visible" role="dialog" aria-modal="true" aria-label="Mindful Arrival">
      <div className="wg-backdrop" onClick={close} />
      <div className="wg-card">

        {/* Step progress bar */}
        <div className="wg-steps">
          {([1, 2, 3] as const).map((s) => (
            <div
              key={s}
              className={`wg-step-dot${step === s ? ' active' : step > s ? ' done' : ''}`}
            />
          ))}
        </div>

        {/* ── Step 1: Welcome ── */}
        {step === 1 && (
          <div className="wg-content">
            <span className="section-tag wg-tag">Mindful Arrival</span>
            <h2 className="wg-title">
              Centre Yourself<br />Before You Begin
            </h2>
            <p className="wg-desc">
              A mindful pause before your journey. Take 60 seconds — your mind will thank you.
            </p>
            <div className="wg-actions">
              <button className="btn btn-primary" onClick={() => setStep(2)}>
                Begin
              </button>
            </div>
            <button className="wg-skip" onClick={close}>
              Skip &amp; explore →
            </button>
          </div>
        )}

        {/* ── Step 2: Box Breathing ── */}
        {step === 2 && (
          <div className="wg-content">
            <span className="section-tag wg-tag">Box Breathing</span>
            <h2 className="wg-title-sm">Follow the rhythm</h2>
            <p className="wg-desc">
              Breathe in sync for 4 cycles. Let your nervous system settle before you explore.
            </p>
            <div className="wg-breathing">
              <div className={`breath-box${breathClass ? ` ${breathClass}` : ''}`}>
                <div className="breath-text">{breathText}</div>
                <div className="breath-progress" />
              </div>
              <div className="breath-steps">
                {(['inhale', 'hold1', 'exhale', 'hold2'] as const).map((phase, i) => (
                  <div
                    key={phase}
                    className={`bs${breathActiveStep === phase ? ' active' : ''}`}
                    data-phase={phase}
                  >
                    {['Inhale', 'Hold', 'Exhale', 'Hold'][i]}
                    <br />
                    <small>4s</small>
                  </div>
                ))}
              </div>
            </div>
            <button className="wg-skip" onClick={skipToMood}>
              Skip to mood check-in →
            </button>
            {breathDone && (
              <div className="wg-actions">
                <button className="btn btn-primary" onClick={() => setStep(3)}>
                  Continue to mood check-in
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── Step 3: Mood Check-In ── */}
        {step === 3 && (
          <div className="wg-content">
            <span className="section-tag wg-tag">Mood Check-In</span>
            <h2 className="wg-title-sm">
              How are you feeling <em>today?</em>
            </h2>
            <p className="wg-desc">
              A quick check-in. No sign-up needed. Just honest self-reflection.
            </p>
            <div className="mq-moods wg-moods">
              {moods.map((m) => (
                <button
                  key={m.value}
                  className={`mq-mood-btn${selectedMood === m.value ? ' selected' : ''}`}
                  onClick={() => setSelectedMood(m.value)}
                  type="button"
                >
                  <span className="mq-emoji">{m.emoji}</span>
                  <span className="mq-label">{m.label}</span>
                </button>
              ))}
            </div>

            {selectedMood !== null ? (
              <div className="mq-result wg-mood-result">
                <p className="mq-result-text">{moodRecommendations[selectedMood]}</p>
                <div className="wg-actions">
                  <a href="#contact" className="btn btn-primary" onClick={close}>
                    Book a Free Consult →
                  </a>
                  <button className="btn btn-ghost" onClick={close}>
                    Continue Exploring
                  </button>
                </div>
              </div>
            ) : (
              <button className="wg-skip" onClick={close}>
                Skip &amp; explore →
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
