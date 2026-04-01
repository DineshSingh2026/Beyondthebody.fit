'use client'
import { useEffect } from 'react'

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') return
    if (!('serviceWorker' in navigator)) return

    let reloading = false

    navigator.serviceWorker
      .register('/sw.js', { updateViaCache: 'none' })
      .then(reg => reg.update())
      .catch(err => console.error('SW registration failed:', err))

    const onControllerChange = () => {
      if (reloading) return
      reloading = true
      window.location.reload()
    }

    navigator.serviceWorker.addEventListener('controllerchange', onControllerChange)
    return () => {
      navigator.serviceWorker.removeEventListener('controllerchange', onControllerChange)
    }
  }, [])
  return null
}
