import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTrainingTypes } from '../../hooks/useTrainingTypes'
import { useLibraryExercises, useWarmupTemplates } from '../../hooks/useLibrary'
import { HoldIcon } from '../../components/ui/HoldIcon'
import { Icon } from '../../components/ui/Icon'
import { CoachTabBar } from '../../components/coach/CoachTabBar'
import type { TrainingTypeId } from '../../lib/database.types'

type Section = 'ex' | 'warm'

export function LibraryPage() {
  const navigate = useNavigate()
  const [section, setSection] = useState<Section>('ex')
  const [typeFilter, setTypeFilter] = useState<TrainingTypeId | 'all'>('all')

  const { data: types } = useTrainingTypes()
  const { data: exercises } = useLibraryExercises()
  const { data: templates } = useWarmupTemplates()

  const nonFunTypes = useMemo(() => (types ?? []).filter((t) => !t.is_fun), [types])
  const typeById = useMemo(() => new Map((types ?? []).map((t) => [t.id, t])), [types])

  const filteredExercises = (exercises ?? []).filter((e) => typeFilter === 'all' || e.type_id === typeFilter)
  const filteredTemplates = (templates ?? []).filter((t) => typeFilter === 'all' || t.type_id === typeFilter)

  return (
    <div className="screen">
      <div className="screen-body">
      <div className="mat-head">
        <h2 className="h-big">Бібліотека</h2>
      </div>

      <div className="lib-seg" role="group" aria-label="Розділ бібліотеки">
        <button type="button" aria-pressed={section === 'ex'} onClick={() => setSection('ex')}>
          Вправи
        </button>
        <button type="button" aria-pressed={section === 'warm'} onClick={() => setSection('warm')}>
          Розминки
        </button>
      </div>

      <div className="filters" role="group" aria-label="Тип тренування">
        <button type="button" aria-pressed={typeFilter === 'all'} onClick={() => setTypeFilter('all')}>
          Усі
        </button>
        {nonFunTypes.map((t) => (
          <button key={t.id} type="button" aria-pressed={typeFilter === t.id} onClick={() => setTypeFilter(t.id)}>
            {t.name}
          </button>
        ))}
      </div>

      {section === 'ex' ? (
        <ul className="tpl-list">
          {filteredExercises.map((ex) => {
            const t = typeById.get(ex.type_id)
            return (
              <li key={ex.id}>
                <button className="tpl" onClick={() => navigate(`/coach/library/exercises/${ex.id}`)}>
                  <HoldIcon holdShape={t?.hold_shape ?? 'h0'} color={t?.color ?? '#000'} className="hd" />
                  <span>
                    <strong>{ex.title}</strong>
                    <small>{ex.description}</small>
                  </span>
                  <span className="go-s">
                    <Icon name="next" />
                  </span>
                </button>
              </li>
            )
          })}
          {filteredExercises.length === 0 && (
            <li style={{ color: 'var(--muted)', fontSize: 14, padding: '8px 0' }}>Поки що немає вправ</li>
          )}
        </ul>
      ) : (
        <ul className="tpl-list">
          {filteredTemplates.map((tpl) => {
            const t = typeById.get(tpl.type_id)
            return (
              <li key={tpl.id}>
                <button className="tpl" onClick={() => navigate(`/coach/library/templates/${tpl.id}`)}>
                  <HoldIcon holdShape={t?.hold_shape ?? 'h0'} color={t?.color ?? '#000'} className="hd" />
                  <span>
                    <strong>{tpl.title}</strong>
                    <small>{tpl.items.length} пунктів</small>
                  </span>
                  <span className="go-s">
                    <Icon name="next" />
                  </span>
                </button>
              </li>
            )
          })}
          {filteredTemplates.length === 0 && (
            <li style={{ color: 'var(--muted)', fontSize: 14, padding: '8px 0' }}>Поки що немає шаблонів</li>
          )}
        </ul>
      )}

      <button
        className="fab"
        aria-label={section === 'ex' ? 'Створити вправу' : 'Створити шаблон'}
        onClick={() => navigate(section === 'ex' ? '/coach/library/exercises/new' : '/coach/library/templates/new')}
      >
        <Icon name="plus" />
      </button>
      </div>

      <CoachTabBar />
    </div>
  )
}
