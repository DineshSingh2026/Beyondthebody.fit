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

    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('gesturestart', onGesture);
    window.addEventListener('gesturechange', onGesture);
    window.addEventListener('gestureend', onGesture);

    return () => {
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('gesturestart', onGesture);
      window.removeEventListener('gesturechange', onGesture);
      window.removeEventListener('gestureend', onGesture);
    };
  }, []);

  return null;
}
