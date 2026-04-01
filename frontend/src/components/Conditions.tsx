'use client';

import { useState } from 'react';
import { Condition } from '@/lib/types';

interface Props {
  conditions: Condition[];
}

export default function Conditions({ conditions }: Props) {
  const [modalCond, setModalCond] = useState<Condition | null>(null);
  const conditionEmoji: Record<string, string> = {
    Anxiety: '💭',
    Depression: '🌧️',
    Stress: '🔥',
  };

  const scrollToContact = () => {
    setModalCond(null);
    const el = document.getElementById('contact');
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.pageYOffset - 80, behavior: 'smooth' });
  };

  return (
    <>
      <section className="conditions" id="conditions">
        <div className="container">
          <div className="section-header">
            <div className="section-tag">Conditions We Address</div>
            <h2 className="section-title">You&apos;re not alone in this</h2>
            <p className="section-desc">
              Mental health conditions affect millions. Understanding creates connection and hope.
              Breaking stigma through knowledge.
            </p>
            <p className="conditions-hint">Tap any card to view signs, treatments, and guidance.</p>
          </div>
          <div className="conditions-grid" id="conditionsGrid">
            {conditions.map((cond, i) => (
              <div
                key={cond.name}
                className="condition-card"
                style={
                  { '--card-color': cond.color, transitionDelay: `${i * 100}ms` } as React.CSSProperties
                }
                onClick={() => setModalCond(cond)}
              >
                <div className="cc-top">
                  <h3 className="cc-name">{cond.name}</h3>
                  <span
                    className="cc-treatment"
                    style={{ background: `${cond.color}20`, color: cond.color }}
                  >
                    {cond.treatment}
                  </span>
                </div>
                <p className="cc-fact">{conditionEmoji[cond.name] ?? '🧠'} {cond.fact}</p>
                <p className="cc-tap-hint">Tap for details</p>
              </div>
            ))}
          </div>
          <div className="conditions-cta">
            <button className="btn btn-primary" onClick={scrollToContact}>
              Book Free Consultation →
            </button>
          </div>
        </div>
      </section>

      {/* Condition Modal */}
      <div className={`modal${modalCond ? ' open' : ''}`} id="conditionModal">
        <div className="modal-overlay" onClick={() => setModalCond(null)} />
        <div className="modal-content">
          <button className="modal-close" onClick={() => setModalCond(null)}>
            ✕
          </button>
          {modalCond && (
            <div>
              <div className="modal-cond-name" style={{ color: modalCond.color }}>
                {modalCond.name}
              </div>
              <p className="modal-cond-fact">{conditionEmoji[modalCond.name] ?? '🧠'} {modalCond.fact}</p>
              <div className="modal-section">
                <h4>Common Signs</h4>
                <ul className="modal-list">
                  {modalCond.signs.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
              </div>
              <div className="modal-section">
                <h4>Evidence-Based Treatments</h4>
                <ul className="modal-list">
                  {modalCond.treatments.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              </div>
              <div className="modal-section">
                <h4>Real-Life Scenarios</h4>
                <ul className="modal-list modal-scenarios">
                  {modalCond.name === 'Anxiety' && <><li>&ldquo;I freeze before every big meeting at work.&rdquo;</li><li>&ldquo;I can&apos;t sleep because my mind won&apos;t stop.&rdquo;</li></>}
                  {modalCond.name === 'Depression' && <><li>&ldquo;I lost all motivation — even things I loved feel empty.&rdquo;</li><li>&ldquo;Getting out of bed feels impossible some days.&rdquo;</li></>}
                  {modalCond.name === 'Stress' && <><li>&ldquo;Navigating family stress at work is exhausting.&rdquo;</li><li>&ldquo;I&apos;m running on empty and can&apos;t find balance.&rdquo;</li></>}
                  {!['Anxiety','Depression','Stress'].includes(modalCond.name) && <><li>&ldquo;I&apos;ve been carrying this alone for too long.&rdquo;</li><li>&ldquo;I want to heal but don&apos;t know where to start.&rdquo;</li></>}
                </ul>
              </div>
              <div className="modal-cta">
                <p>Healing is possible. Connect with a specialist who understands.</p>
                <button className="btn btn-primary" onClick={scrollToContact}>
                  Book Free Consultation →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
