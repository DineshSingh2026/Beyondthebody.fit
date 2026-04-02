'use client';

import { useEffect } from 'react';

export default function ZoomLock() {
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const previousHtmlTouchAction = html.style.touchAction;
    const previousBodyTouchAction = body.style.touchAction;

    const enforceViewport = () => {
      let viewport = document.querySelector('meta[name="viewport"]') as HTMLMetaElement | null;
      if (!viewport) {
        viewport = document.createElement('meta');
        viewport.name = 'viewport';
        document.head.appendChild(viewport);
      }
      viewport.content =
        'width=device-width, initial-scale=1, maximum-scale=1, minimum-scale=1, user-scalable=no, viewport-fit=cover';
    };

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
    const onResize = () => {
      enforceViewport();
    };

    // Disallow pinch gestures on the document root across supported engines.
    html.style.touchAction = 'pan-x pan-y';
    body.style.touchAction = 'pan-x pan-y';
    enforceViewport();

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
    window.addEventListener('resize', onResize, { capture: true });
    window.addEventListener('orientationchange', onResize, { capture: true });
    window.addEventListener('pageshow', onResize, { capture: true });
    document.addEventListener('visibilitychange', onResize, { capture: true });

    return () => {
      html.style.touchAction = previousHtmlTouchAction;
      body.style.touchAction = previousBodyTouchAction;
      window.removeEventListener('wheel', onWheel, true);
      document.removeEventListener('wheel', onWheel, true);
      window.removeEventListener('keydown', onKeyDown, true);
      document.removeEventListener('keydown', onKeyDown, true);
      window.removeEventListener('gesturestart', onGesture);
      window.removeEventListener('gesturechange', onGesture);
      window.removeEventListener('gestureend', onGesture);
      window.removeEventListener('touchstart', onTouchStart, true);
      window.removeEventListener('touchmove', onTouchMove, true);
      window.removeEventListener('resize', onResize, true);
      window.removeEventListener('orientationchange', onResize, true);
      window.removeEventListener('pageshow', onResize, true);
      document.removeEventListener('visibilitychange', onResize, true);
    };
  }, []);

  return null;
}
