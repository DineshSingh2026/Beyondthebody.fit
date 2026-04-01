'use client';

import { useEffect } from 'react';

export default function ZoomLock() {
  useEffect(() => {
    const onWheel = (event: WheelEvent) => {
      if (event.ctrlKey) event.preventDefault();
    };

    const onKeyDown = (event: KeyboardEvent) => {
      const key = event.key;
      const ctrlOrMeta = event.ctrlKey || event.metaKey;
      if (!ctrlOrMeta) return;
      if (key === '+' || key === '-' || key === '=' || key === '_' || key === '0') {
        event.preventDefault();
      }
    };

    const onGesture = (event: Event) => event.preventDefault();
    const onTouchMove = (event: TouchEvent) => {
      if (event.touches.length > 1) event.preventDefault();
    };
    const onTouchStart = (event: TouchEvent) => {
      if (event.touches.length > 1) event.preventDefault();
    };

    // Lock browser zoom shortcuts and pinch across modern browsers.
    window.addEventListener('wheel', onWheel, { passive: false, capture: true });
    document.addEventListener('wheel', onWheel, { passive: false, capture: true });
    window.addEventListener('keydown', onKeyDown, { capture: true });
    document.addEventListener('keydown', onKeyDown, { capture: true });
    window.addEventListener('gesturestart', onGesture, { passive: false });
    window.addEventListener('gesturechange', onGesture, { passive: false });
    window.addEventListener('gestureend', onGesture, { passive: false });
    window.addEventListener('touchstart', onTouchStart, { passive: false, capture: true });
    window.addEventListener('touchmove', onTouchMove, { passive: false, capture: true });

    return () => {
      window.removeEventListener('wheel', onWheel, true);
      document.removeEventListener('wheel', onWheel, true);
      window.removeEventListener('keydown', onKeyDown, true);
      document.removeEventListener('keydown', onKeyDown, true);
      window.removeEventListener('gesturestart', onGesture);
      window.removeEventListener('gesturechange', onGesture);
      window.removeEventListener('gestureend', onGesture);
      window.removeEventListener('touchstart', onTouchStart, true);
      window.removeEventListener('touchmove', onTouchMove, true);
    };
  }, []);

  return null;
}
