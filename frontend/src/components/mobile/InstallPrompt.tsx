'use client';

import { useState, useEffect } from 'react';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import HapticButton from './HapticButton';
import styles from './InstallPrompt.module.css';

const AUTO_HIDE_MS = 8000;

export default function InstallPrompt() {
  const { canShowPrompt, promptInstall, dismissPrompt, showIOSInstructions, isInstalled } = usePWAInstall();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!canShowPrompt && !showIOSInstructions) return;
    if (isInstalled) return;
    setVisible(true);
    const t = setTimeout(() => setVisible(false), AUTO_HIDE_MS);
    return () => clearTimeout(t);
  }, [canShowPrompt, showIOSInstructions, isInstalled]);

  if (!visible) return null;

  const handleDismiss = () => {
    dismissPrompt();
    setVisible(false);
  };

  if (showIOSInstructions) {
    return (
      <div className={styles.banner}>
        <div className={styles.header}>
          <div className={styles.logo}>B</div>
          <h2 className={styles.headline}>Add to Home Screen</h2>
        </div>
        <p className={styles.sub}>Get the full app experience — works offline.</p>
        <div className={styles.iosSteps}>
          <strong>To install:</strong>
          <ol>
            <li>Tap the Share button in Safari</li>
            <li>Scroll and tap &quot;Add to Home Screen&quot;</li>
            <li>Tap &quot;Add&quot; to install</li>
          </ol>
        </div>
        <div className={styles.actions}>
          <HapticButton variant="ghost" fullWidth onClick={handleDismiss}>
            Not Now
          </HapticButton>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.banner}>
      <div className={styles.header}>
        <div className={styles.logo}>B</div>
        <h2 className={styles.headline}>Add to Home Screen</h2>
      </div>
      <p className={styles.sub}>Get the full app experience — works offline.</p>
      <div className={styles.actions}>
        <HapticButton variant="primary" fullWidth onClick={async () => { await promptInstall(); setVisible(false); }}>
          Install App
        </HapticButton>
        <button type="button" className={styles.secondary} onClick={handleDismiss}>
          Not Now
        </button>
      </div>
    </div>
  );
}
