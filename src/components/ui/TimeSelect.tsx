const OPTIONS: string[] = []
for (let m = 9 * 60; m <= 21 * 60; m += 5) {
  const h = Math.floor(m / 60)
  const mm = m % 60
  OPTIONS.push(`${h}:${String(mm).padStart(2, '0')}`)
}

// Postgres повертає time як "18:30:00" (з секундами і провідним нулем години) —
// приводимо до формату опцій ("18:30") перед тим, як віддати в select.
function normalize(value: string | null): string {
  if (!value) return ''
  const [h, m] = value.split(':')
  return `${Number(h)}:${m}`
}

interface TimeSelectProps {
  id: string
  label: string
  value: string | null
  onChange: (value: string) => void
}

export function TimeSelect({ id, label, value, onChange }: TimeSelectProps) {
  return (
    <div className="time-field">
      <label htmlFor={id}>{label}</label>
      <select id={id} className="times" value={normalize(value)} onChange={(e) => onChange(e.target.value)}>
        <option value="" disabled>
          —
        </option>
        {OPTIONS.map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </select>
    </div>
  )
}
