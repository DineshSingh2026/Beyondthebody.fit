'use client';

import styles from './MobileCard.module.css';

interface MobileCardProps {
  children: React.ReactNode;
  accent?: 'gold' | 'green' | 'none';
  onClick?: () => void;
  className?: string;
}

export default function MobileCard({
  children,
  accent = 'none',
  onClick,
  className = '',
}: MobileCardProps) {
  return (
    <div
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      className={`${styles.card} ${accent !== 'none' ? styles[`card${accent === 'gold' ? 'Gold' : 'Green'}`] : ''} ${className}`.trim()}
      onClick={onClick}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
    >
      {children}
    </div>
  );
}
