'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useIsMobile } from '@/hooks/useMediaQuery';
import { api } from '@/lib/api';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import styles from './page.module.css';

interface UserRow {
  id: string;
  name: string;
  email: string;
  role: string;
  suspended?: boolean;
  avatarUrl?: string | null;
  sessionsAllotted?: number;
  sessionsUsed?: number;
  sessionsRemaining?: number;
}

export default function AdminUsersPage() {
  const router = useRouter();
  const isMobile = useIsMobile();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [sessionsEdit, setSessionsEdit] = useState<Record<string, string>>({});
  const [sessionsSaving, setSessionsSaving] = useState<string | null>(null);

  const load = () => api.getAdminUsers().then((data: UserRow[]) => setUsers(Array.isArray(data) ? data : [])).catch(() => setUsers([]));

  useEffect(() => {
    api.getMe().then((me) => { if (me.role !== 'ADMIN') router.replace('/dashboard/admin'); }).catch(() => {});
    load().finally(() => setLoading(false));
  }, [router]);

  const handleSuspend = (u: UserRow, suspended: boolean) => {
    setActionId(u.id);
    api.patchUserSuspend(u.id, suspended).then(load).finally(() => setActionId(null));
  };

  const handleSetSessionsAllotted = async (u: UserRow) => {
    const raw = sessionsEdit[u.id]?.trim();
    const value = raw === '' ? null : (raw !== undefined && /^\d+$/.test(raw) ? parseInt(raw, 10) : u.sessionsAllotted ?? null);
    setSessionsSaving(u.id);
    try {
      await api.patchAdminUserSessionsAllotted(u.id, value);
      await load();
      setSessionsEdit((prev) => { const next = { ...prev }; delete next[u.id]; return next; });
    } finally {
      setSessionsSaving(null);
    }
  };

  if (loading) {
    return <div className={styles.page}><p className={styles.muted}>Loading…</p></div>;
  }

  const content = users.length === 0 ? (
    <p className={styles.empty}>No users yet.</p>
  ) : isMobile ? (
    <div className={styles.list}>
      {users.map((u) => (
        <div key={u.id} className={styles.card}>
          <Avatar name={u.name} src={u.avatarUrl} size="md" />
          <div className={styles.info}>
            <span className={styles.name}>{u.name}</span>
            <span className={styles.email}>{u.email}</span>
            {u.sessionsAllotted != null && (
              <span className={styles.sessionsQuota}>Sessions: {u.sessionsRemaining ?? 0}/{u.sessionsAllotted}</span>
            )}
            <div className={styles.row}>
              {u.suspended && <Badge variant="warn">Suspended</Badge>}
              <Link href={`/dashboard/admin/users/${u.id}`} className={styles.link}>View metrics</Link>
              {u.suspended ? (
                <button type="button" className={styles.btnSm} onClick={() => handleSuspend(u, false)} disabled={!!actionId}>Unsuspend</button>
              ) : (
                <button type="button" className={styles.btnDanger} onClick={() => handleSuspend(u, true)} disabled={!!actionId}>Suspend</button>
              )}
            </div>
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
          <th>Sessions</th>
          <th>Status</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {users.map((u) => (
          <tr key={u.id}>
            <td>{u.name}</td>
            <td>{u.email}</td>
            <td>
              {u.sessionsAllotted != null ? (
                <span className={styles.sessionsDisplay}>{u.sessionsRemaining ?? 0}/{u.sessionsAllotted}</span>
              ) : (
                <span className={styles.muted}>—</span>
              )}
              <div className={styles.sessionsEditRow}>
                <input
                  type="number"
                  min={0}
                  placeholder="Allot"
                  value={sessionsEdit[u.id] ?? (u.sessionsAllotted != null ? String(u.sessionsAllotted) : '')}
                  onChange={(e) => setSessionsEdit((prev) => ({ ...prev, [u.id]: e.target.value }))}
                  className={styles.sessionsInput}
                />
                <button
                  type="button"
                  className={styles.btnSm}
                  disabled={sessionsSaving === u.id}
                  onClick={() => handleSetSessionsAllotted(u)}
                >
                  {sessionsSaving === u.id ? '…' : 'Set'}
                </button>
              </div>
            </td>
            <td>{u.suspended ? <Badge variant="warn">Suspended</Badge> : <Badge variant="green">Active</Badge>}</td>
            <td className={styles.actions}>
              <Link href={`/dashboard/admin/users/${u.id}`} className={styles.link}>Metrics</Link>
              {u.suspended ? (
                <button type="button" className={styles.btnSm} onClick={() => handleSuspend(u, false)} disabled={actionId === u.id}>Unsuspend</button>
              ) : (
                <button type="button" className={styles.btnDanger} onClick={() => handleSuspend(u, true)} disabled={actionId === u.id}>Suspend</button>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <div className={styles.page}>
      <h2 className={styles.title}>All Users</h2>
      <p className={styles.sub}>Registered users. Suspend or view full metrics.</p>
      {content}
    </div>
  );
}
