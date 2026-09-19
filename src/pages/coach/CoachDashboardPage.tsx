import { useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../auth/AuthProvider'
import { usePendingStudents, useActiveStudents } from '../../hooks/useCoachStudents'
import { useUploadAvatar } from '../../hooks/useAvatar'
import { avatarColor, initials } from '../../lib/avatarColor'
import { Icon } from '../../components/ui/Icon'
import { CoachTabBar } from '../../components/coach/CoachTabBar'

export function CoachDashboardPage() {
  const { profile, session, signOut } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [query, setQuery] = useState('')
  const [busyId, setBusyId] = useState<string | null>(null)
  const uploadAvatar = useUploadAvatar()
  const fileInputRef = useRef<HTMLInputElement>(null)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) uploadAvatar.mutate(file)
  }

  const { data: pending, isLoading: pendingLoading } = usePendingStudents()
  const { data: active, isLoading: activeLoading } = useActiveStudents()

  const filtered = useMemo(() => {
    if (!active) return []
    const q = query.trim().toLowerCase()
    if (!q) return active
    return active.filter((s) => s.full_name.toLowerCase().includes(q) || (s.gym ?? '').toLowerCase().includes(q))
  }, [active, query])

  async function handleAccept(studentId: string) {
    if (!session) return
    setBusyId(studentId)
    await supabase.from('profiles').update({ status: 'active', coach_id: session.user.id }).eq('id', studentId)
    setBusyId(null)
    queryClient.invalidateQueries({ queryKey: ['students'] })
  }

  const trainingToday = active?.filter((s) => s.hasTrainingToday).length ?? 0

  return (
    <div className="screen">
      <div className="screen-body">
      <div className="coach-top">
        <img src="/brand/logo.png" alt="Into the Climb" style={{ height: 28 }} />
        <button className="btn-link" onClick={() => signOut()}>
          Вийти
        </button>
      </div>

      <div className="coach-hello" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div
          className="avatar"
          aria-label="Фото профілю, натисніть щоб змінити"
          onClick={() => fileInputRef.current?.click()}
          style={{ cursor: 'pointer', width: 64, height: 64, fontSize: 20 }}
        >
          {profile?.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt=""
              style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
            />
          ) : (
            profile && initials(profile.full_name)
          )}
          <span className="cam">
            <Icon name="cam" />
          </span>
        </div>
        <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />
        <div>
          <h1 className="h-big" style={{ fontSize: 28 }}>
            Привіт, {profile?.full_name ?? 'тренер'}
          </h1>
          <p style={{ margin: '4px 0 0' }}>
            {active?.length ?? 0} учнів, сьогодні тренуються {trainingToday}
          </p>
        </div>
      </div>

      {!pendingLoading &&
        pending?.map((student) => (
          <div className="pending" key={student.id}>
            <div className="w">
              <strong>{student.full_name || 'Без імені'}</strong>
              <small>{student.gym ? `Скеледром «${student.gym}»` : 'Чекає на підтвердження'}</small>
            </div>
            <button onClick={() => handleAccept(student.id)} disabled={busyId === student.id}>
              {busyId === student.id ? '…' : 'Прийняти'}
            </button>
          </div>
        ))}

      <label className="search">
        <Icon name="search" />
        <input
          type="search"
          placeholder="Знайти учня"
          aria-label="Знайти учня"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </label>

      {activeLoading && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 24 }}>
          <div className="spinner" />
        </div>
      )}

      <ul className="students">
        {filtered.map((s) => (
          <li key={s.id}>
            <button className={`st${s.missedCount ? ' alert' : ''}`} onClick={() => navigate(`/coach/students/${s.id}`)}>
              <span className="av" style={{ background: avatarColor(s.id) }}>
                {initials(s.full_name)}
              </span>
              <span>
                <strong>{s.full_name}</strong>
                {s.missedCount ? (
                  <small className="flag">Пропущено: {s.missedCount}</small>
                ) : (
                  <small>{s.gym ? `«${s.gym}»` : ' '}</small>
                )}
                <span className="mini">
                  <i style={{ width: `${s.planPercent}%` }} />
                </span>
              </span>
              <span className="pct">
                {s.planPercent}
                <small>%</small>
              </span>
            </button>
          </li>
        ))}
      </ul>

      {!activeLoading && filtered.length === 0 && (
        <p style={{ textAlign: 'center', color: 'var(--muted)', fontSize: 14, marginTop: 24 }}>
          {query ? 'Нікого не знайдено' : 'Активних учнів поки немає'}
        </p>
      )}
      </div>

      <CoachTabBar />
    </div>
  )
}
