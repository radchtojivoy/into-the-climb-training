import { useMutation } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useAuth } from '../auth/AuthProvider'

export function useUploadMaterialImage() {
  const { session } = useAuth()
  return useMutation({
    mutationFn: async (file: File) => {
      if (!session) throw new Error('Немає сесії')
      const ext = file.name.split('.').pop() ?? 'jpg'
      const path = `${session.user.id}/${crypto.randomUUID()}.${ext}`
      const { error } = await supabase.storage.from('materials').upload(path, file)
      if (error) throw error
      const { data } = supabase.storage.from('materials').getPublicUrl(path)
      return data.publicUrl
    },
  })
}
