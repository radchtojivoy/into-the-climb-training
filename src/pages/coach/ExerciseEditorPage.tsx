import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTrainingTypes } from '../../hooks/useTrainingTypes'
import { useLibraryExercises, useSaveLibraryExercise, useDeleteLibraryExercise } from '../../hooks/useLibrary'
import { HoldIcon } from '../../components/ui/HoldIcon'
import { Icon } from '../../components/ui/Icon'
import type { TrainingTypeId } from '../../lib/database.types'

export function ExerciseEditorPage() {
  const { id } = useParams()
  const isNew = !id || id === 'new'
  const navigate = useNavigate()

  const { data: types } = useTrainingTypes()
  const { data: exercises } = useLibraryExercises()
  const save = useSaveLibraryExercise()
  const remove = useDeleteLibraryExercise()

  const existing = !isNew ? exercises?.find((e) => e.id === id) : undefined

  const [typeId, setTypeId] = useState<TrainingTypeId>('sila')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [videoUrl, setVideoUrl] = useState('')

  useEffect(() => {
    if (existing) {
      setTypeId(existing.type_id)
      setTitle(existing.title)
      setDescription(existing.description ?? '')
      setVideoUrl(existing.video_url ?? '')
    }
  }, [existing])

  const nonFunTypes = (types ?? []).filter((t) => !t.is_fun)

  async function handleSave() {
    if (!title.trim()) return
    await save.mutateAsync({ id: existing?.id, typeId, title: title.trim(), description, videoUrl })
    navigate('/coach/library')
  }

  async function handleDelete() {
    if (!existing) return
    await remove.mutateAsync(existing.id)
    navigate('/coach/library')
  }

  return (
    <div className="screen">
      <div className="ed-top">
        <button className="round-btn" aria-label="Назад" onClick={() => navigate('/coach/library')}>
          <Icon name="back" />
        </button>
      </div>

      <div className="reg-title">
        <h2 className="h-mid">{isNew ? 'Нова вправа' : 'Редагувати вправу'}</h2>
      </div>

      <div className="sec-title" style={{ paddingTop: 20, paddingBottom: 0 }}>
        <h3>Тип тренування</h3>
      </div>
      <div className="type-pick" role="group" aria-label="Тип тренування">
        {nonFunTypes.map((t) => (
          <button key={t.id} type="button" aria-pressed={t.id === typeId} onClick={() => setTypeId(t.id)}>
            <HoldIcon holdShape={t.hold_shape} color={t.id === typeId ? 'var(--paper)' : t.color} />
            {t.name}
          </button>
        ))}
      </div>

      <div className="form-sec">
        <label className="field">
          <span>Назва</span>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Наприклад, Підтягування з вагою" />
        </label>
        <label className="field">
          <span>Опис</span>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Підходи, повтори, вага, відпочинок..."
          />
        </label>
        <label className="field">
          <span>Посилання на відео (необов'язково)</span>
          <input value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="youtu.be/..." />
        </label>
      </div>

      <div className="save-wrap" style={{ display: 'grid', gap: 10 }}>
        <button className="btn-main" onClick={handleSave} disabled={save.isPending || !title.trim()}>
          <Icon name="save" />
          {save.isPending ? 'Зберігаю…' : 'Зберегти'}
        </button>
        {!isNew && (
          <button className="btn-ghost" onClick={handleDelete} disabled={remove.isPending}>
            <Icon name="trash" />
            Видалити
          </button>
        )}
      </div>
    </div>
  )
}
