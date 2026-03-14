'use client';

import type { SessionStatus } from '@/lib/dashboard-types';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import styles from './SessionCard.module.css';

interface SessionCardProps {
  clientName: string;
  specialistName: string;
  type: string;
  time: string;
  duration: number;
  status: SessionStatus;
  onJoin?: () => void;
}

const statusVariant: Record<SessionStatus, 'gold' | 'green' | 'muted'> = {
  UPCOMING: 'gold',
  IN_PROGRESS: 'green',
  COMPLETED: 'muted',
  CANCELLED: 'muted',
};

export default function SessionCard({
  clientName,
  specialistName,
  type,
  time,
  duration,
  status,
  onJoin,
}: SessionCardProps) {
  const showJoin = status === 'UPCOMING' || status === 'IN_PROGRESS';
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <Avatar name={specialistName} size="md" />
        <div className={styles.meta}>
          <span className={styles.specialist}>{specialistName}</span>
          <span className={styles.type}>{type}</span>
        </div>
        <Badge variant={statusVariant[status]}>{status.replace('_', ' ')}</Badge>
      </div>
      <div className={styles.footer}>
        <span className={styles.time}>{time}</span>
        <span className={styles.duration}>{duration} min</span>
        {showJoin && onJoin && (
          <button type="button" className={styles.joinBtn} onClick={onJoin}>
            {status === 'IN_PROGRESS' ? 'Join Session' : 'Join'}
          </button>
        )}
      </div>
    </div>
  );
}
