'use client';

import { useRef, useState } from 'react';
import { Quote } from '@/lib/types';

interface Props {
  quotes: Quote[];
}

export default function Quotes({ quotes }: Props) {
  const [index, setIndex] = useState(0);
  const touchStart = useRef(0);

  const goTo = (i: number) => {
    const clamped = Math.max(0, Math.min(i, quotes.length - 1));
    setIndex(clamped);
  };

  const slideWidth = 100 / quotes.length;
  const offset = (index * 100) / quotes.length;

  return (
    <section className="quotes-section" id="quotes">
      <div className="container">
        <div className="section-header">
          <div className="section-tag">Words of Wisdom</div>
          <h2 className="section-title">Let these words guide you</h2>
        </div>
        <div className="quotes-carousel" role="region" aria-label="Words of Wisdom carousel">
          <div
            className="quotes-viewport"
            onTouchStart={(e) => {
              touchStart.current = e.changedTouches[0].screenX;
            }}
            onTouchEnd={(e) => {
              const diff = touchStart.current - e.changedTouches[0].screenX;
              if (diff > 50) goTo(index + 1);
              else if (diff < -50) goTo(index - 1);
            }}
          >
            <div
              className="quotes-track"
              style={{
                width: `${quotes.length * 100}%`,
                transform: `translateX(-${offset}%)`,
                transition: 'transform 0.4s ease',
                display: 'flex',
              }}
            >
              {quotes.map((q, i) => (
                <article
                  key={i}
                  className={`quote-card${i === 1 ? ' accent' : ''}`}
                  style={{ width: `${slideWidth}%`, flexShrink: 0 }}
                >
                  <div className="qc-quote">&ldquo;{q.quote_text}&rdquo;</div>
                  <div className="qc-author">- {q.author}</div>
                </article>
              ))}
            </div>
          </div>

          <div className="quotes-nav">
            <button className="quotes-btn" onClick={() => goTo(index - 1)} aria-label="Previous quote">
              ←
            </button>
            <div className="quotes-dots">
              {quotes.map((_, i) => (
                <button
                  key={i}
                  className={`quotes-dot${i === index ? ' active' : ''}`}
                  onClick={() => goTo(i)}
                  aria-label={`Go to quote ${i + 1}`}
                />
              ))}
            </div>
            <button className="quotes-btn" onClick={() => goTo(index + 1)} aria-label="Next quote">
              →
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
