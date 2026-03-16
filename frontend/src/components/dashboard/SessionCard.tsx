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
  date?: string;
  duration: number;
  status: SessionStatus;
  meetingLink?: string | null;
  onJoin?: () => void;
  onComplete?: () => void;
  completing?: boolean;
}

const statusVariant: Record<SessionStatus, 'gold' | 'green' | 'muted'> = {
  UPCOMING: 'gold',
  IN_PROGRESS: 'green',
  COMPLETED: 'muted',
  CANCELLED: 'muted',
};

export default function SessionCard({
  specialistName,
  type,
  time,
  date,
  duration,
  status,
  meetingLink,
  onJoin,
  onComplete,
  completing = false,
}: SessionCardProps) {
  const showJoin = (status === 'UPCOMING' || status === 'IN_PROGRESS') && meetingLink;
  const showComplete = status === 'UPCOMING' || status === 'IN_PROGRESS';

  const handleJoin = () => {
    if (meetingLink) {
      window.open(meetingLink, '_blank', 'noopener,noreferrer');
    }
    if (onJoin) onJoin();
  };

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
        <div className={styles.timeGroup}>
          {date && <span className={styles.date}>{date}</span>}
          <span className={styles.time}>{time}</span>
          <span className={styles.duration}>{duration} min</span>
        </div>
        {(showJoin || showComplete) && (
          <div className={styles.actions}>
            {showJoin && (
              <a
                href={meetingLink!}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.joinBtn}
                onClick={onJoin}
              >
                🎥 Join Now
              </a>
            )}
            {showComplete && onComplete && (
              <button
                type="button"
                className={styles.completeBtn}
                onClick={onComplete}
                disabled={completing}
              >
                {completing ? '…' : '✓ Mark Complete'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
