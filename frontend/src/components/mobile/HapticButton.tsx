'use client';

import { useHaptic } from '@/hooks/useHaptic';
import styles from './HapticButton.module.css';

type Variant = 'primary' | 'secondary' | 'ghost';

interface HapticButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  pill?: boolean;
  fullWidth?: boolean;
  children: React.ReactNode;
  className?: string;
}

export default function HapticButton({
  variant = 'primary',
  pill = false,
  fullWidth = false,
  children,
  className = '',
  onClick,
  ...rest
}: HapticButtonProps) {
  const haptic = useHaptic();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    haptic.light();
    onClick?.(e);
  };

  return (
    <button
      type="button"
      className={`${styles.btn} ${styles[variant]} ${pill ? styles.pill : ''} ${fullWidth ? styles.fullWidth : ''} ${className}`.trim()}
      onClick={handleClick}
      {...rest}
    >
      {children}
    </button>
  );
}
