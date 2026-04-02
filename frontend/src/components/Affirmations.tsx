'use client';

import { useRef, useState } from 'react';

interface Props {
  affirmations: string[];
}

export default function Affirmations({ affirmations }: Props) {
  const [index, setIndex] = useState(0);
  const touchStart = useRef(0);

  const goTo = (i: number) => {
    const clamped = Math.max(0, Math.min(i, affirmations.length - 1));
    setIndex(clamped);
  };

  const slideWidth = 100 / affirmations.length;
  const offset = (index * 100) / affirmations.length;

  return (
    <section className="affirmations-section" id="affirmations">
      <div className="container">
        <div className="section-header">
          <div className="section-tag">Daily Practice</div>
          <h2 className="section-title">
            Beyond The Body <em>Affirmations</em>
          </h2>
          <p className="section-desc">
            Daily words to rewire your inner dialogue. Your inner dialogue shapes your outer
            reality.
          </p>
        </div>
        <div className="aff-carousel" id="affCarousel">
          <div className="aff-viewport"
            onTouchStart={(e) => { touchStart.current = e.changedTouches[0].screenX; }}
            onTouchEnd={(e) => {
              const diff = touchStart.current - e.changedTouches[0].screenX;
              if (diff > 50) goTo(index + 1);
              else if (diff < -50) goTo(index - 1);
            }}
          >
            <div
              className="aff-track"
              style={{
                '--slide-count': affirmations.length,
                width: `${affirmations.length * 100}%`,
                transform: `translateX(-${offset}%)`,
                transition: 'transform 0.4s ease',
                display: 'flex',
              } as React.CSSProperties}
            >
              {affirmations.map((aff, i) => (
                <div
                  key={i}
                  className="aff-slide"
                  style={{ width: `${slideWidth}%`, flexShrink: 0 }}
                >
                  <p className="aff-slide-text">{aff}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="aff-nav">
            <button className="aff-btn" id="affPrev" onClick={() => goTo(index - 1)}>
              ←
            </button>
            <div className="aff-dots" id="affDots">
              {affirmations.map((_, i) => (
                <div
                  key={i}
                  className={`aff-dot-nav${i === index ? ' active' : ''}`}
                  onClick={() => goTo(i)}
                />
              ))}
            </div>
            <button className="aff-btn" id="affNextBtn" onClick={() => goTo(index + 1)}>
              →
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
