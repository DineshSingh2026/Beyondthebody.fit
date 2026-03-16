'use client'
import { useEffect, useState } from 'react'
import { api } from '@/lib/api'

export default function MoodInsights() {
  const [insights, setInsights] = useState<string[]>([])

  useEffect(() => {
    api.getMoodInsights()
      .then(d => setInsights(Array.isArray(d.insights) ? d.insights : []))
      .catch(() => {})
  }, [])

  if (insights.length === 0) return null

  return (
    <div style={{
      background: '#0f1f14',
      border: '1px solid #2a3f2f',
      borderRadius: 12,
      padding: '12px 16px',
      marginTop: 12,
    }}>
      <p style={{
        fontSize: 10, textTransform: 'uppercase',
        letterSpacing: '0.1em', color: '#6b7a6e', marginBottom: 8,
      }}>
        Your Patterns
      </p>
      {insights.map((insight, i) => (
        <p key={i} style={{
          fontSize: 13, color: '#c8d5cb',
          lineHeight: 1.6, marginTop: i > 0 ? 6 : 0,
        }}>
          <span style={{ color: '#d4af37', marginRight: 6 }}>◆</span>
          {insight}
        </p>
      ))}
    </div>
  )
}
