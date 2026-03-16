'use client'
import { useEffect, useState } from 'react'
import { useIsMobile } from '@/hooks/useIsMobile'
import { api } from '@/lib/api'

interface Component { label: string; value: number; weight: string }
interface ScoreData  { score: number; label: string; components: Component[] }

export default function WellnessScore() {
  const [data, setData]         = useState<ScoreData | null>(null)
  const [loading, setLoading]   = useState(true)
  const [expanded, setExpanded] = useState(false)
  const isMobile = useIsMobile()

  useEffect(() => {
    api.getWellnessScore()
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const score        = data?.score ?? 0
  const ringSize     = isMobile ? 100 : 116
  const radius       = isMobile ? 44  : 52
  const circumference = 2 * Math.PI * radius
  const offset       = circumference - (score / 100) * circumference

  const color =
    score >= 80 ? '#4ade80' :
    score >= 60 ? '#d4af37' :
    score >= 40 ? '#60a5fa' : '#f87171'

  return (
    <div
      onClick={() => setExpanded(e => !e)}
      style={{
        background: '#1a2e1f',
        border: '1px solid #2a3f2f',
        borderRadius: 16,
        padding: isMobile ? '16px' : '20px',
        cursor: 'pointer',
        WebkitTapHighlightColor: 'transparent',
        touchAction: 'manipulation',
        marginBottom: isMobile ? 12 : 16,
      }}
    >
      <p style={{
        fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em',
        color: '#6b7a6e', marginBottom: isMobile ? 12 : 16,
      }}>
        Wellness Score
      </p>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 80 }}>
          <div style={{
            width: 28, height: 28, borderRadius: '50%',
            border: '2px solid #d4af37', borderTopColor: 'transparent',
            animation: 'btb-spin 0.8s linear infinite',
          }} />
        </div>
      ) : (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: isMobile ? 16 : 24,
        }}>
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <svg
              width={ringSize}
              height={ringSize}
              viewBox={`0 0 ${ringSize} ${ringSize}`}
              style={{ display: 'block' }}
            >
              <circle
                cx={ringSize / 2} cy={ringSize / 2} r={radius}
                fill="none" stroke="#2a3f2f" strokeWidth={isMobile ? 7 : 8}
              />
              <circle
                cx={ringSize / 2} cy={ringSize / 2} r={radius}
                fill="none"
                stroke={color}
                strokeWidth={isMobile ? 7 : 8}
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                transform={`rotate(-90 ${ringSize / 2} ${ringSize / 2})`}
                style={{ transition: 'stroke-dashoffset 1.2s ease', willChange: 'stroke-dashoffset' }}
              />
            </svg>
            <div style={{
              position: 'absolute', inset: 0,
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ fontSize: isMobile ? 24 : 28, fontWeight: 500, color: '#fff', lineHeight: 1 }}>
                {score}
              </span>
              <span style={{ fontSize: 10, color, fontWeight: 500, marginTop: 2 }}>
                {data?.label}
              </span>
            </div>
          </div>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {data?.components.map(c => (
              <div key={c.label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 12, color: '#9ca89e' }}>{c.label}</span>
                  <span style={{ fontSize: 12, color: '#fff' }}>{c.value}</span>
                </div>
                <div style={{ height: 5, borderRadius: 4, background: '#2a3f2f' }}>
                  <div style={{
                    height: 5, borderRadius: 4,
                    width: `${c.value}%`,
                    background: color,
                    transition: 'width 1s ease',
                    willChange: 'width',
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {expanded && (
        <p style={{
          fontSize: 12, color: '#6b7a6e', marginTop: 12,
          paddingTop: 12, borderTop: '1px solid #2a3f2f', lineHeight: 1.6,
        }}>
          Score = Mood (30%) + Sessions (30%) + Streak (20%) + Brain Tips (20%).
          Recalculates daily from your last 30 days.
        </p>
      )}

      <style>{`@keyframes btb-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
