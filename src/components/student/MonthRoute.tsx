import type { TrainingRow, TrainingTypeRow } from '../../lib/database.types'
import { computeStatus } from '../../lib/trainingStatus'

interface MonthRouteProps {
  trainings: TrainingRow[]
  types: TrainingTypeRow[]
  todayIso: string
}

export function MonthRoute({ trainings, types, todayIso }: MonthRouteProps) {
  const sorted = [...trainings].sort((a, b) => a.date.localeCompare(b.date))
  const n = sorted.length
  if (n === 0) {
    return <div style={{ height: 40 }} />
  }

  const typeById = new Map(types.map((t) => [t.id, t]))
  const points = sorted.map((_, i) => {
    const x = n > 1 ? 5 + i * (90 / (n - 1)) : 50
    const y = 30 + Math.sin(i * 1.35) * 16 + (i % 2 ? 6 : -6)
    return [x, y] as const
  })

  const d = points.map((p, i) => `${i ? 'L' : 'M'}${p[0]} ${p[1]}`).join(' ')

  return (
    <div className="route" aria-label="Маршрут місячного плану" role="img">
      <svg className="line" viewBox="0 0 100 74" preserveAspectRatio="none" aria-hidden="true">
        <path
          d={d}
          fill="none"
          stroke="rgba(26,26,26,.28)"
          strokeWidth={1.4}
          strokeDasharray="2.5 2.5"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      {sorted.map((t, i) => {
        const type = typeById.get(t.type_id)
        if (!type) return null
        const status = computeStatus(t, todayIso)
        const [x, y] = points[i]
        let inner
        if (status === 'done') {
          inner = (
            <>
              <use href={`#${type.hold_shape}`} fill={type.color} />
              <circle cx={20} cy={20} r={3.4} fill="var(--paper)" opacity={0.85} />
            </>
          )
        } else if (status === 'missed') {
          inner = (
            <use
              href={`#${type.hold_shape}`}
              fill="var(--paper-2)"
              stroke="var(--ink)"
              strokeWidth={2.4}
              strokeDasharray="3 3"
              opacity={0.6}
            />
          )
        } else {
          inner = <use href={`#${type.hold_shape}`} fill="var(--paper)" stroke={type.color} strokeWidth={2.6} />
        }
        return (
          <svg key={t.id} className="hold" viewBox="0 0 40 40" style={{ left: `${x}%`, top: y }} aria-hidden="true">
            {inner}
          </svg>
        )
      })}
    </div>
  )
}
