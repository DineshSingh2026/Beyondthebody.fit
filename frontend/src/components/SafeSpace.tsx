'use client';

import { useState } from 'react';

const experts = [
  {
    name: 'Dr. Sarah Chen',
    role: 'Licensed Therapist',
    speciality: 'Anxiety, Trauma & PTSD',
    bio: 'Over 12 years helping clients rebuild confidence after trauma. CBT-certified and passionate about destigmatising mental health.',
    avatar: 'SC',
    color: '#5BB89A',
  },
  {
    name: 'James Miller',
    role: 'Life Coach',
    speciality: 'Burnout & Life Transitions',
    bio: 'Specialist in workplace stress and goal alignment. Helps professionals find clarity when everything feels overwhelming.',
    avatar: 'JM',
    color: '#C9A962',
  },
  {
    name: 'Maya Foster',
    role: 'Hypnotherapist',
    speciality: 'Habit & Behaviour Change',
    bio: 'Combines evidence-based hypnotherapy with mindfulness to help clients break patterns that hold them back.',
    avatar: 'MF',
    color: '#7B4FBE',
  },
];

export default function SafeSpace() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setTimeout(() => {
      setSubmitted(true);
      setLoading(false);
    }, 800);
  };

  return (
    <section className="safe-space" id="community">
      <div className="container">
        <div className="section-header">
          <div className="section-tag">Community</div>
          <h2 className="section-title">Join Our <em>Safe Space</em></h2>
          <p className="section-desc">
            A judgment-free community where healing is celebrated. Get weekly insights, live webinars,
            and personal guidance delivered straight to your inbox.
          </p>
        </div>

        <div className="safe-space-grid">
          <div className="safe-space-signup">
            <div className="ss-signup-card">
              <div className="ss-signup-icon">💌</div>
              <h3>Weekly Healing Insights</h3>
              <ul className="ss-benefits">
                <li>✓ Expert mental wellness tips every week</li>
                <li>✓ Live webinars with our specialists</li>
                <li>✓ Real stories from our community</li>
                <li>✓ Handling toxic relationships, family stress &amp; burnout</li>
              </ul>
              {submitted ? (
                <div className="ss-success">
                  <span>💚</span>
                  <p>You&apos;re in! Watch your inbox for your first insight.</p>
                </div>
              ) : (
                <form className="ss-form" onSubmit={handleSubmit}>
                  <input
                    type="email"
                    placeholder="Your email address"
                    className="ss-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Joining...' : 'Join the Safe Space'}
                  </button>
                </form>
              )}
              <p className="ss-note">No spam, ever. Unsubscribe anytime.</p>
            </div>
          </div>

          <div className="safe-space-experts">
            <h3 className="ss-experts-title">Meet Our Specialists</h3>
            <p className="ss-experts-sub">
              Rigorously vetted. Ethically committed. Here to guide you.
            </p>
            <div className="ss-expert-list">
              {experts.map((expert) => (
                <div key={expert.name} className="ss-expert-card">
                  <div className="ss-expert-avatar" style={{ background: `${expert.color}20`, color: expert.color }}>
                    {expert.avatar}
                  </div>
                  <div className="ss-expert-info">
                    <div className="ss-expert-header">
                      <strong>{expert.name}</strong>
                      <span className="ss-expert-role">{expert.role}</span>
                    </div>
                    <span className="ss-expert-speciality">{expert.speciality}</span>
                    <p className="ss-expert-bio">{expert.bio}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
