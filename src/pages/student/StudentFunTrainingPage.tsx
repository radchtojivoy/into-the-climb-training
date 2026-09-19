import { useNavigate, useParams } from 'react-router-dom'
import { useMyTrainingDetail, useUpdateTrainingTiming, useDeleteFunTraining } from '../../hooks/useMyTrainings'
import { HoldIcon } from '../../components/ui/HoldIcon'
import { Icon } from '../../components/ui/Icon'
import { TimeSelect } from '../../components/ui/TimeSelect'
import { StudentTabBar } from '../../components/student/StudentTabBar'
import { useTrainingTypes } from '../../hooks/useTrainingTypes'
import { DOW_NAMES_NOMINATIVE, MONTHS_GENITIVE } from '../../lib/months'

export function StudentFunTrainingPage() {
  const { date = '' } = useParams()
  const navigate = useNavigate()

  const { data: detail, isLoading } = useMyTrainingDetail(date, true)
  const { data: types } = useTrainingTypes()
  const updateTiming = useUpdateTrainingTiming()
  const remove = useDeleteFunTraining()

  if (isLoading || !types) {
    return (
      <div className="screen" style={{ alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner" />
      </div>
    )
  }

  if (!detail) {
    return (
      <div className="screen">
        <div className="screen-body">
          <div className="tr-top">
            <button className="round-btn" aria-label="Назад" onClick={() => navigate(`/training/${date}`)}>
              <Icon name="back" />
            </button>
          </div>
          <p style={{ padding: '32px 20px', color: 'var(--muted)', fontSize: 14, textAlign: 'center' }}>
            Фан-тренування на цей день не знайдено.
          </p>
        </div>
        <StudentTabBar />
      </div>
    )
  }

  const { training } = detail
  const type = types.find((t) => t.id === training.type_id)
  const [y, m, d] = date.split('-').map(Number)
  const dateObj = new Date(y, m - 1, d)
  const dw = DOW_NAMES_NOMINATIVE[dateObj.getDay()]

  async function handleDelete() {
    if (!confirm('Видалити це фан-тренування?')) return
    await remove.mutateAsync(training.id)
    navigate(`/training/${date}`)
  }

  return (
    <div className="screen">
      <div className="screen-body">
        <div className="tr-top">
          <button className="round-btn" aria-label="Назад" onClick={() => navigate(`/training/${date}`)}>
            <Icon name="back" />
          </button>
        </div>

        <div className="tr-date">
          <div className="dw">{dw}</div>
          <h2 className="h-big">
            {d} {MONTHS_GENITIVE[m - 1]}
          </h2>
        </div>

        <div className="type-row">
          {type && (
            <span className="chip type-chip" style={{ background: 'var(--sage)' }}>
              <HoldIcon holdShape={type.hold_shape} color="var(--paper)" />
              {type.name}
            </span>
          )}
        </div>

        <TimeSelect
          id="funStart"
          label="Початок"
          value={training.start_time}
          onChange={(v) => updateTiming.mutate({ id: training.id, startTime: v })}
        />

        <div className="finish">
          <h3>Завершення</h3>
          <label className="done-toggle">
            <input
              type="checkbox"
              checked={training.is_done}
              onChange={(e) => updateTiming.mutate({ id: training.id, isDone: e.target.checked })}
            />
            <span className="box">
              <Icon name="check" />
            </span>
            <span>Тренування виконано</span>
          </label>
          <TimeSelect
            id="funEnd"
            label="Кінець"
            value={training.end_time}
            onChange={(v) => updateTiming.mutate({ id: training.id, endTime: v })}
          />
        </div>

        <div className="save-wrap">
          <button className="btn-ghost" onClick={handleDelete} disabled={remove.isPending}>
            <Icon name="trash" />
            Видалити фан-тренування
          </button>
        </div>
      </div>
      <StudentTabBar />
    </div>
  )
}
