export type UserRole = 'coach' | 'student'
export type UserStatus = 'pending' | 'active' | 'archived'
export type TrainingTypeId = 'sila' | 'zfp' | 'tech' | 'coord' | 'end' | 'fun'
export type ExerciseResult = 'ok' | 'partial' | 'fail'

// Примітка: тут навмисно `type`, а не `interface` — типи supabase-js
// перевіряють Row/Insert/Update через `extends Record<string, unknown>`,
// а це працює лише для type-літералів (interface такий чек не проходить).

export type ProfileRow = {
  id: string
  role: UserRole
  status: UserStatus
  coach_id: string | null
  full_name: string
  birth_date: string | null
  gym: string | null
  telegram: string | null
  weight_kg: number | null
  height_cm: number | null
  grade_rp: string | null
  grade_os: string | null
  avatar_url: string | null
  coach_note: string | null
  created_at: string
}

export type TrainingTypeRow = {
  id: TrainingTypeId
  name: string
  color: string
  hold_shape: string
  is_fun: boolean
  position: number
}

export type TrainingRow = {
  id: string
  student_id: string
  date: string
  type_id: TrainingTypeId
  is_fun: boolean
  start_time: string | null
  end_time: string | null
  is_done: boolean
  created_by: string
  created_at: string
  updated_at: string
}

export type WarmupItemRow = {
  id: string
  training_id: string
  position: number
  text: string
  is_done: boolean
}

export type ExerciseRow = {
  id: string
  training_id: string
  position: number
  title: string
  description: string | null
  video_url: string | null
  library_exercise_id: string | null
  result: ExerciseResult | null
  result_comment: string | null
}

export type LibraryExerciseRow = {
  id: string
  type_id: TrainingTypeId
  title: string
  description: string | null
  video_url: string | null
  created_by: string
}

export type WarmupTemplateRow = {
  id: string
  type_id: TrainingTypeId
  title: string
  items: string[]
}

export type MaterialCategoryRow = {
  id: string
  name: string
  position: number
}

export type MaterialRow = {
  id: string
  category_id: string
  title: string
  summary: string | null
  body: unknown
  position: number
  is_published: boolean
  created_by: string
  created_at: string
  updated_at: string
}

export type PushSubscriptionRow = {
  id: string
  user_id: string
  endpoint: string
  p256dh: string
  auth: string
  created_at: string
}

export type AppSettingRow = {
  key: string
  value: string | null
  updated_at: string
}

type Table<Row, Insert, Update> = {
  Row: Row
  Insert: Insert
  Update: Update
  Relationships: []
}

// Мінімальний опис для supabase-js. Розширюємо в міру потреби.
export type Database = {
  public: {
    Tables: {
      profiles: Table<ProfileRow, Partial<ProfileRow> & { id: string; full_name: string }, Partial<ProfileRow>>
      training_types: Table<TrainingTypeRow, TrainingTypeRow, Partial<TrainingTypeRow>>
      trainings: Table<TrainingRow, Partial<TrainingRow>, Partial<TrainingRow>>
      warmup_items: Table<WarmupItemRow, Partial<WarmupItemRow>, Partial<WarmupItemRow>>
      exercises: Table<ExerciseRow, Partial<ExerciseRow>, Partial<ExerciseRow>>
      library_exercises: Table<LibraryExerciseRow, Partial<LibraryExerciseRow>, Partial<LibraryExerciseRow>>
      warmup_templates: Table<WarmupTemplateRow, Partial<WarmupTemplateRow>, Partial<WarmupTemplateRow>>
      material_categories: Table<MaterialCategoryRow, Partial<MaterialCategoryRow>, Partial<MaterialCategoryRow>>
      materials: Table<MaterialRow, Partial<MaterialRow>, Partial<MaterialRow>>
      push_subscriptions: Table<
        PushSubscriptionRow,
        Partial<PushSubscriptionRow> & { user_id: string; endpoint: string; p256dh: string; auth: string },
        Partial<PushSubscriptionRow>
      >
      app_settings: Table<AppSettingRow, Partial<AppSettingRow> & { key: string }, Partial<AppSettingRow>>
    }
    Views: Record<string, never>
    Functions: Record<string, never>
  }
}
