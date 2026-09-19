import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMyMonthTrainings, useNextTraining } from '../../hooks/useMyTrainings'
import { useTrainingTypes } from '../../hooks/useTrainingTypes'
import { MonthCalendar } from '../../components/coach/MonthCalendar'
import { StudentTabBar } from '../../components/student/StudentTabBar'
import { Icon } from '../../components/ui/Icon'
import { MONTH_NAMES } from '../../lib/months'
import { todayIso } from '../../lib/trainingStatus'

export function StudentCalendarPage() {
  const navigate = useNavigate()
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())

  const { data: trainings } = useMyMonthTrainings(year, month)
  const { data: nextTraining } = useNextTraining(todayIso())
  const { data: types } = useTrainingTypes()

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

  function openDay(dateIso: string) {
    navigate(`/training/${dateIso}`)
  }

  const nextTypeName = nextTraining ? types?.find((t) => t.id === nextTraining.type_id)?.name : null
  const isToday = nextTraining?.date === todayIso()

  return (
    <div className="screen">
      <div className="screen-body">
        <div className="cal-head">
          <h2 className="h-big">{MONTH_NAMES[month]}</h2>
          <div className="arrows">
            <button className="round-btn" aria-label="Попередній місяць" onClick={() => shiftMonth(-1)}>
              <Icon name="back" />
            </button>
            <button className="round-btn" aria-label="Наступний місяць" onClick={() => shiftMonth(1)}>
              <Icon name="next" />
            </button>
          </div>
        </div>
        <div className="year">{year}</div>

        <MonthCalendar year={year} month={month} trainings={trainings ?? []} onDayClick={openDay} />

        <div className="legend">
          <div>
            <span className="sq" style={{ background: 'var(--olive)' }} />
            Виконано
          </div>
          <div>
            <span className="sq" style={{ boxShadow: 'inset 0 0 0 2px var(--clay)' }} />
            Заплановано
          </div>
          <div>
            <span
              className="sq"
              style={{
                background: 'repeating-linear-gradient(135deg,rgba(26,26,26,.18) 0 3px,transparent 3px 7px)',
              }}
            />
            Пропущено
          </div>
          <div>
            <span className="sq" style={{ background: 'var(--ochre)' }} />
            Фан-тренування
          </div>
          <div>
            <span className="sq" style={{ background: 'var(--paper-3)' }} />
            Вільний день
          </div>
          <div>
            <span className="sq" style={{ outline: '2.5px solid var(--ink)', outlineOffset: '-2.5px' }} />
            Сьогодні
          </div>
        </div>

        {nextTraining && (
          <div className="upcoming">
            <div className="w">
              <small>{isToday ? 'Сьогодні' : 'Наступне'}</small>
              <strong>{nextTypeName}</strong>
            </div>
            <button className="go" aria-label="Відкрити тренування" onClick={() => openDay(nextTraining.date)}>
              <Icon name="arrow" />
            </button>
          </div>
        )}
      </div>
      <StudentTabBar />
    </div>
  )
}
