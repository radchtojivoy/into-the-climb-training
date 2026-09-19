import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useAuth } from '../auth/AuthProvider'
import type { LibraryExerciseRow, TrainingTypeId, WarmupTemplateRow } from '../lib/database.types'

async function fetchLibraryExercises(): Promise<LibraryExerciseRow[]> {
  const { data, error } = await supabase.from('library_exercises').select('*').order('title')
  if (error) throw error
  return data
}

async function fetchWarmupTemplates(): Promise<WarmupTemplateRow[]> {
  const { data, error } = await supabase.from('warmup_templates').select('*').order('title')
  if (error) throw error
  return data
}

export function useLibraryExercises() {
  return useQuery({ queryKey: ['library-exercises'], queryFn: fetchLibraryExercises })
}

export function useWarmupTemplates() {
  return useQuery({ queryKey: ['warmup-templates'], queryFn: fetchWarmupTemplates })
}

export function useSaveLibraryExercise() {
  const { session } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: {
      id?: string
      typeId: TrainingTypeId
      title: string
      description: string
      videoUrl: string
    }) => {
      if (!session) throw new Error('Немає сесії')
      if (payload.id) {
        const { error } = await supabase
          .from('library_exercises')
          .update({
            type_id: payload.typeId,
            title: payload.title,
            description: payload.description || null,
            video_url: payload.videoUrl || null,
          })
          .eq('id', payload.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('library_exercises').insert({
          type_id: payload.typeId,
          title: payload.title,
          description: payload.description || null,
          video_url: payload.videoUrl || null,
          created_by: session.user.id,
        })
        if (error) throw error
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['library-exercises'] }),
  })
}

export function useDeleteLibraryExercise() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('library_exercises').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['library-exercises'] }),
  })
}

export function useSaveWarmupTemplate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: { id?: string; typeId: TrainingTypeId; title: string; items: string[] }) => {
      if (payload.id) {
        const { error } = await supabase
          .from('warmup_templates')
          .update({ type_id: payload.typeId, title: payload.title, items: payload.items })
          .eq('id', payload.id)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('warmup_templates')
          .insert({ type_id: payload.typeId, title: payload.title, items: payload.items })
        if (error) throw error
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['warmup-templates'] }),
  })
}

export function useDeleteWarmupTemplate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('warmup_templates').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['warmup-templates'] }),
  })
}
