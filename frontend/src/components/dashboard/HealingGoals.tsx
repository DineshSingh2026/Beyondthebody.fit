'use client'
import { useEffect, useRef, useState } from 'react'
import { useIsMobile } from '@/hooks/useIsMobile'
import { api } from '@/lib/api'

const PRESET_GOALS = [
  { title: 'Manage anxiety in social situations',  category: 'anxiety'       },
  { title: 'Sleep through the night consistently', category: 'sleep'         },
  { title: 'Reduce panic attacks to once a month', category: 'anxiety'       },
  { title: 'Process and release childhood trauma', category: 'trauma'        },
  { title: 'Set healthy boundaries with family',   category: 'relationships' },
  { title: 'Return to work with confidence',       category: 'burnout'       },
  { title: 'Feel present and grounded every day',  category: 'mindfulness'   },
]

interface ProgressEntry { rating: number }
interface Goal {
  id: string
  title: string
  category: string
  progress_history: ProgressEntry[]
}

export default function HealingGoals() {
  const [goals, setGoals]       = useState<Goal[]>([])
  const [loading, setLoading]   = useState(true)
  const [adding, setAdding]     = useState(false)
  const [custom, setCustom]     = useState('')
  const [ratingId, setRatingId] = useState<string | null>(null)
  const [saving, setSaving]     = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const isMobile = useIsMobile()

  const load = () =>
    api.getHealingGoals()
      .then(d => { setGoals(Array.isArray(d) ? d : []); setLoading(false) })
      .catch(() => setLoading(false))

  useEffect(() => { load() }, [])

  useEffect(() => {
    if (adding && isMobile) {
      setTimeout(() => inputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 300)
    }
  }, [adding, isMobile])

  const addGoal = async (title: string, category = 'general') => {
    setSaving(true)
    try {
      await api.postHealingGoal({ title, category })
      setAdding(false)
      setCustom('')
      load()
    } catch {
      /* ignore */
    } finally {
      setSaving(false)
    }
  }

  const logProgress = async (goalId: string, rating: number) => {
    await api.patchHealingGoal({ action: 'log_progress', goal_id: goalId, rating })
    setRatingId(null)
    load()
  }

  const deactivate = async (goalId: string) => {
    await api.patchHealingGoal({ action: 'deactivate', goal_id: goalId })
    load()
  }

  const latestRating = (g: Goal) => g.progress_history?.[0]?.rating ?? 0

  const btnBase: React.CSSProperties = {
    border: 'none', cursor: 'pointer',
    WebkitTapHighlightColor: 'transparent',
    touchAction: 'manipulation',
    fontFamily: 'inherit',
  }

  return (
    <div style={{
      background: '#1a2e1f', border: '1px solid #2a3f2f',
      borderRadius: 16, padding: isMobile ? 16 : 20,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <p style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#6b7a6e', marginBottom: 2 }}>
            Healing Goals
          </p>
          <p style={{ fontSize: 14, fontWeight: 500, color: '#fff' }}>Your intentions this month</p>
        </div>
        {goals.length < 3 && (
          <button
            onClick={() => setAdding(a => !a)}
            style={{
              ...btnBase,
              background: '#d4af37', color: '#0a1a0f',
              fontSize: 12, fontWeight: 500,
              padding: '0 14px', borderRadius: 20,
              minHeight: 36, minWidth: 80,
            }}
          >
            + Add Goal
          </button>
        )}
      </div>

      {loading && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 24 }}>
          <div style={{
            width: 22, height: 22, borderRadius: '50%',
            border: '2px solid #d4af37', borderTopColor: 'transparent',
            animation: 'btb-spin 0.8s linear infinite',
          }} />
        </div>
      )}

      {!loading && goals.length === 0 && !adding && (
        <div style={{ textAlign: 'center', padding: '16px 0' }}>
          <p style={{ fontSize: 13, color: '#9ca89e', marginBottom: 12, lineHeight: 1.6 }}>
            Set your first healing intention to give your journey direction.
          </p>
          <button
            onClick={() => setAdding(true)}
            style={{
              ...btnBase,
              background: '#2a3f2f', color: '#d4af37',
              fontSize: 13, padding: '10px 20px', borderRadius: 20,
              minHeight: 44,
            }}
          >
            Set a goal →
          </button>
        </div>
      )}

      {!loading && goals.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {goals.map(goal => {
            const rating   = latestRating(goal)
            const progress = Math.round((rating / 5) * 100)
            const isRating = ratingId === goal.id

            return (
              <div key={goal.id} style={{ background: '#0f1f14', borderRadius: 10, padding: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <p style={{ fontSize: 13, color: '#fff', lineHeight: 1.5, flex: 1, paddingRight: 8 }}>
                    {goal.title}
                  </p>
                  <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                    <button
                      onClick={() => setRatingId(isRating ? null : goal.id)}
                      style={{
                        ...btnBase,
                        background: 'transparent', color: '#d4af37',
                        fontSize: 12, minWidth: 44, minHeight: 44,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}
                    >
                      {isRating ? 'Close' : 'Rate'}
                    </button>
                    <button
                      onClick={() => deactivate(goal.id)}
                      style={{
                        ...btnBase,
                        background: 'transparent', color: '#6b7a6e',
                        fontSize: 14, minWidth: 44, minHeight: 44,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}
                    >
                      ✕
                    </button>
                  </div>
                </div>

                <div style={{ height: 5, borderRadius: 3, background: '#2a3f2f', marginBottom: 4 }}>
                  <div style={{
                    height: 5, borderRadius: 3,
                    width: `${progress}%`, background: '#d4af37',
                    transition: 'width 0.8s ease',
                  }} />
                </div>
                <p style={{ fontSize: 11, color: '#6b7a6e' }}>
                  {rating > 0 ? `This week: ${rating}/5` : 'Not rated this week'}
                </p>

                {isRating && (
                  <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
                    {[1,2,3,4,5].map(r => (
                      <button
                        key={r}
                        onClick={() => logProgress(goal.id, r)}
                        style={{
                          ...btnBase,
                          flex: 1,
                          minHeight: isMobile ? 48 : 36,
                          borderRadius: 8, fontSize: 13, fontWeight: 500,
                          background: r <= rating ? '#d4af37' : '#2a3f2f',
                          color:      r <= rating ? '#0a1a0f' : '#9ca89e',
                          transition: 'background 0.15s',
                        }}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {adding && (
        <div style={{
          marginTop: 14, background: '#0f1f14',
          borderRadius: 10, padding: 14,
        }}>
          <p style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#6b7a6e', marginBottom: 10 }}>
            Choose or write a goal
          </p>

          <div style={{
            display: 'flex', flexDirection: 'column', gap: 6,
            maxHeight: isMobile ? 180 : 200,
            overflowY: 'auto',
            WebkitOverflowScrolling: 'touch' as React.CSSProperties['WebkitOverflowScrolling'],
            overscrollBehavior: 'contain',
            marginBottom: 10,
          }}>
            {PRESET_GOALS.map(g => (
              <button
                key={g.title}
                onClick={() => addGoal(g.title, g.category)}
                disabled={saving}
                style={{
                  ...btnBase,
                  textAlign: 'left', fontSize: 13, color: '#c8d5cb',
                  background: '#1a2e1f', borderRadius: 8,
                  padding: '10px 12px',
                  minHeight: 44,
                  opacity: saving ? 0.5 : 1,
                }}
              >
                {g.title}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <input
              ref={inputRef}
              value={custom}
              onChange={e => setCustom(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && custom.trim()) addGoal(custom) }}
              placeholder="Or write your own..."
              style={{
                flex: 1, fontSize: 16, color: '#fff',
                background: '#1a2e1f', border: '1px solid #2a3f2f',
                borderRadius: 8, padding: '10px 12px',
                outline: 'none', fontFamily: 'inherit',
                minHeight: 44,
              }}
            />
            <button
              onClick={() => { if (custom.trim()) addGoal(custom) }}
              disabled={!custom.trim() || saving}
              style={{
                ...btnBase,
                background: '#d4af37', color: '#0a1a0f',
                fontSize: 13, fontWeight: 500,
                padding: '0 16px', borderRadius: 8,
                minHeight: 44, minWidth: 60,
                opacity: (!custom.trim() || saving) ? 0.4 : 1,
              }}
            >
              {saving ? '...' : 'Add'}
            </button>
          </div>
        </div>
      )}

      <style>{`@keyframes btb-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
