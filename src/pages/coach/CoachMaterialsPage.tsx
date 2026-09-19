import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMaterialCategories, useMaterials } from '../../hooks/useMaterials'
import { CoachTabBar } from '../../components/coach/CoachTabBar'
import { Icon } from '../../components/ui/Icon'

export function CoachMaterialsPage() {
  const navigate = useNavigate()
  const [categoryId, setCategoryId] = useState<string | 'all'>('all')

  const { data: categories } = useMaterialCategories()
  const { data: materials } = useMaterials()

  const filtered = useMemo(() => {
    if (!materials) return []
    return categoryId === 'all' ? materials : materials.filter((m) => m.category_id === categoryId)
  }, [materials, categoryId])

  const categoryName = (id: string) => categories?.find((c) => c.id === id)?.name ?? ''

  return (
    <div className="screen">
      <div className="screen-body">
        <div className="mat-head">
          <h2 className="h-big">Матеріали</h2>
        </div>

        <div className="filters" role="group" aria-label="Категорії">
          <button type="button" aria-pressed={categoryId === 'all'} onClick={() => setCategoryId('all')}>
            Усі
          </button>
          {categories?.map((c) => (
            <button key={c.id} type="button" aria-pressed={categoryId === c.id} onClick={() => setCategoryId(c.id)}>
              {c.name}
            </button>
          ))}
        </div>

        <ol className="mat-list">
          {filtered.map((m, i) => (
            <li key={m.id}>
              <button className={`mat${!m.is_published ? ' draft' : ''}`} onClick={() => navigate(`/coach/materials/edit/${m.id}`)}>
                <span className="n">{i + 1}</span>
                <span>
                  <h4>{m.title}</h4>
                  {m.summary && <p>{m.summary}</p>}
                  <span className="cat">{m.is_published ? categoryName(m.category_id) : 'Чернетка'}</span>
                </span>
              </button>
            </li>
          ))}
        </ol>

        {filtered.length === 0 && (
          <p style={{ textAlign: 'center', color: 'var(--muted)', fontSize: 14, marginTop: 24 }}>Поки що немає матеріалів</p>
        )}
      </div>

      <button className="fab" aria-label="Додати матеріал" onClick={() => navigate('/coach/materials/new')}>
        <Icon name="plus" />
      </button>

      <CoachTabBar />
    </div>
  )
}
