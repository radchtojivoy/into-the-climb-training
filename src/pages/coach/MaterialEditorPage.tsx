import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import type { JSONContent } from '@tiptap/react'
import { useMaterialCategories, useCreateCategory, useMaterial, useSaveMaterial, useDeleteMaterial } from '../../hooks/useMaterials'
import { MaterialEditor } from '../../components/materials/MaterialEditor'
import { Icon } from '../../components/ui/Icon'

const EMPTY_DOC: JSONContent = { type: 'doc', content: [{ type: 'paragraph' }] }

export function MaterialEditorPage() {
  const { id } = useParams()
  const isNew = !id || id === 'new'
  const navigate = useNavigate()

  const { data: categories } = useMaterialCategories()
  const { data: existing } = useMaterial(isNew ? '' : id!)
  const createCategory = useCreateCategory()
  const save = useSaveMaterial()
  const remove = useDeleteMaterial()

  const [categoryId, setCategoryId] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [summary, setSummary] = useState('')
  const [body, setBody] = useState<JSONContent | null>(null)
  const [addingCategory, setAddingCategory] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')

  useEffect(() => {
    if (existing) {
      setCategoryId(existing.category_id)
      setTitle(existing.title)
      setSummary(existing.summary ?? '')
      const existingBody = existing.body as JSONContent
      setBody(existingBody && typeof existingBody === 'object' && 'type' in existingBody ? existingBody : EMPTY_DOC)
    } else if (!isNew) {
      // still loading
    } else if (categories && categories.length && categoryId === null) {
      setCategoryId(categories[0].id)
    }
  }, [existing, categories, isNew, categoryId])

  async function handleAddCategory() {
    const name = newCategoryName.trim()
    if (!name) return
    const cat = await createCategory.mutateAsync(name)
    setCategoryId(cat.id)
    setNewCategoryName('')
    setAddingCategory(false)
  }

  async function handleSave(publish: boolean) {
    if (!categoryId || !title.trim()) return
    const id = await save.mutateAsync({
      id: existing?.id,
      categoryId,
      title: title.trim(),
      summary,
      body: body ?? EMPTY_DOC,
      isPublished: publish,
    })
    navigate('/coach/materials')
    return id
  }

  async function handleDelete() {
    if (!existing) return
    if (!confirm('Видалити цей матеріал?')) return
    await remove.mutateAsync(existing.id)
    navigate('/coach/materials')
  }

  const canSave = !!categoryId && title.trim().length > 0

  return (
    <div className="screen">
      <div className="screen-body">
        <div className="sp-top">
          <button className="round-btn" aria-label="Назад" onClick={() => navigate('/coach/materials')}>
            <Icon name="back" />
          </button>
        </div>
        <div className="reg-title" style={{ paddingTop: 14 }}>
          <h2 className="h-mid">{isNew ? 'Новий матеріал' : 'Редагувати матеріал'}</h2>
        </div>

        <div className="form-sec">
          <span className="label" style={{ display: 'block', margin: '0 0 8px 4px' }}>
            Категорія
          </span>
          <div className="cat-pick">
            {categories?.map((c) => (
              <button key={c.id} type="button" aria-pressed={categoryId === c.id} onClick={() => setCategoryId(c.id)}>
                {c.name}
              </button>
            ))}
            {addingCategory ? (
              <input
                autoFocus
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
                onBlur={handleAddCategory}
                placeholder="Назва категорії"
                style={{
                  border: '1.5px solid var(--line)',
                  borderRadius: 999,
                  height: 36,
                  padding: '0 13px',
                  fontSize: 12.5,
                  fontWeight: 700,
                  background: 'var(--paper)',
                }}
              />
            ) : (
              <button type="button" className="new" onClick={() => setAddingCategory(true)}>
                <Icon name="plus" />
                Нова
              </button>
            )}
          </div>
        </div>

        <div className="form-sec">
          <label className="field">
            <span>Заголовок</span>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Наприклад, Ноги важливіші за руки" />
          </label>
          <label className="field">
            <span>Короткий опис</span>
            <textarea
              rows={3}
              maxLength={140}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="До 140 символів — покажемо у списку"
            />
            <span className="count">{summary.length} з 140</span>
          </label>
          <div className="field">
            <span>Матеріал</span>
            <MaterialEditor content={body} onChange={setBody} />
          </div>
        </div>

        <div className="save-wrap" style={{ display: 'grid', gap: 10 }}>
          <button className="btn-main" disabled={!canSave || save.isPending} onClick={() => handleSave(true)}>
            <Icon name="save" />
            {save.isPending ? 'Зберігаю…' : 'Опублікувати'}
          </button>
          <button className="btn-ghost" disabled={!canSave || save.isPending} onClick={() => handleSave(false)}>
            Зберегти чернетку
          </button>
          {!isNew && (
            <button className="btn-ghost" onClick={handleDelete} disabled={remove.isPending}>
              <Icon name="trash" />
              Видалити
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
