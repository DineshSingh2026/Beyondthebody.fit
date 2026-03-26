'use client';

import { useState } from 'react';
import { postSpecialistApplication } from '@/lib/api';

const SPECIALTIES = [
  'Licensed Therapist', 'Physiotherapist', 'Rehab Therapist', 'Mobility Specialist',
  'Trauma Specialist', 'Group Facilitator', 'Specialized Expert', 'Life Coach',
  'Hypnotherapist', 'Music Tutor',
];

const SPECIALIZATION_OPTIONS = [
  'Back Pain', 'Sports Injury', 'Posture Correction', 'Rehabilitation',
  'Mobility Improvement', 'Anxiety & Stress', 'Depression', 'Trauma & PTSD',
  'Relationship Counseling', 'Addiction Recovery', 'Grief & Loss',
  'Sleep Disorders', 'Eating Disorders', 'Family Therapy', 'Career Coaching',
];

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const DAY_FULL = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

interface ServiceRow { name: string; duration: string; price: string; type: string; }

const badges = ['✓ RCI Compliant', '✓ BACP Standards', '✓ Ethically Governed', '✓ Teletherapy Certified'];

export default function JoinSection() {
  const [step, setStep] = useState(1);
  const [response, setResponse] = useState<{ success?: boolean; message?: string } | null>(null);
  const [loading, setLoading] = useState(false);

  // Step 1 – Basic
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [professionalTitle, setProfessionalTitle] = useState('');
  const [yearsExperience, setYearsExperience] = useState('');
  const [location, setLocation] = useState('');

  // Step 2 – Credentials
  const [qualification, setQualification] = useState('');
  const [certifications, setCertifications] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [profilePhotoUrl, setProfilePhotoUrl] = useState('');
  const [introVideoUrl, setIntroVideoUrl] = useState('');
  const [certDocsUrl, setCertDocsUrl] = useState('');

  // Step 3 – Specializations + Services
  const [specializations, setSpecializations] = useState<string[]>([]);
  const [services, setServices] = useState<ServiceRow[]>([{ name: '', duration: '50', price: '', type: 'Online' }]);

  // Step 4 – Availability + Bio + Social
  const [availableDays, setAvailableDays] = useState<string[]>([]);
  const [availableTimes, setAvailableTimes] = useState('');
  const [bio, setBio] = useState('');
  const [clientReviews, setClientReviews] = useState('');
  const [successStories, setSuccessStories] = useState('');
  const [message, setMessage] = useState('');

  const toggleSpec = (s: string) =>
    setSpecializations((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]);

  const toggleDay = (full: string) =>
    setAvailableDays((prev) => prev.includes(full) ? prev.filter((x) => x !== full) : [...prev, full]);

  const updateSvc = (i: number, field: keyof ServiceRow, val: string) =>
    setServices((prev) => prev.map((s, idx) => idx === i ? { ...s, [field]: val } : s));

  const nextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 4) setStep((s) => s + 1);
    else handleSubmit();
  };

  const handleSubmit = async () => {
    if (!name || !email || !specialty) {
      setResponse({ success: false, message: 'Name, email and specialty are required.' });
      return;
    }
    setLoading(true);
    try {
      const json = await postSpecialistApplication({
        name, email, specialty, message,
        professionalTitle, yearsExperience: yearsExperience ? Number(yearsExperience) : undefined, location,
        qualification, certifications, licenseNumber,
        profilePhotoUrl, introVideoUrl, certDocsUrl,
        specializations,
        services: services.filter((s) => s.name.trim()),
        availableDays, availableTimes,
        bio, clientReviews, successStories,
      });
      setResponse(json);
    } catch (err) {
      setResponse({ success: false, message: err instanceof Error ? err.message : 'Something went wrong. Please try again.' });
    }
    setLoading(false);
  };

  if (response?.success) {
    return (
      <section className="join-section" id="team">
        <div className="join-bg"><div className="join-orb" /></div>
        <div className="container">
          <div className="join-success-state">
            <div className="join-success-icon">✓</div>
            <h2 className="section-title light">Application Received!</h2>
            <p className="join-desc">{response.message}</p>
            <div className="join-compliance-badges">
              {badges.map((b) => <span key={b} className="jcb-badge">{b}</span>)}
            </div>
          </div>
        </div>
      </section>
    );
  }

  const steps = ['Basic Info', 'Credentials', 'Specializations', 'Availability & Bio'];

  return (
    <section className="join-section" id="team">
      <div className="join-bg"><div className="join-orb" /></div>
      <div className="container">
        <div className="join-inner">
          <div className="join-content">
            <div className="section-tag light">We&apos;re Hiring</div>
            <h2 className="section-title light">Join our revolution</h2>
            <p className="join-desc">
              We&apos;re building something extraordinary. Join a mental wellness platform that
              believes transformation goes beyond the body.
            </p>
            <div className="join-compliance-badges">
              {badges.map((b) => <span key={b} className="jcb-badge">{b}</span>)}
            </div>
          </div>

          <div className="join-form-card join-form-card--wide">
            <h3>Practitioner Application</h3>
            <div className="join-privacy-note">
              <span>🔒</span>
              <span>Your application is confidential. We follow strict teletherapy and data privacy guidelines aligned with GDPR.</span>
            </div>

            {/* Step progress indicator */}
            <div className="join-steps">
              {steps.map((s, i) => (
                <div key={s} className={`join-step ${step > i + 1 ? 'done' : ''} ${step === i + 1 ? 'active' : ''}`}>
                  <span className="join-step-num">{step > i + 1 ? '✓' : i + 1}</span>
                  <span className="join-step-label">{s}</span>
                </div>
              ))}
            </div>

            {response && !response.success && (
              <div className="form-response error">{response.message}</div>
            )}

            <form className="form" onSubmit={nextStep}>
              {/* ── Step 1: Basic Info ── */}
              {step === 1 && (
                <div className="join-step-panel">
                  <div className="form-row-2">
                    <div className="form-group">
                      <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Full Name *" required className="form-input" />
                    </div>
                    <div className="form-group">
                      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email Address *" required className="form-input" />
                    </div>
                  </div>
                  <div className="form-row-2">
                    <div className="form-group">
                      <select value={specialty} onChange={(e) => setSpecialty(e.target.value)} required className="form-input">
                        <option value="">Select your specialty *</option>
                        {SPECIALTIES.map((s) => <option key={s}>{s}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <input type="text" value={professionalTitle} onChange={(e) => setProfessionalTitle(e.target.value)} placeholder="Professional Title (e.g. Physiotherapist)" className="form-input" />
                    </div>
                  </div>
                  <div className="form-row-2">
                    <div className="form-group">
                      <input type="number" min="0" max="50" value={yearsExperience} onChange={(e) => setYearsExperience(e.target.value)} placeholder="Years of Experience" className="form-input" />
                    </div>
                    <div className="form-group">
                      <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Location (City / Online)" className="form-input" />
                    </div>
                  </div>
                </div>
              )}

              {/* ── Step 2: Credentials & Media ── */}
              {step === 2 && (
                <div className="join-step-panel">
                  <div className="form-row-2">
                    <div className="form-group">
                      <input type="text" value={qualification} onChange={(e) => setQualification(e.target.value)} placeholder="Qualification / Degree (e.g. MSc Psychology)" className="form-input" />
                    </div>
                    <div className="form-group">
                      <input type="text" value={licenseNumber} onChange={(e) => setLicenseNumber(e.target.value)} placeholder="License / Registration Number" className="form-input" />
                    </div>
                  </div>
                  <div className="form-group">
                    <textarea value={certifications} onChange={(e) => setCertifications(e.target.value)} placeholder="Certifications (one per line)" rows={3} className="form-input" />
                  </div>
                  <div className="form-group">
                    <input type="url" value={profilePhotoUrl} onChange={(e) => setProfilePhotoUrl(e.target.value)} placeholder="Profile Photo URL (https://...)" className="form-input" />
                  </div>
                  <div className="form-row-2">
                    <div className="form-group">
                      <input type="url" value={introVideoUrl} onChange={(e) => setIntroVideoUrl(e.target.value)} placeholder="Intro Video URL (Optional)" className="form-input" />
                    </div>
                    <div className="form-group">
                      <input type="url" value={certDocsUrl} onChange={(e) => setCertDocsUrl(e.target.value)} placeholder="Certification Docs URL (Optional)" className="form-input" />
                    </div>
                  </div>
                </div>
              )}

              {/* ── Step 3: Specializations & Services ── */}
              {step === 3 && (
                <div className="join-step-panel">
                  <p className="join-field-label">Select your specializations:</p>
                  <div className="join-spec-grid">
                    {SPECIALIZATION_OPTIONS.map((s) => (
                      <label key={s} className={`join-spec-chip ${specializations.includes(s) ? 'active' : ''}`}>
                        <input type="checkbox" checked={specializations.includes(s)} onChange={() => toggleSpec(s)} style={{ display: 'none' }} />
                        {s}
                      </label>
                    ))}
                  </div>

                  <p className="join-field-label" style={{ marginTop: 18 }}>Services offered:</p>
                  {services.map((svc, i) => (
                    <div key={i} className="join-service-row">
                      <input type="text" value={svc.name} onChange={(e) => updateSvc(i, 'name', e.target.value)} placeholder="Service name" className="form-input join-svc-name" />
                      <input type="text" value={svc.duration} onChange={(e) => updateSvc(i, 'duration', e.target.value)} placeholder="Duration (min)" className="form-input join-svc-sm" />
                      <input type="text" value={svc.price} onChange={(e) => updateSvc(i, 'price', e.target.value)} placeholder="Price (£)" className="form-input join-svc-sm" />
                      <select value={svc.type} onChange={(e) => updateSvc(i, 'type', e.target.value)} className="form-input join-svc-sm">
                        <option>Online</option>
                        <option>In-Person</option>
                        <option>Both</option>
                      </select>
                      {services.length > 1 && (
                        <button type="button" className="join-remove-btn" onClick={() => setServices((p) => p.filter((_, idx) => idx !== i))}>✕</button>
                      )}
                    </div>
                  ))}
                  <button type="button" className="join-add-btn" onClick={() => setServices((p) => [...p, { name: '', duration: '50', price: '', type: 'Online' }])}>
                    + Add Service
                  </button>
                </div>
              )}

              {/* ── Step 4: Availability, Bio, Social Proof ── */}
              {step === 4 && (
                <div className="join-step-panel">
                  <p className="join-field-label">Available Days:</p>
                  <div className="join-days">
                    {DAYS.map((d, i) => (
                      <label key={d} className={`join-day-chip ${availableDays.includes(DAY_FULL[i]) ? 'active' : ''}`}>
                        <input type="checkbox" checked={availableDays.includes(DAY_FULL[i])} onChange={() => toggleDay(DAY_FULL[i])} style={{ display: 'none' }} />
                        {d}
                      </label>
                    ))}
                  </div>
                  <div className="form-group" style={{ marginTop: 12 }}>
                    <input type="text" value={availableTimes} onChange={(e) => setAvailableTimes(e.target.value)} placeholder="Available Time Slots (e.g. 9am–12pm, 2pm–6pm)" className="form-input" />
                  </div>
                  <div className="form-group">
                    <textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Short Bio (3–4 lines about yourself, your approach and what you help clients with)" rows={4} className="form-input" />
                  </div>
                  <div className="form-group">
                    <textarea value={clientReviews} onChange={(e) => setClientReviews(e.target.value)} placeholder="Client Reviews (Optional)" rows={2} className="form-input" />
                  </div>
                  <div className="form-group">
                    <textarea value={successStories} onChange={(e) => setSuccessStories(e.target.value)} placeholder="Success Stories (Optional)" rows={2} className="form-input" />
                  </div>
                  <div className="form-group">
                    <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Anything else you'd like to tell us?" rows={2} className="form-input" />
                  </div>
                </div>
              )}

              <div className="join-form-nav">
                {step > 1 && (
                  <button type="button" className="join-back-btn" onClick={() => setStep((s) => s - 1)}>← Back</button>
                )}
                <button type="submit" className="btn btn-primary join-next-btn" disabled={loading}>
                  <span>{loading ? 'Sending…' : step < 4 ? 'Next →' : 'Submit Application'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
