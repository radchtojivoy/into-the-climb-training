import { useNavigate, useParams } from 'react-router-dom'
import { useMaterial, useMaterialCategories } from '../../hooks/useMaterials'
import { renderMaterialBody } from '../../lib/renderMaterialBody'
import { StudentTabBar } from '../../components/student/StudentTabBar'
import { Icon } from '../../components/ui/Icon'

export function MaterialArticlePage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const { data: material, isLoading } = useMaterial(id)
  const { data: categories } = useMaterialCategories()

  if (isLoading || !material) {
    return (
      <div className="screen" style={{ alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner" />
      </div>
    )
  }

  const categoryName = categories?.find((c) => c.id === material.category_id)?.name ?? ''

  return (
    <div className="screen">
      <div className="screen-body">
        <div className="article-head">
          <button className="round-btn" aria-label="Назад" onClick={() => navigate('/materials')}>
            <Icon name="back" />
          </button>
        </div>
        {categoryName && <span className="article-cat">{categoryName}</span>}
        <h1 className="article-title">{material.title}</h1>
        <div className="article-body" dangerouslySetInnerHTML={{ __html: renderMaterialBody(material.body) }} />
      </div>
      <StudentTabBar />
    </div>
  )
}
