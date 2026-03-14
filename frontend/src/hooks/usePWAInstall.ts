'use client';

import { useState, useEffect } from 'react';

export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const INSTALL_DISMISSED_KEY = 'btb_pwa_install_dismissed';
const VISIT_COUNT_KEY = 'btb_pwa_visit_count';
const VISITS_BEFORE_PROMPT = 3;

export function usePWAInstall() {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [canShowPrompt, setCanShowPrompt] = useState(false);

  useEffect(() => {
    const visitCount = parseInt(localStorage.getItem(VISIT_COUNT_KEY) || '0', 10) + 1;
    localStorage.setItem(VISIT_COUNT_KEY, String(visitCount));

    const dismissed = localStorage.getItem(INSTALL_DISMISSED_KEY) === 'true';
    if (dismissed) {
      setCanShowPrompt(false);
      return;
    }
    if (visitCount >= VISITS_BEFORE_PROMPT) {
      setCanShowPrompt(true);
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setInstallEvent(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handler);

    const checkStandalone = () => {
      const standalone = (window.navigator as { standalone?: boolean }).standalone;
      const isPWA = window.matchMedia('(display-mode: standalone)').matches || standalone === true;
      setIsInstalled(isPWA);
    };
    checkStandalone();
    window.matchMedia('(display-mode: standalone)').addEventListener('change', checkStandalone);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const promptInstall = async () => {
    if (!installEvent) return false;
    await installEvent.prompt();
    const { outcome } = await installEvent.userChoice;
    setInstallEvent(null);
    return outcome === 'accepted';
  };

  const dismissPrompt = () => {
    localStorage.setItem(INSTALL_DISMISSED_KEY, 'true');
    setCanShowPrompt(false);
  };

  const isIOS = typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isIOSStandalone = typeof navigator !== 'undefined' && (navigator as { standalone?: boolean }).standalone === true;

  return {
    installEvent,
    isInstalled,
    canShowPrompt: canShowPrompt && !isInstalled,
    promptInstall,
    dismissPrompt,
    isIOS,
    isIOSStandalone,
    showIOSInstructions: isIOS && !isIOSStandalone && !isInstalled,
  };
}
