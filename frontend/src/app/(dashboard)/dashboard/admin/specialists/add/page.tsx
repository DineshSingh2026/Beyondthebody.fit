'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import PasswordInput from '@/components/ui/PasswordInput';
import styles from './page.module.css';

const ROLES = [
  { value: 'THERAPIST', label: 'Therapist' },
  { value: 'LIFE_COACH', label: 'Life Coach' },
  { value: 'HYPNOTHERAPIST', label: 'Hypnotherapist' },
  { value: 'MUSIC_TUTOR', label: 'Music Tutor' },
] as const;

const SPECIALIZATION_OPTIONS = [
  'Back Pain', 'Sports Injury', 'Posture Correction', 'Rehabilitation',
  'Mobility Improvement', 'Anxiety & Stress', 'Depression', 'Trauma & PTSD',
  'Relationship Counseling', 'Addiction Recovery', 'Grief & Loss',
  'Sleep Disorders', 'Eating Disorders', 'Family Therapy', 'Career Coaching',
];

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

interface Service { name: string; duration: string; price: string; type: string; }

export default function AddTherapistPage() {
  const router = useRouter();

  // Account
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('THERAPIST');

  // Basic Info
  const [professionalTitle, setProfessionalTitle] = useState('');
  const [yearsExperience, setYearsExperience] = useState('');
  const [location, setLocation] = useState('');

  // Credentials
  const [qualification, setQualification] = useState('');
  const [certifications, setCertifications] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');

  // Specializations
  const [specializations, setSpecializations] = useState<string[]>([]);

  // Services
  const [services, setServices] = useState<Service[]>([{ name: '', duration: '50', price: '', type: 'Online' }]);

  // Availability
  const [availableDays, setAvailableDays] = useState<string[]>([]);
  const [availableTimes, setAvailableTimes] = useState('');

  // Bio
  const [bio, setBio] = useState('');

  // Media
  const [profilePhotoUrl, setProfilePhotoUrl] = useState('');
  const [introVideoUrl, setIntroVideoUrl] = useState('');
  const [certDocsUrl, setCertDocsUrl] = useState('');

  // Social Proof
  const [clientReviews, setClientReviews] = useState('');
  const [successStories, setSuccessStories] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    api.getMe().then((me) => { if (me.role !== 'ADMIN') router.replace('/dashboard/admin'); }).catch(() => {});
  }, [router]);

  const toggleSpec = (s: string) =>
    setSpecializations((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]);

  const toggleDay = (d: string) =>
    setAvailableDays((prev) => prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]);

  const updateService = (i: number, field: keyof Service, val: string) =>
    setServices((prev) => prev.map((s, idx) => idx === i ? { ...s, [field]: val } : s));

  const addService = () => setServices((prev) => [...prev, { name: '', duration: '50', price: '', type: 'Online' }]);
  const removeService = (i: number) => setServices((prev) => prev.filter((_, idx) => idx !== i));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name.trim() || !email.trim() || !password) {
      setError('Please fill in name, email and password.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    setLoading(true);
    api.postAdminCreateSpecialist({
      name: name.trim(), email: email.trim().toLowerCase(), password, role,
      professionalTitle, yearsExperience: yearsExperience ? Number(yearsExperience) : null, location,
      qualification, certifications, licenseNumber,
      specializations, bio,
      services: services.filter((s) => s.name.trim()),
      availableDays, availableTimes,
      profilePhotoUrl, introVideoUrl, certDocsUrl,
      clientReviews, successStories,
    })
      .then(() => setDone(true))
      .catch((err) => setError(err?.message || 'Could not create specialist. This email may already exist.'))
      .finally(() => setLoading(false));
  };

  const resetForm = () => {
    setDone(false); setName(''); setEmail(''); setPassword(''); setRole('THERAPIST');
    setProfessionalTitle(''); setYearsExperience(''); setLocation('');
    setQualification(''); setCertifications(''); setLicenseNumber('');
    setSpecializations([]); setServices([{ name: '', duration: '50', price: '', type: 'Online' }]);
    setAvailableDays([]); setAvailableTimes(''); setBio('');
    setProfilePhotoUrl(''); setIntroVideoUrl(''); setCertDocsUrl('');
    setClientReviews(''); setSuccessStories('');
  };

  if (done) {
    return (
      <div className={styles.page}>
        <h2 className={styles.title}>Add Therapist</h2>
        <div className={styles.success}>
          <p>✓ Specialist created successfully. They can log in and will appear in the user search list for consultations.</p>
          <div className={styles.successActions}>
            <Link href="/dashboard/admin/specialists" className={styles.link}>View all specialists</Link>
            <button type="button" className={styles.button} onClick={resetForm}>Add another</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <h2 className={styles.title}>Add Therapist</h2>
      <p className={styles.sub}>Manually add a specialist. They will appear in the user search and can receive consultation requests.</p>

      <form onSubmit={handleSubmit} className={styles.form}>
        {error && <p className={styles.error}>{error}</p>}

        {/* ── Section 1: Account ── */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>1. Account Credentials</h3>
          <div className={styles.grid2}>
            <label className={styles.label}>
              Full Name <span className={styles.req}>*</span>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} className={styles.input} placeholder="Dr. Jane Smith" required />
            </label>
            <label className={styles.label}>
              Email <span className={styles.req}>*</span>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={styles.input} placeholder="jane@example.com" required />
            </label>
            <label className={styles.label}>
              Password <span className={styles.req}>*</span>
              <PasswordInput value={password} onChange={setPassword} placeholder="Min 8 characters" className={styles.input} />
            </label>
            <label className={styles.label}>
              Role
              <select value={role} onChange={(e) => setRole(e.target.value)} className={styles.input}>
                {ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </label>
          </div>
        </div>

        {/* ── Section 2: Basic Information ── */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>2. Basic Information</h3>
          <div className={styles.grid2}>
            <label className={styles.label}>
              Professional Title
              <input type="text" value={professionalTitle} onChange={(e) => setProfessionalTitle(e.target.value)} className={styles.input} placeholder="e.g. Physiotherapist / Rehab Therapist" />
            </label>
            <label className={styles.label}>
              Years of Experience
              <input type="number" min="0" max="50" value={yearsExperience} onChange={(e) => setYearsExperience(e.target.value)} className={styles.input} placeholder="e.g. 8" />
            </label>
            <label className={styles.label}>
              Location
              <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} className={styles.input} placeholder="City / Online" />
            </label>
          </div>
        </div>

        {/* ── Section 3: Profile Media ── */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>3. Profile Media</h3>
          <div className={styles.grid2}>
            <label className={styles.label}>
              Profile Photo URL
              <input type="url" value={profilePhotoUrl} onChange={(e) => setProfilePhotoUrl(e.target.value)} className={styles.input} placeholder="https://..." />
            </label>
            <label className={styles.label}>
              Intro Video URL <span className={styles.opt}>(Optional)</span>
              <input type="url" value={introVideoUrl} onChange={(e) => setIntroVideoUrl(e.target.value)} className={styles.input} placeholder="https://youtube.com/..." />
            </label>
            <label className={styles.label}>
              Certification Documents URL <span className={styles.opt}>(Optional)</span>
              <input type="url" value={certDocsUrl} onChange={(e) => setCertDocsUrl(e.target.value)} className={styles.input} placeholder="https://drive.google.com/..." />
            </label>
          </div>
        </div>

        {/* ── Section 4: Credentials ── */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>4. Credentials</h3>
          <div className={styles.grid2}>
            <label className={styles.label}>
              Qualification / Degree
              <input type="text" value={qualification} onChange={(e) => setQualification(e.target.value)} className={styles.input} placeholder="e.g. MSc Psychology" />
            </label>
            <label className={styles.label}>
              License / Registration Number
              <input type="text" value={licenseNumber} onChange={(e) => setLicenseNumber(e.target.value)} className={styles.input} placeholder="e.g. RCI-12345" />
            </label>
          </div>
          <label className={styles.label} style={{ marginTop: 12 }}>
            Certifications
            <textarea value={certifications} onChange={(e) => setCertifications(e.target.value)} className={styles.textarea} placeholder="List certifications, one per line" rows={3} />
          </label>
        </div>

        {/* ── Section 5: Specializations ── */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>5. Specializations</h3>
          <div className={styles.checkGrid}>
            {SPECIALIZATION_OPTIONS.map((s) => (
              <label key={s} className={styles.checkLabel}>
                <input type="checkbox" checked={specializations.includes(s)} onChange={() => toggleSpec(s)} className={styles.checkbox} />
                {s}
              </label>
            ))}
          </div>
        </div>

        {/* ── Section 6: Services ── */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>6. Services</h3>
          {services.map((svc, i) => (
            <div key={i} className={styles.serviceRow}>
              <input type="text" value={svc.name} onChange={(e) => updateService(i, 'name', e.target.value)} className={styles.input} placeholder="Service name" />
              <input type="text" value={svc.duration} onChange={(e) => updateService(i, 'duration', e.target.value)} className={styles.inputSm} placeholder="Duration (min)" />
              <input type="text" value={svc.price} onChange={(e) => updateService(i, 'price', e.target.value)} className={styles.inputSm} placeholder="Price (£)" />
              <select value={svc.type} onChange={(e) => updateService(i, 'type', e.target.value)} className={styles.inputSm}>
                <option>Online</option>
                <option>In-Person</option>
                <option>Both</option>
              </select>
              {services.length > 1 && (
                <button type="button" className={styles.removeBtn} onClick={() => removeService(i)}>✕</button>
              )}
            </div>
          ))}
          <button type="button" className={styles.addBtn} onClick={addService}>+ Add Service</button>
        </div>

        {/* ── Section 7: Availability ── */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>7. Availability</h3>
          <p className={styles.fieldLabel}>Available Days</p>
          <div className={styles.dayGrid}>
            {DAYS.map((d) => (
              <label key={d} className={`${styles.dayBtn} ${availableDays.includes(d) ? styles.dayBtnActive : ''}`}>
                <input type="checkbox" checked={availableDays.includes(d)} onChange={() => toggleDay(d)} className={styles.srOnly} />
                {d.slice(0, 3)}
              </label>
            ))}
          </div>
          <label className={styles.label} style={{ marginTop: 12 }}>
            Available Time Slots
            <input type="text" value={availableTimes} onChange={(e) => setAvailableTimes(e.target.value)} className={styles.input} placeholder="e.g. 9am–12pm, 2pm–6pm" />
          </label>
        </div>

        {/* ── Section 8: Bio ── */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>8. Short Bio</h3>
          <textarea value={bio} onChange={(e) => setBio(e.target.value)} className={styles.textarea} placeholder="3–4 lines about this therapist, their approach and what they help clients with..." rows={4} />
        </div>

        {/* ── Section 9: Social Proof ── */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>9. Social Proof <span className={styles.opt}>(Optional)</span></h3>
          <label className={styles.label}>
            Client Reviews
            <textarea value={clientReviews} onChange={(e) => setClientReviews(e.target.value)} className={styles.textarea} placeholder="e.g. &#34;Completely transformed my approach to healing.&#34; — Client A" rows={3} />
          </label>
          <label className={styles.label} style={{ marginTop: 12 }}>
            Success Stories
            <textarea value={successStories} onChange={(e) => setSuccessStories(e.target.value)} className={styles.textarea} placeholder="Brief success story or outcome..." rows={3} />
          </label>
        </div>

        <div className={styles.actions}>
          <button type="submit" className={styles.submit} disabled={loading}>{loading ? 'Creating…' : 'Create Specialist'}</button>
          <Link href="/dashboard/admin/specialists" className={styles.cancel}>Cancel</Link>
        </div>
      </form>
    </div>
  );
}
