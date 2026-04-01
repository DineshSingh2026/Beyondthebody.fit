'use client';

import { useEffect, useRef, useState } from 'react';

interface Props {
  affirmations: string[];
}

export default function Hero({ affirmations }: Props) {
  const [currentAff, setCurrentAff] = useState(0);
  const [affText, setAffText] = useState(affirmations[0] || '');
  const [affVisible, setAffVisible] = useState(true);
  const statsRef = useRef<HTMLDivElement>(null);
  const [counters, setCounters] = useState({ r94: 0, m40: 0, m15: 0 });
  const countersDone = useRef(false);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.pageYOffset - 80, behavior: 'smooth' });
  };

  const nextAff = () => {
    setAffVisible(false);
    setTimeout(() => {
      const next = (currentAff + 1) % affirmations.length;
      setCurrentAff(next);
      setAffText(affirmations[next]);
      setAffVisible(true);
    }, 300);
  };

  // Auto-rotate
  useEffect(() => {
    const t = setInterval(nextAff, 6000);
    return () => clearInterval(t);
  }, [currentAff, affirmations]);

  // Counter animation
  useEffect(() => {
    const el = statsRef.current;
    if (!el) return;
    if (typeof window === 'undefined' || typeof IntersectionObserver === 'undefined') {
      setCounters({ r94: 94, m40: 40, m15: 15 });
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !countersDone.current) {
          countersDone.current = true;
          animateCount(94, (v) => setCounters((c) => ({ ...c, r94: v })));
          animateCount(40, (v) => setCounters((c) => ({ ...c, m40: v })));
          animateCount(15, (v) => setCounters((c) => ({ ...c, m15: v })));
        }
      },
      { threshold: 0.5 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  function animateCount(target: number, set: (v: number) => void) {
    let current = 0;
    const step = target / (2000 / 16);
    const t = setInterval(() => {
      current += step;
      if (current >= target) { current = target; clearInterval(t); }
      set(Math.floor(current));
    }, 16);
  }

  return (
    <section className="hero" id="home">
      <div className="hero-bg">
        <div className="hero-orb hero-orb-1" />
        <div className="hero-orb hero-orb-2" />
        <div className="hero-orb hero-orb-3" />
        <div className="hero-grid" />
      </div>
      <div className="hero-content">
        <div className="hero-badge">
          <span className="badge-dot" />
          Mental Wellness Platform
        </div>
        <h1 className="hero-title">
          <span className="hero-title-top">Your safe space to</span>
          <span className="hero-title-main">
            <em>Heal</em> beyond
          </span>
          <span className="hero-title-sub">the body</span>
        </h1>
        <p className="hero-desc">
          Where mental wellness leads physical transformation. Evidence-based therapy, expert
          support, and a community that understands your journey.
        </p>
        <div className="hero-actions">
          <button className="btn btn-primary" onClick={() => scrollTo('contact')}>
            <span>Start Free Consult</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
          <button className="btn btn-ghost" onClick={() => scrollTo('about')}>
            <span>Discover More</span>
          </button>
        </div>
        <div className="hero-stats" ref={statsRef}>
          <div className="stat">
            <span className="stat-value">
              <span className="stat-num">{counters.r94}</span>
              <span className="stat-suffix">%</span>
            </span>
            <span className="stat-label">Recovery Rate</span>
          </div>
          <div className="stat-divider" />
          <div className="stat">
            <span className="stat-value">
              <span className="stat-num">{counters.m40}</span>
              <span className="stat-suffix">M+</span>
            </span>
            <span className="stat-label">People Helped Annually</span>
          </div>
          <div className="stat-divider" />
          <div className="stat">
            <span className="stat-value">
              <span className="stat-num">{counters.m15}</span>
              <span className="stat-suffix">min</span>
            </span>
            <span className="stat-label">Free Consultation</span>
          </div>
        </div>
      </div>

      <div className="hero-visual">
        <div className="affirmation-card" id="heroAffirmation">
          <div className="aff-header">
            <span className="aff-label">Daily Affirmation</span>
            <div className="aff-controls">
              <div className="aff-dot active" />
              <div className="aff-dot" />
              <div className="aff-dot" />
            </div>
          </div>
          <p
            className="aff-text"
            style={{
              opacity: affVisible ? 1 : 0,
              transform: affVisible ? 'translateY(0)' : 'translateY(10px)',
              transition: 'opacity 0.4s ease, transform 0.4s ease',
            }}
          >
            {affText}
          </p>
          <button className="aff-next" onClick={nextAff}>
            Next →
          </button>
        </div>
        <div className="hero-float-card card-brain">
          <span className="float-icon">🧠</span>
          <div>
            <strong>Brain Tips</strong>
            <small>60-second techniques</small>
          </div>
        </div>
        <div className="hero-float-card card-heart">
          <span className="float-icon">💚</span>
          <div>
            <strong>Therapy First</strong>
            <small>Mind leads body</small>
          </div>
        </div>
        <div className="hero-ring hero-ring-1" />
        <div className="hero-ring hero-ring-2" />
      </div>

      <div className="scroll-indicator">
        <div className="scroll-line" />
        <span>Scroll to explore</span>
      </div>
    </section>
  );
}
