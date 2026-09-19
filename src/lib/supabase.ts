import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Не задані VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY. Створіть файл .env.local за зразком .env.local.example.',
  )
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)
