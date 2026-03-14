'use client';

import { useState } from 'react';

const moods = [
  { emoji: '😔', label: 'Struggling', value: 1 },
  { emoji: '😟', label: 'Low', value: 2 },
  { emoji: '😐', label: 'Okay', value: 3 },
  { emoji: '🙂', label: 'Good', value: 4 },
  { emoji: '😊', label: 'Thriving', value: 5 },
];

const insights = [
  {
    title: 'Handling Toxic Relationships',
    category: 'Environmental Factor',
    icon: '🛡️',
    tip: 'Set clear boundaries early. Toxic dynamics drain your mental energy before you notice. Naming the pattern is the first step to protecting your peace.',
  },
  {
    title: 'Navigating Family Stress at Work',
    category: 'Life Balance',
    icon: '⚖️',
    tip: 'Compartmentalisation is a skill, not avoidance. Try a 5-minute "transition ritual" between home-mode and work-mode to protect both spaces.',
  },
  {
    title: 'Managing Burnout Before It Hits',
    category: 'Stress Management',
    icon: '🔋',
    tip: 'Burnout is not laziness — it\'s depletion. Track your energy like you track your time. Rest is productive when it restores capacity.',
  },
  {
    title: 'Breaking the Overthinking Loop',
    category: 'Cognitive Health',
    icon: '🧠',
    tip: 'When you catch yourself spiralling, name it: "I\'m overthinking." This tiny act shifts you from reaction to observation — a foundation of CBT.',
  },
  {
    title: 'Building Emotional Resilience',
    category: 'Mental Strength',
    icon: '🌱',
    tip: 'Resilience isn\'t about bouncing back fast — it\'s about building the capacity to process hard emotions without being overwhelmed by them.',
  },
];

const moodRecommendations: Record<number, string> = {
  1: 'It sounds like you\'re going through something heavy. A specialist can help — you don\'t have to carry this alone.',
  2: 'Low days are valid. A quick 15-minute consult can help you understand what your mind needs right now.',
  3: 'You\'re doing okay. Small consistent actions — therapy, journaling, community — build lasting wellbeing.',
  4: 'You\'re in a good place. This is the perfect moment to invest in deeper healing and long-term resilience.',
  5: 'Thriving! Share your journey with our community — your story could help someone else take their first step.',
};

export default function MoodQuiz() {
  const [selected, setSelected] = useState<number | null>(null);
  const [insightIndex] = useState(() => Math.floor(Math.random() * insights.length));
  const insight = insights[insightIndex];

  return (
    <section className="mood-quiz" id="tools">
      <div className="container">
        <div className="mood-quiz-grid">
          <div className="mq-left">
            <div className="section-tag">Tools</div>
            <h2 className="section-title">How are you feeling <em>today?</em></h2>
            <p className="section-desc">A quick check-in. No sign-up needed. Just honest self-reflection.</p>

            <div className="mq-moods">
              {moods.map((m) => (
                <button
                  key={m.value}
                  className={`mq-mood-btn${selected === m.value ? ' selected' : ''}`}
                  onClick={() => setSelected(m.value)}
                  type="button"
                >
                  <span className="mq-emoji">{m.emoji}</span>
                  <span className="mq-label">{m.label}</span>
                </button>
              ))}
            </div>

            {selected !== null && (
              <div className="mq-result">
                <p className="mq-result-text">{moodRecommendations[selected]}</p>
                <a href="#contact" className="btn btn-primary mq-cta">
                  Get Matched with a Specialist →
                </a>
              </div>
            )}
          </div>

          <div className="mq-right">
            <div className="mq-insight-card">
              <div className="mq-insight-header">
                <span className="mq-insight-icon">{insight.icon}</span>
                <div>
                  <span className="mq-insight-category">{insight.category}</span>
                  <h3 className="mq-insight-title">{insight.title}</h3>
                </div>
              </div>
              <p className="mq-insight-tip">{insight.tip}</p>
              <div className="mq-insight-footer">
                <span className="mq-insight-label">Daily Insight</span>
                <span className="mq-insight-dot">·</span>
                <span className="mq-insight-label">Based on evidence-based therapy</span>
              </div>
            </div>

            <div className="mq-stats-row">
              <div className="mq-stat">
                <span className="mq-stat-num">94%</span>
                <span className="mq-stat-label">of clients feel better after first session</span>
              </div>
              <div className="mq-stat">
                <span className="mq-stat-num">15 min</span>
                <span className="mq-stat-label">free consultation, no strings attached</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
