import type { ReactNode } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './auth/AuthProvider'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { WaitingPage } from './pages/WaitingPage'
import { CoachDashboardPage } from './pages/coach/CoachDashboardPage'
import { StudentPage } from './pages/coach/StudentPage'
import { TrainingEditorPage } from './pages/coach/TrainingEditorPage'
import { LibraryPage } from './pages/coach/LibraryPage'
import { ExerciseEditorPage } from './pages/coach/ExerciseEditorPage'
import { TemplateEditorPage } from './pages/coach/TemplateEditorPage'
import { CoachMaterialsPage } from './pages/coach/CoachMaterialsPage'
import { MaterialEditorPage } from './pages/coach/MaterialEditorPage'
import { StudentCalendarPage } from './pages/student/StudentCalendarPage'
import { StudentTrainingPage } from './pages/student/StudentTrainingPage'
import { StudentFunTrainingPage } from './pages/student/StudentFunTrainingPage'
import { StudentDashboardPage } from './pages/student/StudentDashboardPage'
import { StudentMaterialsPage } from './pages/student/StudentMaterialsPage'
import { MaterialArticlePage } from './pages/student/MaterialArticlePage'

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

  if (profile.role === 'coach') return <Navigate to="/coach" replace />
  if (profile.status === 'pending') return <WaitingPage />
  return <Navigate to="/calendar" replace />
}

function PublicOnly({ children }: { children: ReactNode }) {
  const { session, loading } = useAuth()
  if (loading) return <FullScreenSpinner />
  if (session) return <Navigate to="/" replace />
  return <>{children}</>
}

function RequireCoach({ children }: { children: ReactNode }) {
  const { profile, loading } = useAuth()
  if (loading) return <FullScreenSpinner />
  if (!profile || profile.role !== 'coach') return <Navigate to="/" replace />
  return <>{children}</>
}

function RequireActiveStudent({ children }: { children: ReactNode }) {
  const { profile, loading } = useAuth()
  if (loading) return <FullScreenSpinner />
  if (!profile || profile.role !== 'student' || profile.status !== 'active') return <Navigate to="/" replace />
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

      <Route
        path="/coach"
        element={
          <RequireCoach>
            <CoachDashboardPage />
          </RequireCoach>
        }
      />
      <Route
        path="/coach/students/:studentId"
        element={
          <RequireCoach>
            <StudentPage />
          </RequireCoach>
        }
      />
      <Route
        path="/coach/students/:studentId/trainings/:date"
        element={
          <RequireCoach>
            <TrainingEditorPage />
          </RequireCoach>
        }
      />
      <Route
        path="/coach/library"
        element={
          <RequireCoach>
            <LibraryPage />
          </RequireCoach>
        }
      />
      <Route
        path="/coach/library/exercises/new"
        element={
          <RequireCoach>
            <ExerciseEditorPage />
          </RequireCoach>
        }
      />
      <Route
        path="/coach/library/exercises/:id"
        element={
          <RequireCoach>
            <ExerciseEditorPage />
          </RequireCoach>
        }
      />
      <Route
        path="/coach/library/templates/new"
        element={
          <RequireCoach>
            <TemplateEditorPage />
          </RequireCoach>
        }
      />
      <Route
        path="/coach/library/templates/:id"
        element={
          <RequireCoach>
            <TemplateEditorPage />
          </RequireCoach>
        }
      />
      <Route
        path="/coach/materials"
        element={
          <RequireCoach>
            <CoachMaterialsPage />
          </RequireCoach>
        }
      />
      <Route
        path="/coach/materials/new"
        element={
          <RequireCoach>
            <MaterialEditorPage />
          </RequireCoach>
        }
      />
      <Route
        path="/coach/materials/edit/:id"
        element={
          <RequireCoach>
            <MaterialEditorPage />
          </RequireCoach>
        }
      />

      <Route
        path="/calendar"
        element={
          <RequireActiveStudent>
            <StudentCalendarPage />
          </RequireActiveStudent>
        }
      />
      <Route
        path="/training/:date"
        element={
          <RequireActiveStudent>
            <StudentTrainingPage />
          </RequireActiveStudent>
        }
      />
      <Route
        path="/training/:date/fun"
        element={
          <RequireActiveStudent>
            <StudentFunTrainingPage />
          </RequireActiveStudent>
        }
      />
      <Route
        path="/dashboard"
        element={
          <RequireActiveStudent>
            <StudentDashboardPage />
          </RequireActiveStudent>
        }
      />
      <Route
        path="/materials"
        element={
          <RequireActiveStudent>
            <StudentMaterialsPage />
          </RequireActiveStudent>
        }
      />
      <Route
        path="/materials/:id"
        element={
          <RequireActiveStudent>
            <MaterialArticlePage />
          </RequireActiveStudent>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
