// Vercel Cron: раз на день надсилає push-нагадування учням, у яких сьогодні
// заплановане (ще не виконане) тренування. Викликається лише самим Vercel Cron
// (перевіряємо секрет), тримає service_role — це серверний код, не фронтенд.
import { createClient } from '@supabase/supabase-js'
import webpush from 'web-push'

export const config = { runtime: 'nodejs' }

export default async function handler(req: { headers: Record<string, string | string[] | undefined> }, res: {
  status: (code: number) => { json: (body: unknown) => void; end: () => void }
}) {
  const cronSecret = process.env.CRON_SECRET
  const auth = req.headers.authorization
  if (cronSecret && auth !== `Bearer ${cronSecret}`) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }

  const supabaseUrl = process.env.SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const vapidPublic = process.env.VAPID_PUBLIC_KEY
  const vapidPrivate = process.env.VAPID_PRIVATE_KEY

  if (!supabaseUrl || !serviceRoleKey || !vapidPublic || !vapidPrivate) {
    res.status(500).json({ error: 'Не задані змінні середовища' })
    return
  }

  webpush.setVapidDetails('mailto:hello@intotheclimb.example', vapidPublic, vapidPrivate)
  const supabase = createClient(supabaseUrl, serviceRoleKey)

  const today = new Date().toISOString().slice(0, 10)

  const { data: trainings, error } = await supabase
    .from('trainings')
    .select('student_id, training_types(name)')
    .eq('date', today)
    .eq('is_fun', false)
    .eq('is_done', false)

  if (error) {
    res.status(500).json({ error: error.message })
    return
  }

  let sent = 0
  let removed = 0

  for (const training of trainings ?? []) {
    const typeName = (training as unknown as { training_types: { name: string } | null }).training_types?.name ?? 'тренування'
    const { data: subs } = await supabase
      .from('push_subscriptions')
      .select('*')
      .eq('user_id', training.student_id)

    for (const sub of subs ?? []) {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          JSON.stringify({
            title: 'Сьогодні тренування',
            body: `${typeName} — не забудь відмітити виконання`,
            url: '/calendar',
          }),
        )
        sent++
      } catch (err) {
        const statusCode = (err as { statusCode?: number }).statusCode
        if (statusCode === 404 || statusCode === 410) {
          await supabase.from('push_subscriptions').delete().eq('id', sub.id)
          removed++
        }
      }
    }
  }

  res.status(200).json({ sent, removed, trainingsToday: trainings?.length ?? 0 })
}
