import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useStudentDetail, useMonthTrainings, useStudentStats, useSaveCoachNote } from '../../hooks/useStudentDetail'
import { MonthCalendar } from '../../components/coach/MonthCalendar'
import { Icon } from '../../components/ui/Icon'
import { CoachTabBar } from '../../components/coach/CoachTabBar'

const MONTH_NAMES = [
  'Січень',
  'Лютий',
  'Березень',
  'Квітень',
  'Травень',
  'Червень',
  'Липень',
  'Серпень',
  'Вересень',
  'Жовтень',
  'Листопад',
  'Грудень',
]

export function StudentPage() {
  const { studentId = '' } = useParams()
  const navigate = useNavigate()
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())

  const { data: student } = useStudentDetail(studentId)
  const { data: trainings } = useMonthTrainings(studentId, year, month)
  const stats = useStudentStats(studentId, year, month)

  const [note, setNote] = useState<string | null>(null)
  const saveNote = useSaveCoachNote(studentId)
  const noteValue = note ?? student?.coach_note ?? ''

  function shiftMonth(delta: number) {
    let m = month + delta
    let y = year
    if (m < 0) {
      m = 11
      y -= 1
    } else if (m > 11) {
      m = 0
      y += 1
    }
    setMonth(m)
    setYear(y)
  }

  if (!student) {
    return (
      <div className="screen" style={{ alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner" />
      </div>
    )
  }

  const initials = student.full_name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('')

  return (
    <div className="screen">
      <div className="screen-body">
      <div className="sp-top">
        <button className="round-btn" aria-label="Назад" onClick={() => navigate('/coach')}>
          <Icon name="back" />
        </button>
      </div>

      <div className="sp-who">
        <div className="av">{initials}</div>
        <div>
          <h2>{student.full_name}</h2>
          <div className="meta">
            {student.gym ? `«${student.gym}»` : ''}
            {student.grade_rp ? `, RP ${student.grade_rp}` : ''}
            {student.grade_os ? `, онсайт ${student.grade_os}` : ''}
            {student.telegram ? (
              <>
                <br />
                {student.telegram}
              </>
            ) : null}
          </div>
        </div>
      </div>

      <div className="sp-stats">
        <div>
          <b>
            {stats.planDone}/{stats.planTotal}
          </b>
          <span>план</span>
        </div>
        <div>
          <b>{stats.hours.toFixed(1).replace('.', ',')}</b>
          <span>годин</span>
        </div>
        <div>
          <b>{stats.missedCount}</b>
          <span>пропуск</span>
        </div>
      </div>

      <div className="sp-note">
        <div className="row">
          <b>Нотатка для учня</b>
          <button onClick={() => saveNote.mutate(noteValue)} disabled={saveNote.isPending}>
            {saveNote.isPending ? '…' : 'Зберегти'}
          </button>
        </div>
        <textarea
          rows={3}
          aria-label="Нотатка для учня"
          value={noteValue}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Учень побачить це на своєму дашборді"
        />
      </div>

      <div className="sp-cal-head">
        <h3>
          {MONTH_NAMES[month]} {year}
        </h3>
        <div className="arrows" style={{ display: 'flex', gap: 6 }}>
          <button className="round-btn" aria-label="Попередній місяць" onClick={() => shiftMonth(-1)}>
            <Icon name="back" />
          </button>
          <button className="round-btn" aria-label="Наступний місяць" onClick={() => shiftMonth(1)}>
            <Icon name="next" />
          </button>
        </div>
      </div>

      <MonthCalendar
        year={year}
        month={month}
        trainings={trainings ?? []}
        compact
        onDayClick={(dateIso) => navigate(`/coach/students/${studentId}/trainings/${dateIso}`)}
      />
      <p className="sp-hint">Натисни на день, щоб створити або змінити тренування</p>
      </div>

      <CoachTabBar />
    </div>
  )
}
