import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useAuth } from '../auth/AuthProvider'
import { monthRange } from '../lib/trainingStatus'
import type { ExerciseResult, TrainingRow } from '../lib/database.types'

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

export function useMyMonthTrainings(year: number, month: number) {
  const { session } = useAuth()
  const studentId = session?.user.id ?? ''
  return useQuery({
    queryKey: ['my-trainings', studentId, year, month],
    queryFn: () => fetchMonthTrainings(studentId, year, month),
    enabled: !!studentId,
  })
}

async function fetchNextTraining(studentId: string, todayIso: string): Promise<TrainingRow | null> {
  const { data, error } = await supabase
    .from('trainings')
    .select('*')
    .eq('student_id', studentId)
    .eq('is_fun', false)
    .eq('is_done', false)
    .gte('date', todayIso)
    .order('date', { ascending: true })
    .limit(1)
    .maybeSingle()
  if (error) throw error
  return data
}

export function useNextTraining(todayIso: string) {
  const { session } = useAuth()
  const studentId = session?.user.id ?? ''
  return useQuery({
    queryKey: ['next-training', studentId, todayIso],
    queryFn: () => fetchNextTraining(studentId, todayIso),
    enabled: !!studentId,
  })
}

export interface TrainingDetail {
  training: TrainingRow
  warmupItems: { id: string; text: string; is_done: boolean; position: number }[]
  exercises: {
    id: string
    title: string
    description: string | null
    video_url: string | null
    result: ExerciseResult | null
    result_comment: string | null
    position: number
  }[]
}

async function fetchTrainingDetail(studentId: string, date: string, isFun: boolean): Promise<TrainingDetail | null> {
  const { data: training, error } = await supabase
    .from('trainings')
    .select('*')
    .eq('student_id', studentId)
    .eq('date', date)
    .eq('is_fun', isFun)
    .maybeSingle()
  if (error) throw error
  if (!training) return null

  const [{ data: warmup, error: wErr }, { data: exercises, error: eErr }] = await Promise.all([
    supabase.from('warmup_items').select('*').eq('training_id', training.id).order('position'),
    supabase.from('exercises').select('*').eq('training_id', training.id).order('position'),
  ])
  if (wErr) throw wErr
  if (eErr) throw eErr

  return { training, warmupItems: warmup, exercises }
}

export function useMyTrainingDetail(date: string, isFun = false) {
  const { session } = useAuth()
  const studentId = session?.user.id ?? ''
  return useQuery({
    queryKey: ['training-detail', studentId, date, isFun],
    queryFn: () => fetchTrainingDetail(studentId, date, isFun),
    enabled: !!studentId,
  })
}

export function useToggleWarmupItem() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, isDone }: { id: string; isDone: boolean }) => {
      const { error } = await supabase.from('warmup_items').update({ is_done: isDone }).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['training-detail'] }),
  })
}

export function useUpdateExerciseResult() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      id,
      result,
      resultComment,
    }: {
      id: string
      result: ExerciseResult | null
      resultComment: string
    }) => {
      const { error } = await supabase
        .from('exercises')
        .update({ result, result_comment: resultComment || null })
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['training-detail'] }),
  })
}

export function useUpdateTrainingTiming() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      id,
      startTime,
      endTime,
      isDone,
    }: {
      id: string
      startTime?: string | null
      endTime?: string | null
      isDone?: boolean
    }) => {
      const patch: Partial<TrainingRow> = {}
      if (startTime !== undefined) patch.start_time = startTime
      if (endTime !== undefined) patch.end_time = endTime
      if (isDone !== undefined) patch.is_done = isDone
      const { error } = await supabase.from('trainings').update(patch).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['training-detail'] })
      queryClient.invalidateQueries({ queryKey: ['my-trainings'] })
      queryClient.invalidateQueries({ queryKey: ['next-training'] })
    },
  })
}

export function useCreateFunTraining() {
  const { session } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (date: string) => {
      if (!session) throw new Error('Немає сесії')
      const { data, error } = await supabase
        .from('trainings')
        .insert({
          student_id: session.user.id,
          date,
          type_id: 'fun',
          is_fun: true,
          created_by: session.user.id,
        })
        .select('id')
        .single()
      if (error) throw error
      return data.id
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['training-detail'] })
      queryClient.invalidateQueries({ queryKey: ['my-trainings'] })
    },
  })
}

export function useDeleteFunTraining() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('trainings').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['training-detail'] })
      queryClient.invalidateQueries({ queryKey: ['my-trainings'] })
    },
  })
}
