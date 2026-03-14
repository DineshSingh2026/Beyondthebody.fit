'use client';

import Avatar from '@/components/ui/Avatar';
import BottomSheet from './BottomSheet';
import HapticButton from './HapticButton';
import styles from './SessionJoinSheet.module.css';

interface SessionJoinSheetProps {
  open: boolean;
  onClose: () => void;
  clientName: string;
  onJoin: () => void;
}

const CHECKLIST = [
  'Quiet space',
  'Notes reviewed',
  'Camera & mic ready',
];

export default function SessionJoinSheet({
  open,
  onClose,
  clientName,
  onJoin,
}: SessionJoinSheetProps) {
  const handleJoin = () => {
    onJoin();
    onClose();
  };

  return (
    <BottomSheet open={open} onClose={onClose} title="Join Session">
      <div className={styles.wrap}>
        <div className={styles.header}>
          <Avatar name={clientName} size="lg" />
          <h3 className={styles.name}>{clientName}</h3>
        </div>
        <ul className={styles.checklist}>
          {CHECKLIST.map((item) => (
            <li key={item}>✓ {item}</li>
          ))}
        </ul>
        <HapticButton variant="primary" pill fullWidth onClick={handleJoin}>
          Enter Session Room
        </HapticButton>
      </div>
    </BottomSheet>
  );
}
