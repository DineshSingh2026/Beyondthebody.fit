'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

export default function ServiceWorkerRegistration() {
  const [showUpdate, setShowUpdate] = useState(false)
  const dismissedForWaiting = useRef(false)
  const waitingRef = useRef<ServiceWorker | null>(null)
  const registrationRef = useRef<ServiceWorkerRegistration | null>(null)

  const applyWaiting = useCallback((reg: ServiceWorkerRegistration) => {
    if (!reg.waiting || !navigator.serviceWorker.controller) return
    if (dismissedForWaiting.current && reg.waiting === waitingRef.current) return
    waitingRef.current = reg.waiting
    setShowUpdate(true)
  }, [])

  const onRefresh = useCallback(() => {
    const w = registrationRef.current?.waiting
    if (w) w.postMessage({ type: 'SKIP_WAITING' })
  }, [])

  const onLater = useCallback(() => {
    dismissedForWaiting.current = true
    setShowUpdate(false)
  }, [])

  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') return
    if (!('serviceWorker' in navigator)) return

    let reloading = false

    const onControllerChange = () => {
      if (reloading) return
      reloading = true
      window.location.reload()
    }

    navigator.serviceWorker.addEventListener('controllerchange', onControllerChange)

    const hookRegistration = (reg: ServiceWorkerRegistration) => {
      registrationRef.current = reg

      const onUpdateFound = () => {
        dismissedForWaiting.current = false
        const installing = reg.installing
        if (!installing) return
        installing.addEventListener('statechange', () => {
          if (installing.state === 'installed') applyWaiting(reg)
        })
      }

      reg.addEventListener('updatefound', onUpdateFound)
      applyWaiting(reg)

      const checkForUpdate = () => {
        reg.update().catch(() => {})
      }
      window.addEventListener('focus', checkForUpdate)
      const onVisibility = () => {
        if (document.visibilityState === 'visible') checkForUpdate()
      }
      document.addEventListener('visibilitychange', onVisibility)

      return () => {
        reg.removeEventListener('updatefound', onUpdateFound)
        window.removeEventListener('focus', checkForUpdate)
        document.removeEventListener('visibilitychange', onVisibility)
      }
    }

    let unhook: (() => void) | undefined

    navigator.serviceWorker
      .register('/sw.js', { updateViaCache: 'none' })
      .then(reg => {
        unhook = hookRegistration(reg)
        return reg.update()
      })
      .catch(err => console.error('SW registration failed:', err))

    return () => {
      navigator.serviceWorker.removeEventListener('controllerchange', onControllerChange)
      unhook?.()
      registrationRef.current = null
    }
  }, [applyWaiting])

  if (!showUpdate) return null

  return (
    <div
      className="sw-update-banner"
      role="status"
      aria-live="polite"
      aria-label="App update available"
    >
      <p className="sw-update-banner-text">
        A new version of this site is ready. Refresh to get the latest fixes and features.
      </p>
      <div className="sw-update-banner-actions">
        <button type="button" className="sw-update-banner-btn sw-update-banner-btn-primary" onClick={onRefresh}>
          Refresh now
        </button>
        <button type="button" className="sw-update-banner-btn sw-update-banner-btn-muted" onClick={onLater}>
          Later
        </button>
      </div>
    </div>
  )
}
