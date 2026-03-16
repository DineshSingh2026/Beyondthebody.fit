'use client'
import { useEffect, useState } from 'react'
import { useIsMobile } from '@/hooks/useIsMobile'
import { api } from '@/lib/api'

interface BBData {
  connected: boolean
  nutrition?: number
  recovery?: number
  fitness?: number
  hydration?: number
  synced_at?: string
  stale?: boolean
  error?: string
}

const METRICS = [
  { key: 'nutrition', label: 'Nutrition', icon: '🥗', color: '#4ade80' },
  { key: 'recovery',  label: 'Recovery',  icon: '💤', color: '#60a5fa' },
  { key: 'fitness',   label: 'Fitness',   icon: '⚡', color: '#d4af37' },
  { key: 'hydration', label: 'Hydration', icon: '💧', color: '#34d399' },
]

export default function BodyBankSync() {
  const [data, setData]       = useState<BBData | null>(null)
  const [loading, setLoading] = useState(true)
  const isMobile = useIsMobile()

  useEffect(() => {
    api.getBodyBank()
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  return (
    <div style={{
      background: '#1a2e1f', border: '1px solid #2a3f2f',
      borderRadius: 16, padding: isMobile ? 16 : 20,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <p style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#6b7a6e', marginBottom: 2 }}>
            Body Bank
          </p>
          <p style={{ fontSize: 14, fontWeight: 500, color: '#fff' }}>Mind & Body Overview</p>
        </div>
        <span style={{
          fontSize: 10, padding: '3px 10px', borderRadius: 20,
          background: '#0f1f14', color: '#d4af37',
          border: '1px solid #d4af3740',
        }}>
          Partnership
        </span>
      </div>

      {loading && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '24px 0' }}>
          <div style={{
            width: 24, height: 24, borderRadius: '50%',
            border: '2px solid #d4af37', borderTopColor: 'transparent',
            animation: 'btb-spin 0.8s linear infinite',
            willChange: 'transform',
          }} />
        </div>
      )}

      {!loading && !data?.connected && (
        <div style={{ textAlign: 'center', padding: '16px 0' }}>
          <p style={{ fontSize: 13, color: '#9ca89e', marginBottom: 14, lineHeight: 1.6 }}>
            Connect Body Bank to see your physical wellness alongside your mental health data.
          </p>
          <a
            href="https://bodybank.fit/connect?ref=btb"
            target="_blank"
            rel="noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              background: '#d4af37', color: '#0a1a0f',
              fontSize: 13, fontWeight: 500,
              padding: '10px 20px', borderRadius: 24,
              textDecoration: 'none',
              minHeight: 44,
              WebkitTapHighlightColor: 'transparent',
              touchAction: 'manipulation',
            }}
          >
            Connect Body Bank →
          </a>
        </div>
      )}

      {!loading && data?.connected && !data?.error && (
        <>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 10,
          }}>
            {METRICS.map(m => {
              const val = data[m.key as keyof BBData] as number | undefined
              return (
                <div key={m.key} style={{ background: '#0f1f14', borderRadius: 10, padding: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                    <span style={{ fontSize: 14 }}>{m.icon}</span>
                    <span style={{ fontSize: 11, color: '#9ca89e' }}>{m.label}</span>
                  </div>
                  <div style={{ fontSize: 22, fontWeight: 500, color: '#fff', marginBottom: 6 }}>
                    {val != null ? val : '—'}
                  </div>
                  <div style={{ height: 4, borderRadius: 2, background: '#2a3f2f' }}>
                    <div style={{
                      height: 4, borderRadius: 2,
                      width: `${val ?? 0}%`, background: m.color,
                      transition: 'width 1s ease',
                      willChange: 'width',
                    }} />
                  </div>
                </div>
              )
            })}
          </div>
          {data.synced_at && (
            <p style={{ fontSize: 11, color: '#6b7a6e', marginTop: 10 }}>
              {data.stale ? 'Cached · ' : ''}Last synced {new Date(data.synced_at).toLocaleTimeString()}
            </p>
          )}
        </>
      )}

      {!loading && data?.connected && data?.error && (
        <p style={{ fontSize: 12, color: '#f87171', textAlign: 'center', padding: '12px 0' }}>
          Sync failed. Will retry automatically.
        </p>
      )}

      <style>{`@keyframes btb-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
