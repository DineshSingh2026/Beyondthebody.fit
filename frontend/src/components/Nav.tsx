'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTo = (id: string) => {
    setMobileOpen(false);
    const el = document.getElementById(id);
    if (el) {
      const top = el.getBoundingClientRect().top + window.pageYOffset - 80;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  const links = [
    { label: 'About', id: 'about' },
    { label: 'Conditions', id: 'conditions' },
    { label: 'Services', id: 'services' },
    { label: 'Brain Tips', id: 'braintips' },
    { label: 'Join Us', id: 'team' },
  ];

  return (
    <>
      <nav className={`nav${scrolled ? ' scrolled' : ''}`} id="nav">
        <div className="nav-container">
          <button
            className="nav-logo"
            onClick={() => scrollTo('home')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
          >
            <img
              src="/img/btb-logo.png"
              alt="Beyond The Body"
              className="nav-logo-img"
            />
          </button>
          <ul className="nav-links">
            {links.map((l) => (
              <li key={l.id}>
                <button
                  className="nav-link"
                  onClick={() => scrollTo(l.id)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  {l.label}
                </button>
              </li>
            ))}
            <li>
              <Link href="/login" className="nav-link nav-cta" style={{ textDecoration: 'none' }}>
                Sign in
              </Link>
            </li>
            <li>
              <button
                className="nav-link"
                onClick={() => scrollTo('contact')}
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                Free Consult
              </button>
            </li>
          </ul>
          <button
            className="nav-hamburger"
            id="hamburger"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </nav>

      <div className={`mobile-menu${mobileOpen ? ' open' : ''}`} id="mobileMenu">
        <ul>
          {links.map((l) => (
            <li key={l.id}>
              <button
                className="mobile-link"
                onClick={() => scrollTo(l.id)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left' }}
              >
                {l.label}
              </button>
            </li>
          ))}
          <li>
            <Link href="/login" className="mobile-link" style={{ display: 'block', padding: '12px 16px' }}>
              Sign in
            </Link>
          </li>
          <li>
            <button
              className="mobile-link"
              onClick={() => scrollTo('contact')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left' }}
            >
              Free Consult
            </button>
          </li>
        </ul>
      </div>
    </>
  );
}
