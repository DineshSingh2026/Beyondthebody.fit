'use client';

import { useEffect, useRef, useState } from 'react';
import { BrainTip } from '@/lib/types';

interface Props {
  brainTips: BrainTip[];
  hideBreathing?: boolean;
}

const PHASES = [
  { label: 'Inhale...', duration: 4000, className: 'inhale', step: 'inhale' },
  { label: 'Hold...', duration: 4000, className: 'hold-inhale', step: 'hold1' },
  { label: 'Exhale...', duration: 4000, className: 'exhale', step: 'exhale' },
  { label: 'Hold...', duration: 4000, className: 'hold-exhale', step: 'hold2' },
];

const GROUNDING_STEPS = [
  { title: '5 things you can see', cue: 'Look around and name five visible details.' },
  { title: '4 things you can touch', cue: 'Notice texture, temperature, and pressure around you.' },
  { title: '3 things you can hear', cue: 'Tune into near and far sounds without judgment.' },
  { title: '2 things you can smell', cue: 'Take a slow breath and identify two scents.' },
  { title: '1 thing you can taste', cue: 'Notice the current taste in your mouth gently.' },
] as const;

const BODY_SCAN_STEPS = [
  { zone: 'Head & Face', cue: 'Soften your jaw, forehead, and eyes.' },
  { zone: 'Shoulders & Neck', cue: 'Release tension from neck and shoulders.' },
  { zone: 'Chest & Breath', cue: 'Notice your breath moving in your chest.' },
  { zone: 'Stomach & Core', cue: 'Relax your belly and core muscles.' },
  { zone: 'Legs & Feet', cue: 'Ground your legs and soften your feet.' },
] as const;

export default function BrainTips({ brainTips, hideBreathing = false }: Props) {
  const [activeActivity, setActiveActivity] = useState<'breathing' | 'grounding' | 'scan' | null>(null);
  const [breathActive, setBreathActive] = useState(false);
  const [breathText, setBreathText] = useState('Press Start');
  const [breathClass, setBreathClass] = useState('');
  const [activeStep, setActiveStep] = useState('');
  const [groundingActive, setGroundingActive] = useState(false);
  const [groundingDone, setGroundingDone] = useState(false);
  const [groundingStep, setGroundingStep] = useState(0);
  const [scanActive, setScanActive] = useState(false);
  const [scanDone, setScanDone] = useState(false);
  const [scanStep, setScanStep] = useState(0);
  const breathRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activeRef = useRef(false);
  const hasStartedRef = useRef(false);

  const stopBreathing = () => {
    activeRef.current = false;
    if (breathRef.current) clearTimeout(breathRef.current);
    setBreathActive(false);
    setBreathText('Press Start');
    setBreathClass('');
    setActiveStep('');
  };

  const restartBreathing = () => {
    activeRef.current = true;
    hasStartedRef.current = true;
    setBreathActive(true);
    runPhase(0, 0);
  };

  const closeActivity = () => {
    setActiveActivity(null);
    stopBreathing();
    setGroundingActive(false);
    setGroundingDone(false);
    setGroundingStep(0);
    setScanActive(false);
    setScanDone(false);
    setScanStep(0);
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
      hasStartedRef.current = true;
      setBreathActive(true);
      runPhase(0, 0);
    }
  };

  const startGrounding = () => {
    setGroundingDone(false);
    setGroundingActive(true);
    setGroundingStep(0);
  };

  const completeGroundingStep = () => {
    if (groundingStep >= GROUNDING_STEPS.length - 1) {
      setGroundingActive(false);
      setGroundingDone(true);
      return;
    }
    setGroundingStep((s) => s + 1);
  };

  const startBodyScan = () => {
    setScanDone(false);
    setScanActive(true);
    setScanStep(0);
  };

  const completeScanStep = () => {
    if (scanStep >= BODY_SCAN_STEPS.length - 1) {
      setScanActive(false);
      setScanDone(true);
      return;
    }
    setScanStep((s) => s + 1);
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
          <h2 className="section-title">Brain Tips</h2>
          <p className="section-desc">
            When you&apos;re overwhelmed, we&apos;ve got you. 60-second techniques, expert-backed
            strategies.
          </p>
        </div>
        <div className="bt-grid" id="btGrid">
          {brainTips.slice(0, 3).map((tip, i) => {
            const activity: 'breathing' | 'grounding' | 'scan' =
              tip.title.includes('Box Breathing')
                ? 'breathing'
                : tip.title.includes('Grounding')
                  ? 'grounding'
                  : 'scan';
            return (
              <button
                key={tip.title}
                type="button"
                className={`bt-card bt-card--${activity}`}
                style={{ transitionDelay: `${i * 80}ms` } as React.CSSProperties}
                onClick={() => setActiveActivity(activity)}
                aria-label={`Tap to start ${tip.title}`}
              >
                <div className="bt-card-top">
                  <span className="bt-icon">{tip.icon}</span>
                  <span className="bt-category">{tip.category}</span>
                </div>
                <h3 className="bt-title">{tip.title}</h3>
                <p className="bt-desc">{tip.description}</p>
                <span className="bt-tap-cta">Tap to start</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className={`modal${activeActivity ? ' open' : ''}`} aria-hidden={!activeActivity}>
        <div className="modal-overlay" onClick={closeActivity} />
        <div className="modal-content breath-finish-modal">
          <button className="modal-close" onClick={closeActivity}>
            ✕
          </button>
          {activeActivity === 'breathing' && (
            <>
              <div className="breath-finish-badge">Box Breathing</div>
              <h3 className="breath-finish-title">Follow the rhythm</h3>
              <div className="breathing-visual">
                <div className={`breath-box${breathClass ? ` ${breathClass}` : ''}`}>
                  <div className="breath-text">{breathText}</div>
                  <div className="breath-progress" />
                </div>
                <div className="breath-steps">
                  {['inhale', 'hold1', 'exhale', 'hold2'].map((phase, i) => (
                    <div key={phase} className={`bs${activeStep === phase ? ' active' : ''}`} data-phase={phase}>
                      {['Inhale', 'Hold', 'Exhale', 'Hold'][i]}
                      <br />
                      <small>4s</small>
                    </div>
                  ))}
                </div>
                <div className="breath-finish-actions">
                  <button className="btn btn-secondary" onClick={restartBreathing}>Redo Exercise</button>
                  <button className="btn btn-primary" onClick={toggleBreathing}>
                    {breathActive ? 'Stop' : 'Start Breathing'}
                  </button>
                </div>
              </div>
            </>
          )}

          {activeActivity === 'grounding' && (
            <>
              <div className="breath-finish-badge">5-4-3-2-1 Grounding</div>
              {!groundingActive && !groundingDone && (
                <div className="bt-live-body">
                  <h4>Interactive reset</h4>
                  <p>Complete each sensory step and return to the present.</p>
                  <button className="btn btn-primary" onClick={startGrounding}>Start Grounding</button>
                </div>
              )}
              {groundingActive && (
                <div className="bt-live-body">
                  <div className="bt-live-progress">Step {groundingStep + 1} / {GROUNDING_STEPS.length}</div>
                  <h4>{GROUNDING_STEPS[groundingStep].title}</h4>
                  <p>{GROUNDING_STEPS[groundingStep].cue}</p>
                  <div className="breath-finish-actions">
                    <button className="btn btn-primary" onClick={completeGroundingStep}>
                      {groundingStep === GROUNDING_STEPS.length - 1 ? 'Complete Exercise' : 'Next Step'}
                    </button>
                  </div>
                </div>
              )}
              {groundingDone && (
                <div className="bt-live-body">
                  <div className="breath-finish-badge">Grounding Complete</div>
                  <h3 className="breath-finish-title">Beautiful reset. You are back in the present.</h3>
                  <p className="breath-finish-desc">
                    Your nervous system just received a calm signal through sensory grounding. Stay with this steadiness and continue your healing flow.
                  </p>
                  <div className="breath-finish-actions">
                    <button className="btn btn-secondary" onClick={startGrounding}>Redo Exercise</button>
                    <button className="btn btn-primary" onClick={closeActivity}>Okay, Continue to Site</button>
                  </div>
                </div>
              )}
            </>
          )}

          {activeActivity === 'scan' && (
            <>
              <div className="breath-finish-badge">Body Scan</div>
              {!scanActive && !scanDone && (
                <div className="bt-live-body">
                  <h4>Guided release</h4>
                  <p>Move through each zone and release held tension.</p>
                  <button className="btn btn-primary" onClick={startBodyScan}>Start Body Scan</button>
                </div>
              )}
              {scanActive && (
                <div className="bt-live-body">
                  <div className="bt-live-progress">Zone {scanStep + 1} / {BODY_SCAN_STEPS.length}</div>
                  <h4>{BODY_SCAN_STEPS[scanStep].zone}</h4>
                  <p>{BODY_SCAN_STEPS[scanStep].cue}</p>
                  <div className="breath-finish-actions">
                    <button className="btn btn-primary" onClick={completeScanStep}>
                      {scanStep === BODY_SCAN_STEPS.length - 1 ? 'Complete Exercise' : 'Next Step'}
                    </button>
                  </div>
                </div>
              )}
              {scanDone && (
                <div className="bt-live-body">
                  <div className="breath-finish-badge">Body Scan Complete</div>
                  <h3 className="breath-finish-title">Excellent progress. Your body feels lighter now.</h3>
                  <p className="breath-finish-desc">
                    You released held tension zone by zone. Carry this grounded calm into the rest of your day.
                  </p>
                  <div className="breath-finish-actions">
                    <button className="btn btn-secondary" onClick={startBodyScan}>Redo Exercise</button>
                    <button className="btn btn-primary" onClick={closeActivity}>Okay, Continue to Site</button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
}
