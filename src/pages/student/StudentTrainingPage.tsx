import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  useMyTrainingDetail,
  useToggleWarmupItem,
  useUpdateExerciseResult,
  useUpdateTrainingTiming,
  useCreateFunTraining,
} from '../../hooks/useMyTrainings'
import { useTrainingTypes } from '../../hooks/useTrainingTypes'
import { HoldIcon } from '../../components/ui/HoldIcon'
import { Icon } from '../../components/ui/Icon'
import { TimeSelect } from '../../components/ui/TimeSelect'
import { StudentTabBar } from '../../components/student/StudentTabBar'
import { DOW_NAMES_NOMINATIVE, MONTHS_GENITIVE } from '../../lib/months'
import type { ExerciseResult } from '../../lib/database.types'

function formatDateHeading(date: string) {
  const [y, m, d] = date.split('-').map(Number)
  const dateObj = new Date(y, m - 1, d)
  return { dw: DOW_NAMES_NOMINATIVE[dateObj.getDay()], text: `${d} ${MONTHS_GENITIVE[m - 1]}` }
}

export function StudentTrainingPage() {
  const { date = '' } = useParams()
  const navigate = useNavigate()

  const { data: detail, isLoading } = useMyTrainingDetail(date, false)
  const { data: funDetail } = useMyTrainingDetail(date, true)
  const { data: types } = useTrainingTypes()
  const toggleWarmup = useToggleWarmupItem()
  const updateResult = useUpdateExerciseResult()
  const updateTiming = useUpdateTrainingTiming()
  const createFun = useCreateFunTraining()

  const [comments, setComments] = useState<Record<string, string>>({})

  useEffect(() => {
    if (detail) {
      const initial: Record<string, string> = {}
      for (const ex of detail.exercises) initial[ex.id] = ex.result_comment ?? ''
      setComments(initial)
    }
  }, [detail])

  async function handleFunClick() {
    if (funDetail?.training) {
      navigate(`/training/${date}/fun`)
    } else {
      await createFun.mutateAsync(date)
      navigate(`/training/${date}/fun`)
    }
  }

  if (isLoading || !types) {
    return (
      <div className="screen" style={{ alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner" />
      </div>
    )
  }

  const { dw, text } = formatDateHeading(date)

  const header = (
    <div className="tr-top">
      <button className="round-btn" aria-label="Назад" onClick={() => navigate('/calendar')}>
        <Icon name="back" />
      </button>
      <button className="fun-btn" onClick={handleFunClick} disabled={createFun.isPending}>
        <Icon name="smile" />
        {funDetail?.training ? 'Фан-тренування ✓' : 'Фан-тренування'}
      </button>
    </div>
  )

  if (!detail) {
    return (
      <div className="screen">
        <div className="screen-body">
          {header}
          <div className="tr-date">
            <div className="dw">{dw}</div>
            <h2 className="h-big">{text}</h2>
          </div>
          <p style={{ padding: '32px 20px', color: 'var(--muted)', fontSize: 14, textAlign: 'center' }}>
            На цей день немає запланованого тренування. Можеш додати фан-тренування кнопкою вгорі.
          </p>
        </div>
        <StudentTabBar />
      </div>
    )
  }

  const { training, warmupItems, exercises } = detail
  const type = types.find((t) => t.id === training.type_id)
  const doneWarmup = warmupItems.filter((w) => w.is_done).length

  return (
    <div className="screen">
      <div className="screen-body">
        {header}

        <div className="tr-date">
          <div className="dw">{dw}</div>
          <h2 className="h-big">{text}</h2>
        </div>

        <div className="type-row">
          {type && (
            <span className="chip type-chip">
              <HoldIcon holdShape={type.hold_shape} color="var(--paper)" />
              {type.name}
            </span>
          )}
          <span className="lock">
            <Icon name="lock" />
            Тип обирає тренер
          </span>
        </div>

        <TimeSelect
          id="tStart"
          label="Початок"
          value={training.start_time}
          onChange={(v) => updateTiming.mutate({ id: training.id, startTime: v })}
        />

        {(warmupItems.length > 0 || training.warmup_note) && (
          <>
            <div className="sec-title">
              <h3>Розминка</h3>
              {warmupItems.length > 0 && (
                <span>
                  {doneWarmup} з {warmupItems.length}
                </span>
              )}
            </div>
            {warmupItems.length > 0 && (
              <div className="warm">
                {warmupItems.map((w) => (
                  <label key={w.id}>
                    <input
                      type="checkbox"
                      checked={w.is_done}
                      onChange={(e) => toggleWarmup.mutate({ id: w.id, isDone: e.target.checked })}
                    />
                    <span className="box">
                      <Icon name="check" />
                    </span>
                    <span>{w.text}</span>
                  </label>
                ))}
              </div>
            )}
            {training.warmup_note && (
              <div
                style={{
                  margin: '10px 20px 0',
                  background: 'var(--paper-2)',
                  borderRadius: 16,
                  padding: '12px 14px',
                  fontSize: 13,
                  lineHeight: 1.5,
                }}
              >
                <div style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--muted)', marginBottom: 4 }}>
                  Нотатка тренера
                </div>
                {training.warmup_note}
              </div>
            )}
          </>
        )}

        {exercises.length > 0 && (
          <>
            <div className="sec-title">
              <h3>Основна частина</h3>
              <span>{exercises.length} вправ</span>
            </div>
            {exercises.map((ex, i) => (
              <article className="ex" key={ex.id}>
                <div className="ex-head">
                  <span className="ex-num">{i + 1}</span>
                  <div>
                    <h4>{ex.title}</h4>
                    {ex.description && <p>{ex.description}</p>}
                    {ex.video_url && (
                      <a
                        className="video"
                        href={ex.video_url.startsWith('http') ? ex.video_url : `https://${ex.video_url}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <Icon name="play" />
                        Відео виконання
                      </a>
                    )}
                  </div>
                </div>
                <div className="ex-res">
                  <div className="seg" role="group" aria-label="Результат вправи">
                    {(
                      [
                        ['ok', 'check', 'Вдало'],
                        ['partial', 'half', 'Частково'],
                        ['fail', 'x', 'Невдало'],
                      ] as [ExerciseResult, 'check' | 'half' | 'x', string][]
                    ).map(([value, icon, label]) => (
                      <button
                        key={value}
                        type="button"
                        data-v={value}
                        aria-pressed={ex.result === value}
                        onClick={() =>
                          updateResult.mutate({
                            id: ex.id,
                            result: ex.result === value ? null : value,
                            resultComment: comments[ex.id] ?? '',
                          })
                        }
                      >
                        <Icon name={icon} />
                        {label}
                      </button>
                    ))}
                  </div>
                  <textarea
                    rows={2}
                    aria-label="Коментар до вправи"
                    placeholder="Коментар або фактичний результат"
                    value={comments[ex.id] ?? ''}
                    onChange={(e) => setComments((c) => ({ ...c, [ex.id]: e.target.value }))}
                    onBlur={() => updateResult.mutate({ id: ex.id, result: ex.result, resultComment: comments[ex.id] ?? '' })}
                  />
                </div>
              </article>
            ))}
          </>
        )}

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
            id="tEnd"
            label="Кінець"
            value={training.end_time}
            onChange={(v) => updateTiming.mutate({ id: training.id, endTime: v })}
          />
        </div>
      </div>
      <StudentTabBar />
    </div>
  )
}
