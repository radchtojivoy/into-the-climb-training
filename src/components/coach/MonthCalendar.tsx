import type { ReactNode } from 'react'
import type { TrainingRow } from '../../lib/database.types'
import { computeStatus, todayIso } from '../../lib/trainingStatus'

const DOW = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд']

interface MonthCalendarProps {
  year: number
  month: number // 0-indexed
  trainings: TrainingRow[]
  onDayClick: (dateIso: string) => void
  compact?: boolean
}

export function MonthCalendar({ year, month, trainings, onDayClick, compact }: MonthCalendarProps) {
  const firstDay = new Date(Date.UTC(year, month, 1))
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate()
  const mondayOffset = (firstDay.getUTCDay() + 6) % 7
  const today = todayIso()

  const byDate = new Map<string, TrainingRow[]>()
  for (const t of trainings) {
    const list = byDate.get(t.date) ?? []
    list.push(t)
    byDate.set(t.date, list)
  }

  const cells: ReactNode[] = []
  for (let i = 0; i < mondayOffset; i++) {
    cells.push(<span key={`empty-${i}`} className="day empty" aria-hidden="true" />)
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const dateIso = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    const dayTrainings = byDate.get(dateIso) ?? []
    const main = dayTrainings.find((t) => !t.is_fun)
    const hasFun = dayTrainings.some((t) => t.is_fun)

    let cls = 'day'
    let hasDot = false
    if (main) {
      cls += ` ${computeStatus(main, today)}`
      hasDot = true
    } else if (hasFun) {
      cls += ' fun'
      hasDot = true
    }
    if (dateIso === today) cls += ' today'

    cells.push(
      <button key={dateIso} type="button" className={cls} onClick={() => onDayClick(dateIso)}>
        {d}
        {hasDot && <i />}
      </button>,
    )
  }

  return (
    <>
      <div className="dow">
        {DOW.map((d) => (
          <span key={d}>{d}</span>
        ))}
      </div>
      <div className={`grid${compact ? ' compact' : ''}`}>{cells}</div>
    </>
  )
}
