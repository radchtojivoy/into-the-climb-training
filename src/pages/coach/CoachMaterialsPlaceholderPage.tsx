import { CoachTabBar } from '../../components/coach/CoachTabBar'

export function CoachMaterialsPlaceholderPage() {
  return (
    <div className="screen">
      <div className="screen-body">
        <div className="mat-head">
          <h2 className="h-big">Матеріали</h2>
        </div>
        <p style={{ padding: '40px 20px', color: 'var(--muted)', fontSize: 14, textAlign: 'center' }}>
          Розділ матеріалів з'явиться на етапі 4.
        </p>
      </div>
      <CoachTabBar />
    </div>
  )
}
