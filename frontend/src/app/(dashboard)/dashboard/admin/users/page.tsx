'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useIsMobile } from '@/hooks/useMediaQuery';
import { api } from '@/lib/api';
import Avatar from '@/components/ui/Avatar';
import styles from './page.module.css';

interface UserRow {
  id: string;
  name: string;
  email: string;
  role: string;
}

export default function AdminUsersPage() {
  const router = useRouter();
  const isMobile = useIsMobile();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getMe().then((me) => { if (me.role !== 'ADMIN') router.replace('/dashboard/admin'); }).catch(() => {});
    api.getAdminUsers()
      .then((data: UserRow[]) => setUsers(Array.isArray(data) ? data : []))
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) {
    return <div className={styles.page}><p className={styles.muted}>Loading…</p></div>;
  }

  const content = users.length === 0 ? (
    <p className={styles.empty}>No users yet.</p>
  ) : isMobile ? (
    <div className={styles.list}>
      {users.map((u) => (
        <div key={u.id} className={styles.card}>
          <Avatar name={u.name} size="md" />
          <div className={styles.info}>
            <span className={styles.name}>{u.name}</span>
            <span className={styles.email}>{u.email}</span>
            <span className={styles.role}>{u.role}</span>
          </div>
        </div>
      ))}
    </div>
  ) : (
    <table className={styles.table}>
      <thead>
        <tr>
          <th>Name</th>
          <th>Email</th>
          <th>Role</th>
        </tr>
      </thead>
      <tbody>
        {users.map((u) => (
          <tr key={u.id}>
            <td>{u.name}</td>
            <td>{u.email}</td>
            <td>{u.role}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <div className={styles.page}>
      <h2 className={styles.title}>All Users</h2>
      <p className={styles.sub}>Registered users on the platform.</p>
      {content}
    </div>
  );
}
