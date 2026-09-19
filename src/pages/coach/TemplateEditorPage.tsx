import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTrainingTypes } from '../../hooks/useTrainingTypes'
import { useWarmupTemplates, useSaveWarmupTemplate, useDeleteWarmupTemplate } from '../../hooks/useLibrary'
import { HoldIcon } from '../../components/ui/HoldIcon'
import { Icon } from '../../components/ui/Icon'
import type { TrainingTypeId } from '../../lib/database.types'

function newKey() {
  return crypto.randomUUID()
}

export function TemplateEditorPage() {
  const { id } = useParams()
  const isNew = !id || id === 'new'
  const navigate = useNavigate()

  const { data: types } = useTrainingTypes()
  const { data: templates } = useWarmupTemplates()
  const save = useSaveWarmupTemplate()
  const remove = useDeleteWarmupTemplate()

  const existing = !isNew ? templates?.find((t) => t.id === id) : undefined

  const [typeId, setTypeId] = useState<TrainingTypeId>('sila')
  const [title, setTitle] = useState('')
  const [items, setItems] = useState<{ key: string; text: string }[]>([])

  useEffect(() => {
    if (existing) {
      setTypeId(existing.type_id)
      setTitle(existing.title)
      setItems(existing.items.map((text) => ({ key: newKey(), text })))
    }
  }, [existing])

  const nonFunTypes = (types ?? []).filter((t) => !t.is_fun)

  function updateItem(key: string, text: string) {
    setItems((its) => its.map((i) => (i.key === key ? { ...i, text } : i)))
  }

  function removeItem(key: string) {
    setItems((its) => its.filter((i) => i.key !== key))
  }

  function addItem() {
    setItems((its) => [...its, { key: newKey(), text: '' }])
  }

  async function handleSave() {
    if (!title.trim()) return
    const cleanItems = items.map((i) => i.text.trim()).filter(Boolean)
    await save.mutateAsync({ id: existing?.id, typeId, title: title.trim(), items: cleanItems })
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
        <h2 className="h-mid">{isNew ? 'Новий шаблон розминки' : 'Редагувати шаблон'}</h2>
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
          <span>Назва шаблону</span>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Наприклад, Розминка ЗФП" />
        </label>
      </div>

      <div className="sec-title">
        <h3>Пункти розминки</h3>
        <span>{items.length}</span>
      </div>
      <ul className="ed-list">
        {items.map((i) => (
          <li key={i.key}>
            <input
              value={i.text}
              placeholder="Пункт розминки"
              aria-label="Пункт розминки"
              onChange={(e) => updateItem(i.key, e.target.value)}
            />
            <button className="del" aria-label="Видалити пункт" onClick={() => removeItem(i.key)}>
              <Icon name="x" />
            </button>
          </li>
        ))}
        <li style={{ padding: 0 }}>
          <button className="add-row" onClick={addItem}>
            <Icon name="plus" />
            Додати пункт
          </button>
        </li>
      </ul>

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
