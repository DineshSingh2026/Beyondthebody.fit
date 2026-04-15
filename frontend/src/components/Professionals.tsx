'use client';

import { useEffect, useRef, useState } from 'react';

const showKrishnaProfile = false;

const PROFILES = [
  {
    name: 'Soumya Prakash',
    image: '/img/Soumya half.jpeg',
    badge: 'Board Member',
    role: 'Board Member & Healthcare Strategist',
    quote: '“Advocating for healing that honors the mind and body as one whole conversation.”',
  },
  {
    name: 'Idris Kurnooli',
    image: '/img/Founder.jpeg',
    badge: 'Founder',
    role: 'Founder',
    quote: '“Let\'s connect mental and physical wellness the way they were always meant to be.”',
  },
  {
    name: 'Krishna Mohan Meenavalli',
    image: '/img/kittu.JPG',
    badge: 'Co-founder',
    role: 'Co-founder',
    quote: '“Building a space where mental health care feels human, grounded, and within reach for everyone.”',
  },
];

export default function Professionals() {
  const visibleProfiles = showKrishnaProfile
    ? PROFILES
    : PROFILES.filter((profile) => profile.name !== 'Krishna Mohan Meenavalli');
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const scrollToCard = (index: number) => {
    const container = scrollRef.current;
    if (!container) return;
    const cards = container.querySelectorAll('.prof-card');
    const clamped = Math.max(0, Math.min(index, cards.length - 1));
    const target = cards[clamped] as HTMLElement | undefined;
    if (!target) return;
    container.scrollTo({ left: target.offsetLeft - container.offsetLeft, behavior: 'smooth' });
    setActiveIndex(clamped);
  };

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    const onScroll = () => {
      const cards = Array.from(container.querySelectorAll('.prof-card')) as HTMLElement[];
      if (!cards.length) return;
      const left = container.scrollLeft;
      const nearest = cards.reduce((best, card, i) => {
        const delta = Math.abs(card.offsetLeft - container.offsetLeft - left);
        return delta < best.delta ? { i, delta } : best;
      }, { i: 0, delta: Number.POSITIVE_INFINITY });
      setActiveIndex(nearest.i);
    };
    container.addEventListener('scroll', onScroll, { passive: true });
    return () => container.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <section className="professionals" id="professionals">
      <div className="prof-bg" aria-hidden="true">
        <div className="prof-orb-1" />
        <div className="prof-orb-2" />
      </div>
      <div className="container">
        <div className="section-header">
          <div className="section-tag">Meet The Minds</div>
          <h2 className="section-title">
            Our Mental Health <em>Professionals</em>
          </h2>
          <p className="section-desc">
            Exceptional minds dedicated to your transformation. Each carefully chosen for their
            expertise, empathy, and unwavering commitment to evidence-based care.
          </p>
        </div>
        <div className="prof-scroll" ref={scrollRef}>
          <div className="prof-grid prof-grid--single">
            {visibleProfiles.map((profile) => (
              <div className="prof-card" key={profile.name}>
                <div className="prof-image-wrap">
                  <div className="prof-image-frame">
                    <img src={profile.image} alt={profile.name} className="prof-img" />
                  </div>
                  <span className="prof-badge">{profile.badge}</span>
                </div>
                <div className="prof-info">
                  <div className="prof-gold-line" />
                  <h3 className="prof-name">{profile.name}</h3>
                  <p className="prof-role">{profile.role}</p>
                  <p className="prof-credentials">{profile.quote}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="prof-carousel-nav" aria-label="Profiles navigation">
          <button
            className="prof-nav-btn"
            type="button"
            onClick={() => scrollToCard(activeIndex - 1)}
            aria-label="Previous profile"
          >
            ←
          </button>
          <div className="prof-dots">
            {visibleProfiles.map((_, i) => (
              <button
                key={i}
                type="button"
                className={`prof-dot${i === activeIndex ? ' active' : ''}`}
                onClick={() => scrollToCard(i)}
                aria-label={`Go to profile ${i + 1}`}
              />
            ))}
          </div>
          <button
            className="prof-nav-btn"
            type="button"
            onClick={() => scrollToCard(activeIndex + 1)}
            aria-label="Next profile"
          >
            →
          </button>
        </div>
      </div>
    </section>
  );
}
