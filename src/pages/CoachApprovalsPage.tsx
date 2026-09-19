import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../auth/AuthProvider'
import type { ProfileRow } from '../lib/database.types'

async function fetchPending(): Promise<ProfileRow[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: true })
  if (error) throw error
  return data
}

export function CoachApprovalsPage() {
  const { profile, session, signOut } = useAuth()
  const queryClient = useQueryClient()
  const [busyId, setBusyId] = useState<string | null>(null)

  const { data: pending, isLoading } = useQuery({ queryKey: ['pending-students'], queryFn: fetchPending })

  async function handleAccept(studentId: string) {
    if (!session) return
    setBusyId(studentId)
    await supabase
      .from('profiles')
      .update({ status: 'active', coach_id: session.user.id })
      .eq('id', studentId)
    setBusyId(null)
    queryClient.invalidateQueries({ queryKey: ['pending-students'] })
  }

  return (
    <div className="screen">
      <div className="top-bar" style={{ justifyContent: 'space-between' }}>
        <div>
          <h2 className="h-big" style={{ fontSize: 26 }}>Привіт, {profile?.full_name ?? 'тренер'}</h2>
        </div>
        <button className="btn-link" onClick={() => signOut()}>
          Вийти
        </button>
      </div>

      <div className="screen-pad" style={{ flex: 1, paddingTop: 18, paddingBottom: 100 }}>
        <p className="label" style={{ marginBottom: 12 }}>
          Заявки на підтвердження {pending ? `(${pending.length})` : ''}
        </p>

        {isLoading && <div className="spinner" />}

        {!isLoading && pending?.length === 0 && (
          <p style={{ color: 'var(--muted)', fontSize: 14 }}>Нових заявок немає.</p>
        )}

        <div style={{ display: 'grid', gap: 10 }}>
          {pending?.map((student) => (
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
        </div>
      </div>
    </div>
  )
}
