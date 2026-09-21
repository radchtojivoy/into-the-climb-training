import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useAuth } from '../auth/AuthProvider'
import type { ExerciseResult, ExerciseRow, TrainingRow, TrainingTypeId, WarmupItemRow } from '../lib/database.types'

export interface EditableWarmupItem {
  key: string
  text: string
  isDone: boolean
}

export interface EditableExercise {
  key: string
  title: string
  description: string
  videoUrl: string
  libraryExerciseId: string | null
  result: ExerciseResult | null
  resultComment: string
}

export interface TrainingEditorData {
  training: TrainingRow | null
  warmupItems: EditableWarmupItem[]
  exercises: EditableExercise[]
}

async function fetchTrainingEditorData(studentId: string, date: string): Promise<TrainingEditorData> {
  const { data: training, error } = await supabase
    .from('trainings')
    .select('*')
    .eq('student_id', studentId)
    .eq('date', date)
    .eq('is_fun', false)
    .maybeSingle()
  if (error) throw error

  if (!training) return { training: null, warmupItems: [], exercises: [] }

  const [{ data: warmup, error: wErr }, { data: exercises, error: eErr }] = await Promise.all([
    supabase.from('warmup_items').select('*').eq('training_id', training.id).order('position'),
    supabase.from('exercises').select('*').eq('training_id', training.id).order('position'),
  ])
  if (wErr) throw wErr
  if (eErr) throw eErr

  return {
    training,
    warmupItems: (warmup as WarmupItemRow[]).map((w) => ({ key: w.id, text: w.text, isDone: w.is_done })),
    exercises: (exercises as ExerciseRow[]).map((e) => ({
      key: e.id,
      title: e.title,
      description: e.description ?? '',
      videoUrl: e.video_url ?? '',
      libraryExerciseId: e.library_exercise_id,
      result: e.result,
      resultComment: e.result_comment ?? '',
    })),
  }
}

export function useTrainingEditorData(studentId: string, date: string) {
  return useQuery({
    queryKey: ['training-editor', studentId, date],
    queryFn: () => fetchTrainingEditorData(studentId, date),
  })
}

interface SavePayload {
  typeId: TrainingTypeId
  warmupItems: EditableWarmupItem[]
  exercises: EditableExercise[]
  warmupNote: string
  originalWarmupIds: string[]
  originalExerciseIds: string[]
}

export function useSaveTraining(studentId: string, date: string, existingTrainingId: string | null) {
  const { session } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      typeId,
      warmupItems,
      exercises,
      warmupNote,
      originalWarmupIds,
      originalExerciseIds,
    }: SavePayload) => {
      if (!session) throw new Error('Немає сесії')

      let trainingId = existingTrainingId
      if (trainingId) {
        const { error } = await supabase
          .from('trainings')
          .update({ type_id: typeId, warmup_note: warmupNote || null })
          .eq('id', trainingId)
        if (error) throw error
      } else {
        const { data, error } = await supabase
          .from('trainings')
          .insert({
            student_id: studentId,
            date,
            type_id: typeId,
            is_fun: false,
            warmup_note: warmupNote || null,
            created_by: session.user.id,
          })
          .select('id')
          .single()
        if (error) throw error
        trainingId = data.id
      }

      // Розминку й вправи оновлюємо через upsert за id (а не видалення+вставка
      // наново) — інакше відмітки виконання й результати учня стирались би
      // щоразу, коли тренер зберігає тренування.
      const currentWarmupIds = new Set(warmupItems.map((w) => w.key))
      const removedWarmupIds = originalWarmupIds.filter((id) => !currentWarmupIds.has(id))
      if (removedWarmupIds.length) {
        const { error } = await supabase.from('warmup_items').delete().in('id', removedWarmupIds)
        if (error) throw error
      }
      if (warmupItems.length) {
        const rows = warmupItems.map((w, i) => ({ id: w.key, training_id: trainingId, position: i, text: w.text }))
        const { error } = await supabase.from('warmup_items').upsert(rows, { onConflict: 'id' })
        if (error) throw error
      }

      const currentExerciseIds = new Set(exercises.map((e) => e.key))
      const removedExerciseIds = originalExerciseIds.filter((id) => !currentExerciseIds.has(id))
      if (removedExerciseIds.length) {
        const { error } = await supabase.from('exercises').delete().in('id', removedExerciseIds)
        if (error) throw error
      }
      if (exercises.length) {
        const rows = exercises.map((e, i) => ({
          id: e.key,
          training_id: trainingId,
          position: i,
          title: e.title,
          description: e.description || null,
          video_url: e.videoUrl || null,
          library_exercise_id: e.libraryExerciseId,
        }))
        const { error } = await supabase.from('exercises').upsert(rows, { onConflict: 'id' })
        if (error) throw error
      }

      return trainingId
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['training-editor', studentId, date] })
      queryClient.invalidateQueries({ queryKey: ['trainings', studentId] })
      queryClient.invalidateQueries({ queryKey: ['students'] })
    },
  })
}
