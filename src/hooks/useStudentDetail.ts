import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { ProfileRow, TrainingRow } from '../lib/database.types'
import { monthRange, todayIso } from '../lib/trainingStatus'

async function fetchStudent(id: string): Promise<ProfileRow> {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', id).single()
  if (error) throw error
  return data
}

export function useStudentDetail(id: string) {
  return useQuery({ queryKey: ['student', id], queryFn: () => fetchStudent(id) })
}

async function fetchMonthTrainings(studentId: string, year: number, month: number): Promise<TrainingRow[]> {
  const { start, end } = monthRange(year, month)
  const { data, error } = await supabase
    .from('trainings')
    .select('*')
    .eq('student_id', studentId)
    .gte('date', start)
    .lte('date', end)
  if (error) throw error
  return data
}

export function useMonthTrainings(studentId: string, year: number, month: number) {
  return useQuery({
    queryKey: ['trainings', studentId, year, month],
    queryFn: () => fetchMonthTrainings(studentId, year, month),
  })
}

export function useStudentStats(studentId: string, year: number, month: number) {
  const { data: trainings } = useMonthTrainings(studentId, year, month)
  const today = todayIso()
  const own = (trainings ?? []).filter((t) => !t.is_fun)
  const planDone = own.filter((t) => t.is_done).length
  const missedCount = own.filter((t) => !t.is_done && t.date < today).length
  const hours = (trainings ?? [])
    .filter((t) => t.is_done && t.start_time && t.end_time)
    .reduce((sum, t) => sum + timeDiffHours(t.start_time!, t.end_time!), 0)
  return { planDone, planTotal: own.length, missedCount, hours }
}

function timeDiffHours(start: string, end: string): number {
  const [sh, sm] = start.split(':').map(Number)
  const [eh, em] = end.split(':').map(Number)
  return (eh * 60 + em - (sh * 60 + sm)) / 60
}

export function useSaveCoachNote(studentId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (note: string) => {
      const { error } = await supabase.from('profiles').update({ coach_note: note }).eq('id', studentId)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['student', studentId] }),
  })
}
