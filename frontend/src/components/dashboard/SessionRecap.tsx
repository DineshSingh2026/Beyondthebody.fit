'use client'
import { useEffect, useState } from 'react'
import { useIsMobile } from '@/hooks/useIsMobile'
import { api } from '@/lib/api'

interface Recap {
  id: string
  takeaways: string[]
  homework: string[]
  recommended_brain_tip: string | null
  therapist_name: string | null
  scheduled_at: string | null
  next_session_at: string | null
}

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long',
  })
}

export default function SessionRecap() {
  const [recaps, setRecaps]   = useState<Recap[]>([])
  const [loading, setLoading] = useState(true)
  const isMobile = useIsMobile()

  const load = () =>
    api.getSessionRecaps()
      .then(d => { setRecaps(Array.isArray(d) ? d : []); setLoading(false) })
      .catch(() => setLoading(false))

  useEffect(() => { load() }, [])

  const dismiss = async (id: string) => {
    setRecaps(prev => prev.filter(r => r.id !== id))
    await api.dismissSessionRecap(id)
  }

  if (loading || recaps.length === 0) return null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: isMobile ? 12 : 16 }}>
      {recaps.map(recap => (
        <div
          key={recap.id}
          style={{
            background: '#1a2e1f',
            border: '1px solid #d4af3760',
            borderRadius: 16,
            padding: isMobile ? '16px' : '20px',
          }}
        >
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            alignItems: 'flex-start', marginBottom: 16,
          }}>
            <div>
              <p style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#d4af37', marginBottom: 4 }}>
                Session Recap
              </p>
              <p style={{ fontSize: 15, fontWeight: 500, color: '#fff' }}>
                {recap.therapist_name ? `With ${recap.therapist_name}` : 'Your Session'}
              </p>
              {recap.scheduled_at && (
                <p style={{ fontSize: 12, color: '#6b7a6e', marginTop: 2 }}>
                  {fmt(recap.scheduled_at)}
                </p>
              )}
            </div>
            <button
              onClick={() => dismiss(recap.id)}
              style={{
                minWidth: 44, minHeight: 44,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: '#2a3f2f', borderRadius: 22,
                border: 'none', cursor: 'pointer',
                color: '#9ca89e', fontSize: 12,
                WebkitTapHighlightColor: 'transparent',
                touchAction: 'manipulation',
                padding: '0 12px',
              }}
            >
              Dismiss
            </button>
          </div>

          {recap.takeaways?.length > 0 && (
            <div style={{ marginBottom: 14 }}>
              <p style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#6b7a6e', marginBottom: 8 }}>
                Key Takeaways
              </p>
              {recap.takeaways.map((t, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
                  <span style={{ color: '#4ade80', flexShrink: 0, marginTop: 1, fontSize: 13 }}>✓</span>
                  <p style={{ fontSize: 13, color: '#c8d5cb', lineHeight: 1.6 }}>{t}</p>
                </div>
              ))}
            </div>
          )}

          {recap.homework?.length > 0 && (
            <div style={{ marginBottom: 14 }}>
              <p style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#6b7a6e', marginBottom: 8 }}>
                Your Homework
              </p>
              {recap.homework.map((h, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
                  <span style={{ color: '#d4af37', flexShrink: 0, marginTop: 1, fontSize: 13 }}>→</span>
                  <p style={{ fontSize: 13, color: '#c8d5cb', lineHeight: 1.6 }}>{h}</p>
                </div>
              ))}
            </div>
          )}

          {recap.recommended_brain_tip && (
            <div style={{ background: '#0f1f14', borderRadius: 10, padding: '10px 12px' }}>
              <p style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#6b7a6e', marginBottom: 4 }}>
                Recommended Brain Tip
              </p>
              <p style={{ fontSize: 13, color: '#d4af37', lineHeight: 1.5 }}>
                {recap.recommended_brain_tip}
              </p>
            </div>
          )}

          {recap.next_session_at && (
            <p style={{
              fontSize: 12, color: '#6b7a6e', marginTop: 12,
              paddingTop: 12, borderTop: '1px solid #2a3f2f',
            }}>
              Next session: {fmt(recap.next_session_at)}
            </p>
          )}
        </div>
      ))}
    </div>
  )
}
