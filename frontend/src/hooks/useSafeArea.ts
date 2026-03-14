'use client';

import { useState, useEffect } from 'react';

export interface SafeAreaInsets {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

/**
 * Returns safe area insets (notch, home indicator) from env().
 * On client we can parse computed style; fallback to 0.
 */
export function useSafeArea(): SafeAreaInsets {
  const [insets, setInsets] = useState<SafeAreaInsets>({
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const style = getComputedStyle(document.documentElement);
    const getEnv = (key: string) => {
      const v = style.getPropertyValue(key);
      if (!v) return 0;
      const match = v.match(/^(\d+(?:\.\d+)?)px$/);
      return match ? parseFloat(match[1]) : 0;
    };
    setInsets({
      top: getEnv('--safe-top') || parseFloat(getComputedStyle(document.documentElement).getPropertyValue('env(safe-area-inset-top)')) || 0,
      right: getEnv('--safe-right') || 0,
      bottom: getEnv('--safe-bottom') || 0,
      left: getEnv('--safe-left') || 0,
    });
  }, []);

  return insets;
}
