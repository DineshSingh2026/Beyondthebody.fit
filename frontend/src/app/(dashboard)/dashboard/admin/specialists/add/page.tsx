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

export default function AddTherapistPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<string>('THERAPIST');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    api.getMe().then((me) => { if (me.role !== 'ADMIN') router.replace('/dashboard/admin'); }).catch(() => {});
  }, [router]);

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
    api.postAdminCreateSpecialist({ name: name.trim(), email: email.trim().toLowerCase(), password, role })
      .then(() => setDone(true))
      .catch((err) => setError(err?.message || 'Could not create specialist. This email may already exist.'))
      .finally(() => setLoading(false));
  };

  if (done) {
    return (
      <div className={styles.page}>
        <h2 className={styles.title}>Add Therapist</h2>
        <div className={styles.success}>
          <p>Specialist created successfully. They can log in and will appear in the user search list for consultations.</p>
          <Link href="/dashboard/admin/specialists" className={styles.link}>View all specialists</Link>
          <button type="button" className={styles.button} onClick={() => { setDone(false); setName(''); setEmail(''); setPassword(''); setRole('THERAPIST'); }}>Add another</button>
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
        <label className={styles.label}>
          Name
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} className={styles.input} placeholder="Full name" required />
        </label>
        <label className={styles.label}>
          Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={styles.input} placeholder="email@example.com" required />
        </label>
        <label className={styles.label}>
          Password
          <PasswordInput value={password} onChange={setPassword} placeholder="Min 8 characters" className={styles.input} />
        </label>
        <label className={styles.label}>
          Role
          <select value={role} onChange={(e) => setRole(e.target.value)} className={styles.input}>
            {ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>
        </label>
        <div className={styles.actions}>
          <button type="submit" className={styles.submit} disabled={loading}>{loading ? 'Creating…' : 'Add specialist'}</button>
          <Link href="/dashboard/admin/specialists" className={styles.cancel}>Cancel</Link>
        </div>
      </form>
    </div>
  );
}
