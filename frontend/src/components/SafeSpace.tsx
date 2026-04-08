'use client';

import { useState } from 'react';

const experts = [
  {
    name: 'A. Meera I.',
    role: 'Licensed Clinical Psychologist',
    speciality: 'Anxiety, Trauma & Emotional Healing',
    bio: 'With over 11 years of clinical experience, Meera supports individuals dealing with anxiety, trauma, and emotional distress. Her approach combines CBT with mindfulness based techniques to help clients build resilience and regain inner balance.',
    photo: '/img/th1.png',
    color: '#5BB89A',
  },
  {
    name: 'R. Dev Mal',
    role: 'Life & Career Coach',
    speciality: 'Burnout, Career Growth & Life Transitions',
    bio: 'Dev works with professionals facing burnout and career uncertainty. His coaching focuses on clarity, goal alignment, and building sustainable routines that support both personal and professional growth.',
    photo: '/img/th2.png',
    color: '#C9A962',
  },
  {
    name: 'Noor Haddad',
    role: 'Clinical Hypnotherapist',
    speciality: 'Habit Change & Subconscious Repatterning',
    bio: 'Noor specializes in helping clients break deeply rooted habits through hypnotherapy and guided visualization. Her work integrates mindfulness with subconscious conditioning for long lasting behavioral change.',
    photo: '/img/th3.png',
    color: '#7B4FBE',
  },
  {
    name: 'Arjun S.',
    role: 'Mindfulness & Wellness Therapist',
    speciality: 'Stress Management & Emotional Resilience',
    bio: 'Arjun integrates mindfulness practices with modern therapeutic techniques to help clients manage stress and improve emotional well being. His style is calm, practical, and focused on long term transformation.',
    photo: '/img/th4.png',
    color: '#1ABFA0',
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
            Calm guidance, trusted specialists, and weekly support.
          </p>
        </div>

        <div className="safe-space-grid">
          <div className="safe-space-signup">
            <div className="ss-signup-card">
              <div className="ss-signup-icon">💌</div>
              <h3>Weekly Healing Insights</h3>
              <ul className="ss-benefits">
                <li>Expert tips from our clinical team</li>
                <li>Live sessions and practical tools</li>
                <li>Burnout, boundaries, and resilience support</li>
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
              Vetted experts. Compassionate care.
            </p>
            <div className="ss-expert-list">
              {experts.map((expert) => (
                <div key={expert.name} className="ss-expert-card">
                  <div
                    className="ss-expert-avatar ss-expert-avatar-photo"
                    style={{ borderColor: expert.color }}
                  >
                    <img src={expert.photo} alt={expert.name} width={52} height={52} loading="lazy" decoding="async" />
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
