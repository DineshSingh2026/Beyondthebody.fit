'use client';

import { useEffect, useRef, useState } from 'react';

export default function Loader() {
  const [hidden, setHidden] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dots, setDots] = useState('');
  const DURATION = 650;

  useEffect(() => {
    const start = performance.now();
    let dotCount = 0;

    const dotInterval = setInterval(() => {
      dotCount = (dotCount % 3) + 1;
      setDots('.'.repeat(dotCount));
    }, 400);

    const frame = () => {
      const elapsed = performance.now() - start;
      const p = Math.min(100, (elapsed / DURATION) * 100);
      setProgress(p);
      if (p < 100) requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);

    setTimeout(() => {
      clearInterval(dotInterval);
      setProgress(100);
      setTimeout(() => setHidden(true), 400);
    }, DURATION);

    return () => clearInterval(dotInterval);
  }, []);

  return (
    <div className={`loader${hidden ? ' hidden' : ''}`} id="loader">
      <div className="loader-inner">
        <div className="loader-logo">
          <img src="/img/btb-logo.png" alt="Beyond The Body" className="loader-logo-img" />
        </div>
        <p className="loader-tagline">Healing begins within</p>
        <div className="loader-progress-wrap">
          <div
            className="loader-progress-bar"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="loader-loading-text">Loading{dots}</p>
      </div>
    </div>
  );
}
