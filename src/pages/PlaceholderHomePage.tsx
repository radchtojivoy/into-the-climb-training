import { useAuth } from '../auth/AuthProvider'

export function PlaceholderHomePage() {
  const { profile, signOut } = useAuth()

  return (
    <div className="screen">
      <div
        className="screen-pad"
        style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', gap: 14 }}
      >
        <img src="/brand/logo.png" alt="Into the Climb" style={{ height: 34 }} />
        <h2 className="h-mid">Привіт, {profile?.full_name}!</h2>
        <p style={{ color: 'var(--muted)', fontSize: 14, lineHeight: 1.6, maxWidth: '30ch' }}>
          Твій акаунт активний. Дашборд, календар і тренування зʼявляться на наступних етапах.
        </p>
        <button className="btn-link" onClick={() => signOut()}>
          Вийти
        </button>
      </div>
    </div>
  )
}
