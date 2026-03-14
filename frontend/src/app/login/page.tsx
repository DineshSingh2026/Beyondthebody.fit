'use client';

import styles from './page.module.css';

/**
 * Placeholder login page.
 * When backend auth is ready: form posts to POST /auth/login, sets cookie, redirects to role-specific dashboard.
 */
export default function LoginPage() {
  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>Beyond <em>The Body</em></h1>
        <p className={styles.subtitle}>Healing begins within</p>
        <form className={styles.form} onSubmit={(e) => e.preventDefault()}>
          <input type="email" placeholder="Email" className={styles.input} />
          <input type="password" placeholder="Password" className={styles.input} />
          <button type="submit" className={styles.button}>Sign in</button>
        </form>
        <p className={styles.note}>Dashboard auth will connect to NestJS when ready.</p>
      </div>
    </div>
  );
}
