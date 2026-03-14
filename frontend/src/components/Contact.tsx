'use client';

import { useState } from 'react';
import { postConsultation } from '@/lib/api';

export default function Contact() {
  const [response, setResponse] = useState<{ success?: boolean; message?: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    try {
      const json = await postConsultation({
        name: fd.get('name') as string,
        email: fd.get('email') as string,
        phone: fd.get('phone') as string,
        concern: fd.get('concern') as string,
        message: fd.get('message') as string,
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
    <section className="contact-section" id="contact">
      <div className="container">
        <div className="section-header">
          <div className="section-tag">Start Today</div>
          <h2 className="section-title">
            Your healing journey begins with a <em>conversation</em>
          </h2>
          <p className="section-desc">
            Free 15-minute consultation. No commitment. Just compassionate guidance toward the right
            support for you.
          </p>
        </div>
        <div className="contact-grid">
          <div className="contact-info">
            <div className="ci-card">
              <span className="ci-icon">⭐</span>
              <h4>Free 15-min Consult</h4>
              <p>Get matched with the right specialist — no cost, no strings attached.</p>
            </div>
            <div className="ci-card">
              <span className="ci-icon">🔒</span>
              <h4>Your Trust is Sacred</h4>
              <p>We protect your information like our own. Total confidentiality guaranteed.</p>
            </div>
            <div className="ci-card">
              <span className="ci-icon">🌱</span>
              <h4>Begin Transformation</h4>
              <p>Therapy first → Mental clarity → Physical capability. Proven approach.</p>
            </div>
          </div>
          <div className="contact-form-card">
            <h3>Book Your Free Consultation</h3>
            <form id="consultForm" className="form" onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <input
                    type="text"
                    name="name"
                    placeholder="Your name *"
                    required
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <input
                    type="email"
                    name="email"
                    placeholder="Email address *"
                    required
                    className="form-input"
                  />
                </div>
              </div>
              <div className="form-group">
                <input
                  type="tel"
                  name="phone"
                  placeholder="Phone number (optional)"
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <select name="concern" className="form-input">
                  <option value="">What brings you here?</option>
                  <option>Anxiety &amp; Depression</option>
                  <option>Trauma &amp; PTSD</option>
                  <option>Stress &amp; Burnout</option>
                  <option>Relationship Issues</option>
                  <option>Eating Disorders</option>
                  <option>Grief &amp; Loss</option>
                  <option>Addiction Recovery</option>
                  <option>Other / Not Sure</option>
                </select>
              </div>
              <div className="form-group">
                <textarea
                  name="message"
                  placeholder="Tell us a little about what you're experiencing (optional)..."
                  rows={3}
                  className="form-input"
                />
              </div>
              <button type="submit" className="btn btn-primary full-width" disabled={loading}>
                <span>{loading ? 'Sending...' : 'Book Free Consultation'}</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
              {response && (
                <div className={`form-response ${response.success ? 'success' : 'error'}`}>
                  {response.message}
                </div>
              )}
              <p className="form-note">No spam, ever. We&apos;ll reach out within 24 hours.</p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
