import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useAuth } from '../auth/AuthProvider'
import type { MaterialCategoryRow, MaterialRow } from '../lib/database.types'

async function fetchCategories(): Promise<MaterialCategoryRow[]> {
  const { data, error } = await supabase.from('material_categories').select('*').order('position')
  if (error) throw error
  return data
}

export function useMaterialCategories() {
  return useQuery({ queryKey: ['material-categories'], queryFn: fetchCategories })
}

export function useCreateCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (name: string) => {
      const { data: existing } = await supabase.from('material_categories').select('position').order('position', { ascending: false }).limit(1)
      const position = (existing?.[0]?.position ?? 0) + 1
      const { data, error } = await supabase.from('material_categories').insert({ name, position }).select('*').single()
      if (error) throw error
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['material-categories'] }),
  })
}

async function fetchMaterials(): Promise<MaterialRow[]> {
  const { data, error } = await supabase.from('materials').select('*').order('position')
  if (error) throw error
  return data
}

export function useMaterials() {
  return useQuery({ queryKey: ['materials'], queryFn: fetchMaterials })
}

async function fetchMaterial(id: string): Promise<MaterialRow> {
  const { data, error } = await supabase.from('materials').select('*').eq('id', id).single()
  if (error) throw error
  return data
}

export function useMaterial(id: string) {
  return useQuery({ queryKey: ['material', id], queryFn: () => fetchMaterial(id), enabled: !!id })
}

export function useSaveMaterial() {
  const { session } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: {
      id?: string
      categoryId: string
      title: string
      summary: string
      body: unknown
      isPublished: boolean
    }) => {
      if (!session) throw new Error('Немає сесії')
      if (payload.id) {
        const { error } = await supabase
          .from('materials')
          .update({
            category_id: payload.categoryId,
            title: payload.title,
            summary: payload.summary || null,
            body: payload.body,
            is_published: payload.isPublished,
          })
          .eq('id', payload.id)
        if (error) throw error
        return payload.id
      }
      const { data: existing } = await supabase.from('materials').select('position').order('position', { ascending: false }).limit(1)
      const position = (existing?.[0]?.position ?? 0) + 1
      const { data, error } = await supabase
        .from('materials')
        .insert({
          category_id: payload.categoryId,
          title: payload.title,
          summary: payload.summary || null,
          body: payload.body,
          is_published: payload.isPublished,
          position,
          created_by: session.user.id,
        })
        .select('id')
        .single()
      if (error) throw error
      return data.id
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materials'] })
      queryClient.invalidateQueries({ queryKey: ['material'] })
    },
  })
}

export function useDeleteMaterial() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('materials').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['materials'] }),
  })
}
