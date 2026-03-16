'use client'
import { useEffect, useState } from 'react'

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])
  return isMobile
}

export function useIsIOS() {
  const [isIOS, setIsIOS] = useState(false)
  useEffect(() => {
    setIsIOS(
      /iPad|iPhone|iPod/.test(navigator.userAgent) &&
        !(window as Window & { MSStream?: unknown }).MSStream
    )
  }, [])
  return isIOS
}

export function useIsPWA() {
  const [isPWA, setIsPWA] = useState(false)
  useEffect(() => {
    setIsPWA(
      window.matchMedia('(display-mode: standalone)').matches ||
        (navigator as Navigator & { standalone?: boolean }).standalone === true
    )
  }, [])
  return isPWA
}
