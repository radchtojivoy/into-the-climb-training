import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMaterialCategories, useMaterials } from '../../hooks/useMaterials'
import { StudentTabBar } from '../../components/student/StudentTabBar'

export function StudentMaterialsPage() {
  const navigate = useNavigate()
  const [categoryId, setCategoryId] = useState<string | 'all'>('all')

  const { data: categories } = useMaterialCategories()
  const { data: materials } = useMaterials()

  const published = useMemo(() => (materials ?? []).filter((m) => m.is_published), [materials])
  const filtered = useMemo(
    () => (categoryId === 'all' ? published : published.filter((m) => m.category_id === categoryId)),
    [published, categoryId],
  )

  const categoryName = (id: string) => categories?.find((c) => c.id === id)?.name ?? ''
  const tripCategory = categories?.find((c) => c.name === 'Скелі')?.id

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
              <button
                className={`mat${tripCategory && m.category_id === tripCategory ? ' trip' : ''}`}
                onClick={() => navigate(`/materials/${m.id}`)}
              >
                <span className="n">{i + 1}</span>
                <span>
                  <h4>{m.title}</h4>
                  {m.summary && <p>{m.summary}</p>}
                  <span className="cat">{categoryName(m.category_id)}</span>
                </span>
              </button>
            </li>
          ))}
        </ol>

        {filtered.length === 0 && (
          <p style={{ textAlign: 'center', color: 'var(--muted)', fontSize: 14, marginTop: 24 }}>Поки що немає матеріалів</p>
        )}
      </div>
      <StudentTabBar />
    </div>
  )
}
