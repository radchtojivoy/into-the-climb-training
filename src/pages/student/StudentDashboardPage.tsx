import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/AuthProvider'
import { useMyMonthTrainings, useNextTraining } from '../../hooks/useMyTrainings'
import { useTrainingTypes } from '../../hooks/useTrainingTypes'
import { useUploadAvatar } from '../../hooks/useAvatar'
import { usePushNotifications } from '../../hooks/usePushNotifications'
import { MonthRoute } from '../../components/student/MonthRoute'
import { StudentTabBar } from '../../components/student/StudentTabBar'
import { Icon } from '../../components/ui/Icon'
import { HoldIcon } from '../../components/ui/HoldIcon'
import { initials } from '../../lib/avatarColor'
import { MONTH_NAMES, MONTHS_GENITIVE, DOW_NAMES_NOMINATIVE } from '../../lib/months'
import { todayIso } from '../../lib/trainingStatus'

function timeDiffHours(start: string, end: string): number {
  const [sh, sm] = start.split(':').map(Number)
  const [eh, em] = end.split(':').map(Number)
  return (eh * 60 + em - (sh * 60 + sm)) / 60
}

export function StudentDashboardPage() {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()
  const now = new Date()
  const today = todayIso()

  const { data: trainings } = useMyMonthTrainings(now.getFullYear(), now.getMonth())
  const { data: nextTraining } = useNextTraining(today)
  const { data: types } = useTrainingTypes()
  const uploadAvatar = useUploadAvatar()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [breakdownOpen, setBreakdownOpen] = useState(false)
  const push = usePushNotifications()

  if (!profile || !types) {
    return (
      <div className="screen" style={{ alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner" />
      </div>
    )
  }

  const own = (trainings ?? []).filter((t) => !t.is_fun)
  const funTrainings = (trainings ?? []).filter((t) => t.is_fun)
  const planDone = own.filter((t) => t.is_done).length
  const planTotal = own.length

  const doneOrOngoing = (trainings ?? []).filter((t) => t.is_done && t.start_time && t.end_time)
  const totalHours = doneOrOngoing.reduce((sum, t) => sum + timeDiffHours(t.start_time!, t.end_time!), 0)
  const funHours = doneOrOngoing
    .filter((t) => t.is_fun)
    .reduce((sum, t) => sum + timeDiffHours(t.start_time!, t.end_time!), 0)

  const nonFunTypes = types.filter((t) => !t.is_fun)
  const breakdownRows = nonFunTypes
    .map((t) => {
      const all = own.filter((tr) => tr.type_id === t.id)
      const done = all.filter((tr) => tr.is_done).length
      return { type: t, done, total: all.length }
    })
    .filter((r) => r.total > 0)

  let nextLabel: { small: string; strong: string } | null = null
  if (nextTraining) {
    const type = types.find((t) => t.id === nextTraining.type_id)
    const isToday = nextTraining.date === today
    if (isToday) {
      nextLabel = { small: 'Сьогодні', strong: type?.name ?? '' }
    } else {
      const [y, m, d] = nextTraining.date.split('-').map(Number)
      const dow = DOW_NAMES_NOMINATIVE[new Date(y, m - 1, d).getDay()]
      nextLabel = { small: `${dow}, ${d} ${MONTHS_GENITIVE[m - 1]}`, strong: type?.name ?? '' }
    }
  }

  function handleAvatarClick() {
    fileInputRef.current?.click()
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) uploadAvatar.mutate(file)
  }

  return (
    <div className="screen">
      <div className="screen-body">
        <div className="hero">
          <img className="ph" src="/brand/hero.jpg" alt="" />
          <div className="logo-pill">
            <img src="/brand/logo.png" alt="Into the Climb" />
          </div>
          <button
            onClick={() => signOut()}
            style={{
              position: 'absolute',
              top: 52,
              right: 18,
              zIndex: 2,
              background: 'rgba(242,235,220,.86)',
              WebkitBackdropFilter: 'blur(8px)',
              backdropFilter: 'blur(8px)',
              border: 0,
              borderRadius: 14,
              padding: '8px 14px',
              fontSize: 13,
              fontWeight: 700,
              color: 'var(--clay)',
            }}
          >
            Вийти
          </button>
        </div>

        <div className="screen-pad">
          <div className="who">
            <div className="avatar" aria-label="Фото профілю, натисніть щоб змінити" onClick={handleAvatarClick} style={{ cursor: 'pointer' }}>
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt="" />
              ) : (
                initials(profile.full_name)
              )}
              <span className="cam">
                <Icon name="cam" />
              </span>
            </div>
            <div>
              <h2>{profile.full_name}</h2>
              <div className="meta">
                {profile.gym ? `Скеледром «${profile.gym}»` : ''}
                <br />
                {profile.grade_rp ? `RP ${profile.grade_rp}` : ''}
                {profile.grade_os ? `, онсайт ${profile.grade_os}` : ''}
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
          </div>

          {nextLabel && (
            <div className="card next">
              <div className="when">
                <small>{nextLabel.small}</small>
                <strong>{nextLabel.strong}</strong>
              </div>
              <button className="go" aria-label="Відкрити тренування" onClick={() => navigate(`/training/${nextTraining!.date}`)}>
                <Icon name="arrow" />
              </button>
            </div>
          )}

          <div className="card plan">
            <div className="plan-top">
              <div>
                <div className="label">План на {MONTH_NAMES[now.getMonth()].toLowerCase()}</div>
                <div className="num">
                  {planDone}
                  <small> з {planTotal}</small>
                </div>
              </div>
            </div>
            <MonthRoute trainings={own} types={types} todayIso={today} />
            {breakdownRows.length > 0 && (
              <>
                <button
                  className="expand"
                  aria-expanded={breakdownOpen}
                  aria-controls="bd"
                  onClick={() => setBreakdownOpen((v) => !v)}
                >
                  Розбивка за типами
                  <Icon name="down" />
                </button>
                <div className="breakdown" id="bd" hidden={!breakdownOpen}>
                  {breakdownRows.map((r) => (
                    <div className="bk" key={r.type.id}>
                      <HoldIcon holdShape={r.type.hold_shape} color={r.type.color} />
                      <div>
                        <div className="t">{r.type.name}</div>
                        <div className="bar">
                          <i style={{ width: `${(r.done / r.total) * 100}%`, background: r.type.color }} />
                        </div>
                      </div>
                      <div className="v">
                        {r.done} з {r.total}
                      </div>
                    </div>
                  ))}
                  {funTrainings.length > 0 && (
                    <div className="bk">
                      <HoldIcon holdShape="h5" color="var(--sage)" />
                      <div>
                        <div className="t">Фан-тренування</div>
                        <div className="bar">
                          <i
                            style={{
                              width: '100%',
                              background:
                                'repeating-linear-gradient(90deg,var(--sage) 0 8px,transparent 8px 11px)',
                            }}
                          />
                        </div>
                      </div>
                      <div className="v">
                        {funTrainings.length} сесій
                        <br />
                        {funHours.toFixed(1).replace('.', ',')} год
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          <div className="duo">
            <div className="card hours">
              <div className="label" style={{ color: 'rgba(242,235,220,.75)' }}>
                У залі за місяць
              </div>
              <div className="big">
                {totalHours.toFixed(1).replace('.', ',')}
                <span style={{ fontSize: 18, fontWeight: 700 }}> год</span>
              </div>
              {funHours > 0 && <small>з них {funHours.toFixed(1).replace('.', ',')} год на фан-тренуваннях</small>}
            </div>
            {profile.coach_note && (
              <div className="card note">
                <div className="from">Нотатка від тренера</div>
                <p>{profile.coach_note}</p>
              </div>
            )}
          </div>

          {push.supported && push.state !== 'denied' && (
            <div className="card" style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 14 }}>Нагадування про тренування</div>
                <div style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 2 }}>
                  {push.state === 'subscribed'
                    ? 'Увімкнено — вранці нагадаємо, якщо сьогодні є тренування'
                    : 'Отримувати push у день тренування'}
                </div>
              </div>
              {push.state === 'subscribed' ? (
                <button className="btn-link" onClick={() => push.unsubscribe()} disabled={push.loading}>
                  Вимкнути
                </button>
              ) : (
                <button className="btn-link" onClick={() => push.subscribe()} disabled={push.loading}>
                  Увімкнути
                </button>
              )}
            </div>
          )}
        </div>
      </div>
      <StudentTabBar />
    </div>
  )
}
