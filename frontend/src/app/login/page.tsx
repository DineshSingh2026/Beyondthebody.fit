'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { login, signup, setToken } from '@/lib/api';
import PasswordInput from '@/components/ui/PasswordInput';
import styles from './page.module.css';

const COUNTRIES = [
  'United Kingdom', 'United States', 'India', 'Canada', 'Australia', 'Germany', 'France', 'Spain', 'Italy', 'Netherlands',
  'Ireland', 'New Zealand', 'South Africa', 'Singapore', 'United Arab Emirates', 'Other',
];

function dashboardPathForRole(role: string): string {
  if (role === 'ADMIN') return '/dashboard/admin';
  if (['THERAPIST', 'LIFE_COACH', 'HYPNOTHERAPIST', 'MUSIC_TUTOR'].includes(role)) return '/dashboard/therapist';
  return '/dashboard/user';
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const showSignup = searchParams.get('signup') === '1';

  const [mode, setMode] = useState<'signin' | 'signup'>(showSignup ? 'signup' : 'signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [mobile, setMobile] = useState('');
  const [country, setCountry] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { user, token } = await login(email.trim(), password);
      setToken(token);
      router.push(dashboardPathForRole(user.role));
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Login failed. Please try again.';
      setError(msg === 'Failed to fetch' ? 'Cannot reach the server. Check that NEXT_PUBLIC_API_URL points to your backend (e.g. https://api.beyondthebody.fit) and the API service is running, then redeploy the frontend.' : msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (signupPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    if (signupPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      const name = [firstName.trim(), lastName.trim()].filter(Boolean).join(' ') || 'User';
      const { user, token } = await signup(name, email.trim(), signupPassword, mobile.trim() || undefined, country || undefined);
      setToken(token);
      router.push('/dashboard/user');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign up failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const switchToSignup = () => {
    setMode('signup');
    setError('');
  };
  const switchToSignin = () => {
    setMode('signin');
    setError('');
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>Beyond <em>The Body</em></h1>
        <p className={styles.subtitle}>
          {mode === 'signin' ? 'Healing begins within' : 'Create your account'}
        </p>

        {mode === 'signin' ? (
          <form className={styles.form} onSubmit={handleSignIn}>
            <input
              type="email"
              placeholder="Email"
              className={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
            <PasswordInput
              value={password}
              onChange={setPassword}
              placeholder="Password"
              required
              autoComplete="current-password"
            />
            {error && <p className={styles.error} role="alert">{error}</p>}
            <button type="submit" className={styles.button} disabled={loading}>
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
            <p className={styles.footer}>
              Don&apos;t have an account?{' '}
              <button type="button" className={styles.linkButton} onClick={switchToSignup}>
                Sign up
              </button>
            </p>
          </form>
        ) : (
          <form className={styles.form} onSubmit={handleSignUp}>
            <div className={styles.row}>
              <input
                type="text"
                placeholder="First name"
                className={styles.input}
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                autoComplete="given-name"
              />
              <input
                type="text"
                placeholder="Last name"
                className={styles.input}
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                autoComplete="family-name"
              />
            </div>
            <input
              type="email"
              placeholder="Email"
              className={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
            <input
              type="tel"
              placeholder="Mobile number"
              className={styles.input}
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              autoComplete="tel"
            />
            <select
              className={styles.input}
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              aria-label="Country"
            >
              <option value="">Country</option>
              {COUNTRIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <PasswordInput
              value={signupPassword}
              onChange={setSignupPassword}
              placeholder="Password (min 8 characters)"
              required
              minLength={8}
              autoComplete="new-password"
            />
            <PasswordInput
              value={confirmPassword}
              onChange={setConfirmPassword}
              placeholder="Confirm password"
              required
              minLength={8}
              autoComplete="new-password"
            />
            {error && <p className={styles.error} role="alert">{error}</p>}
            <button type="submit" className={styles.button} disabled={loading}>
              {loading ? 'Creating account…' : 'Sign up'}
            </button>
            <p className={styles.footer}>
              Already have an account?{' '}
              <button type="button" className={styles.linkButton} onClick={switchToSignin}>
                Sign in
              </button>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className={styles.page}>
        <div className={styles.card}>
          <h1 className={styles.title}>Beyond <em>The Body</em></h1>
          <p className={styles.subtitle}>Healing begins within</p>
          <p style={{ color: 'var(--muted)', textAlign: 'center' }}>Loading…</p>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
