import { useEffect } from 'react'
import { useAuth } from '../auth/AuthProvider'

export function WaitingPage() {
  const { profile, signOut, refreshProfile } = useAuth()

  useEffect(() => {
    const id = setInterval(() => {
      refreshProfile()
    }, 5000)
    return () => clearInterval(id)
  }, [refreshProfile])

  return (
    <div className="screen">
      <div
        className="screen-pad"
        style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', gap: 18 }}
      >
        <img src="/brand/logo.png" alt="Into the Climb" style={{ height: 34 }} />
        <div className="spinner" style={{ width: 36, height: 36, borderWidth: 4 }} />
        <h2 className="h-mid">Заявку надіслано</h2>
        <p style={{ color: 'var(--muted)', fontSize: 14, lineHeight: 1.6, maxWidth: '30ch' }}>
          {profile?.full_name ? `${profile.full_name}, чекай` : 'Чекай'} — тренер перевірить заявку і відкриє тобі
          доступ. Це може зайняти трохи часу.
        </p>
        <button className="btn-link" onClick={() => signOut()}>
          Вийти
        </button>
      </div>
    </div>
  )
}
