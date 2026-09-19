export type DayStatus = 'done' | 'planned' | 'missed' | 'fun'

export function computeStatus(t: { is_fun: boolean; is_done: boolean; date: string }, todayIso: string): DayStatus {
  if (t.is_fun) return 'fun'
  if (t.is_done) return 'done'
  if (t.date < todayIso) return 'missed'
  return 'planned'
}

export function todayIso(): string {
  return new Date().toISOString().slice(0, 10)
}

export function monthRange(year: number, month: number): { start: string; end: string } {
  const start = new Date(Date.UTC(year, month, 1))
  const end = new Date(Date.UTC(year, month + 1, 0))
  return { start: start.toISOString().slice(0, 10), end: end.toISOString().slice(0, 10) }
}
