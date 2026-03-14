'use client';

import { useState } from 'react';
import { postContact } from '@/lib/api';

const roles = [
  { icon: '🟢', title: 'Licensed Therapists', desc: 'Anxiety, depression, relationship counseling' },
  { icon: '🔵', title: 'Specialized Experts', desc: 'Eating disorders, workplace stress, family therapy' },
  { icon: '🟣', title: 'Trauma Specialists', desc: 'PTSD, childhood trauma, crisis intervention' },
  { icon: '🟡', title: 'Group Facilitators', desc: 'Support circles, grief groups, addiction recovery' },
];

export default function JoinSection() {
  const [response, setResponse] = useState<{ success?: boolean; message?: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    try {
      const json = await postContact({
        name: fd.get('name') as string,
        email: fd.get('email') as string,
        message: fd.get('message') as string,
        service: fd.get('service') as string,
      });
      setResponse(json);
      if (json.success) (e.target as HTMLFormElement).reset();
    } catch {
      setResponse({ success: false, message: 'Something went wrong. Please try again.' });
    }
    setLoading(false);
    setTimeout(() => setResponse(null), 6000);
  };

  return (
    <section className="join-section" id="team">
      <div className="join-bg">
        <div className="join-orb" />
      </div>
      <div className="container">
        <div className="join-inner">
          <div className="join-content">
            <div className="section-tag light">We&apos;re Hiring</div>
            <h2 className="section-title light">Join our revolution</h2>
            <p className="join-desc">
              We&apos;re building something extraordinary. Mental wellness &amp; healing revolution
              starts here. We&apos;re looking for passionate professionals who believe
              transformation goes &apos;Beyond The Body&apos;.
            </p>
            <div className="join-roles">
              {roles.map((r) => (
                <div className="join-role" key={r.title}>
                  <span className="jr-icon">{r.icon}</span>
                  <div>
                    <h4>{r.title}</h4>
                    <p>{r.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="join-form-card">
            <h3>DM to get started</h3>
            <form id="joinForm" className="form" onSubmit={handleSubmit}>
              <div className="form-group">
                <input type="text" name="name" placeholder="Your name" required className="form-input" />
              </div>
              <div className="form-group">
                <input type="email" name="email" placeholder="Your email" required className="form-input" />
              </div>
              <div className="form-group">
                <select name="service" className="form-input">
                  <option value="">Select your specialty</option>
                  <option>Licensed Therapist</option>
                  <option>Trauma Specialist</option>
                  <option>Group Facilitator</option>
                  <option>Specialized Expert</option>
                </select>
              </div>
              <div className="form-group">
                <textarea
                  name="message"
                  placeholder="Tell us about your experience and why you want to join..."
                  rows={4}
                  className="form-input"
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary full-width" disabled={loading}>
                <span>{loading ? 'Sending...' : 'Send Application'}</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" />
                </svg>
              </button>
              {response && (
                <div className={`form-response ${response.success ? 'success' : 'error'}`}>
                  {response.message}
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
