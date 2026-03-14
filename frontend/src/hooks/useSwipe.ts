'use client';

import { useCallback, useRef, useState } from 'react';

export interface SwipeState {
  deltaX: number;
  deltaY: number;
  isSwiping: boolean;
}

const SWIPE_THRESHOLD = 80;

export function useSwipe(options?: {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  threshold?: number;
}) {
  const threshold = options?.threshold ?? SWIPE_THRESHOLD;
  const start = useRef({ x: 0, y: 0 });
  const [state, setState] = useState<SwipeState>({ deltaX: 0, deltaY: 0, isSwiping: false });

  const onTouchStart = useCallback(
    (e: React.TouchEvent) => {
      start.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      setState({ deltaX: 0, deltaY: 0, isSwiping: true });
    },
    []
  );

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    const dx = e.touches[0].clientX - start.current.x;
    const dy = e.touches[0].clientY - start.current.y;
    setState((s) => ({ ...s, deltaX: dx, deltaY: dy }));
  }, []);

  const onTouchEnd = useCallback(() => {
    setState((s) => {
      if (s.deltaX < -threshold && options?.onSwipeLeft) {
        options.onSwipeLeft();
      } else if (s.deltaX > threshold && options?.onSwipeRight) {
        options.onSwipeRight();
      }
      return { ...s, isSwiping: false, deltaX: 0, deltaY: 0 };
    });
  }, [threshold, options]);

  return { onTouchStart, onTouchMove, onTouchEnd, state };
}
