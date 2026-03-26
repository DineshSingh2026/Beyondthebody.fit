'use client';

import { useEffect, useRef, useState } from 'react';
import { BrainTip } from '@/lib/types';

interface Props {
  brainTips: BrainTip[];
  hideBreathing?: boolean;
}

const PHASES = [
  { label: 'Inhale...', duration: 4000, className: 'inhale', step: 'inhale' },
  { label: 'Hold...', duration: 4000, className: '', step: 'hold1' },
  { label: 'Exhale...', duration: 4000, className: 'exhale', step: 'exhale' },
  { label: 'Hold...', duration: 4000, className: '', step: 'hold2' },
];

export default function BrainTips({ brainTips, hideBreathing = false }: Props) {
  const [breathActive, setBreathActive] = useState(false);
  const [breathText, setBreathText] = useState('Press Start');
  const [breathClass, setBreathClass] = useState('');
  const [activeStep, setActiveStep] = useState('');
  const breathRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activeRef = useRef(false);

  const stopBreathing = () => {
    activeRef.current = false;
    if (breathRef.current) clearTimeout(breathRef.current);
    setBreathActive(false);
    setBreathText('Press Start');
    setBreathClass('');
    setActiveStep('');
  };

  const runPhase = (phaseIndex: number, cycles: number) => {
    if (!activeRef.current || cycles >= 4) {
      setBreathText('Well done! 🌿');
      setBreathClass('');
      setActiveStep('');
      setBreathActive(false);
      activeRef.current = false;
      return;
    }
    const phase = PHASES[phaseIndex];
    setBreathText(phase.label);
    setBreathClass(phase.className);
    setActiveStep(phase.step);
    breathRef.current = setTimeout(() => {
      const next = (phaseIndex + 1) % PHASES.length;
      const nextCycles = next === 0 ? cycles + 1 : cycles;
      runPhase(next, nextCycles);
    }, phase.duration);
  };

  const toggleBreathing = () => {
    if (breathActive) {
      stopBreathing();
    } else {
      activeRef.current = true;
      setBreathActive(true);
      runPhase(0, 0);
    }
  };

  useEffect(() => () => { if (breathRef.current) clearTimeout(breathRef.current); }, []);

  return (
    <section className="braintips" id="braintips">
      <div className="bt-bg">
        <div className="bt-orb-1" />
        <div className="bt-orb-2" />
      </div>
      <div className="container">
        <div className="section-header light">
          <div className="section-tag light">Evidence-Based</div>
          <h2 className="section-title">Brain Tips™</h2>
          <p className="section-desc">
            60-second techniques, expert-backed strategies. When you&apos;re overwhelmed, we&apos;ve
            got you.
          </p>
        </div>
        <div className="bt-grid" id="btGrid">
          {brainTips.map((tip, i) => (
            <div
              key={tip.title}
              className="bt-card"
              style={{ transitionDelay: `${i * 80}ms` } as React.CSSProperties}
            >
              <div className="bt-card-top">
                <span className="bt-icon">{tip.icon}</span>
                <span className="bt-category">{tip.category}</span>
              </div>
              <h3 className="bt-title">{tip.title}</h3>
              <p className="bt-desc">{tip.description}</p>
            </div>
          ))}
        </div>
        {!hideBreathing && (
          <div className="breathing-exercise">
            <h3>Try it Now: Box Breathing</h3>
            <div className="breathing-visual">
              <div className={`breath-box${breathClass ? ` ${breathClass}` : ''}`} id="breathBox">
                <div className="breath-text" id="breathText">
                  {breathText}
                </div>
                <div className="breath-progress" id="breathProgress" />
              </div>
              <div className="breath-steps">
                {['inhale', 'hold1', 'exhale', 'hold2'].map((phase, i) => (
                  <div
                    key={phase}
                    className={`bs${activeStep === phase ? ' active' : ''}`}
                    data-phase={phase}
                  >
                    {['Inhale', 'Hold', 'Exhale', 'Hold'][i]}
                    <br />
                    <small>4s</small>
                  </div>
                ))}
              </div>
              <button className="btn btn-primary" id="breathStart" onClick={toggleBreathing}>
                {breathActive ? 'Stop' : breathText === 'Well done! 🌿' ? 'Try Again' : 'Start Breathing'}
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
