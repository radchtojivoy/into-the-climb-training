import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

const HERO_PHOTO_KEY = 'hero_photo_url'

async function fetchHeroPhotoUrl(): Promise<string | null> {
  const { data, error } = await supabase
    .from('app_settings')
    .select('value')
    .eq('key', HERO_PHOTO_KEY)
    .maybeSingle()
  if (error) throw error
  return data?.value ?? null
}

export function useHeroPhoto() {
  return useQuery({
    queryKey: ['app-settings', HERO_PHOTO_KEY],
    queryFn: fetchHeroPhotoUrl,
  })
}

export function useUploadHeroPhoto() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (file: File) => {
      const ext = file.name.split('.').pop() ?? 'jpg'
      const path = `hero.${ext}`

      const { error: uploadError } = await supabase.storage.from('brand').upload(path, file, { upsert: true })
      if (uploadError) throw uploadError

      const { data: publicUrlData } = supabase.storage.from('brand').getPublicUrl(path)
      const heroUrl = `${publicUrlData.publicUrl}?t=${Date.now()}`

      const { error: updateError } = await supabase
        .from('app_settings')
        .upsert({ key: HERO_PHOTO_KEY, value: heroUrl }, { onConflict: 'key' })
      if (updateError) throw updateError

      return heroUrl
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['app-settings', HERO_PHOTO_KEY] })
    },
  })
}
