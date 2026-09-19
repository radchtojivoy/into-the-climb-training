import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { TrainingTypeRow } from '../lib/database.types'

async function fetchTrainingTypes(): Promise<TrainingTypeRow[]> {
  const { data, error } = await supabase.from('training_types').select('*').order('position')
  if (error) throw error
  return data
}

export function useTrainingTypes() {
  return useQuery({
    queryKey: ['training-types'],
    queryFn: fetchTrainingTypes,
    staleTime: Infinity,
  })
}
