import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { ProfileRow } from '../lib/database.types'
import { monthRange, todayIso } from '../lib/trainingStatus'

export interface StudentWithStats extends ProfileRow {
  planTotal: number
  planDone: number
  planPercent: number
  missedCount: number
  hasTrainingToday: boolean
}

async function fetchPending(): Promise<ProfileRow[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('status', 'pending')
    .eq('role', 'student')
    .order('created_at', { ascending: true })
  if (error) throw error
  return data
}

async function fetchActiveWithStats(): Promise<StudentWithStats[]> {
  const { data: students, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('status', 'active')
    .eq('role', 'student')
    .order('full_name', { ascending: true })
  if (error) throw error

  const now = new Date()
  const { start, end } = monthRange(now.getFullYear(), now.getMonth())
  const today = todayIso()

  const { data: trainings, error: trErr } = await supabase
    .from('trainings')
    .select('student_id,date,is_fun,is_done')
    .gte('date', start)
    .lte('date', end)
  if (trErr) throw trErr

  return students.map((s) => {
    const own = trainings.filter((t) => t.student_id === s.id && !t.is_fun)
    const planDone = own.filter((t) => t.is_done).length
    const missedCount = own.filter((t) => !t.is_done && t.date < today).length
    return {
      ...s,
      planTotal: own.length,
      planDone,
      planPercent: own.length ? Math.round((planDone / own.length) * 100) : 0,
      missedCount,
      hasTrainingToday: own.some((t) => t.date === today),
    }
  })
}

export function usePendingStudents() {
  return useQuery({ queryKey: ['students', 'pending'], queryFn: fetchPending })
}

export function useActiveStudents() {
  return useQuery({ queryKey: ['students', 'active'], queryFn: fetchActiveWithStats })
}
