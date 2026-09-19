import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './auth/AuthProvider'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { WaitingPage } from './pages/WaitingPage'
import { CoachApprovalsPage } from './pages/CoachApprovalsPage'
import { PlaceholderHomePage } from './pages/PlaceholderHomePage'

function FullScreenSpinner() {
  return (
    <div className="screen" style={{ alignItems: 'center', justifyContent: 'center' }}>
      <div className="spinner" />
    </div>
  )
}

function Gate() {
  const { session, profile, loading } = useAuth()

  if (loading) return <FullScreenSpinner />
  if (!session) return <Navigate to="/login" replace />
  if (!profile) return <FullScreenSpinner />

  if (profile.role === 'student' && profile.status === 'pending') return <WaitingPage />
  if (profile.role === 'coach') return <CoachApprovalsPage />
  return <PlaceholderHomePage />
}

function PublicOnly({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth()
  if (loading) return <FullScreenSpinner />
  if (session) return <Navigate to="/" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Gate />} />
      <Route
        path="/login"
        element={
          <PublicOnly>
            <LoginPage />
          </PublicOnly>
        }
      />
      <Route
        path="/register"
        element={
          <PublicOnly>
            <RegisterPage />
          </PublicOnly>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
