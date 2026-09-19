import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../auth/AuthProvider'

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)))
}

export type PushSupportState = 'unsupported' | 'unsubscribed' | 'subscribed' | 'denied'

export function usePushNotifications() {
  const { session } = useAuth()
  const [state, setState] = useState<PushSupportState>('unsubscribed')
  const [loading, setLoading] = useState(false)

  const supported = 'serviceWorker' in navigator && 'PushManager' in window

  const refresh = useCallback(async () => {
    if (!supported) {
      setState('unsupported')
      return
    }
    if (Notification.permission === 'denied') {
      setState('denied')
      return
    }
    const reg = await navigator.serviceWorker.ready
    const sub = await reg.pushManager.getSubscription()
    setState(sub ? 'subscribed' : 'unsubscribed')
  }, [supported])

  useEffect(() => {
    refresh()
  }, [refresh])

  async function subscribe() {
    if (!supported || !session) return
    setLoading(true)
    try {
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') {
        setState('denied')
        return
      }
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(import.meta.env.VITE_VAPID_PUBLIC_KEY) as BufferSource,
      })
      const json = sub.toJSON()
      await supabase.from('push_subscriptions').insert({
        user_id: session.user.id,
        endpoint: json.endpoint!,
        p256dh: json.keys!.p256dh,
        auth: json.keys!.auth,
      })
      setState('subscribed')
    } finally {
      setLoading(false)
    }
  }

  async function unsubscribe() {
    if (!supported) return
    setLoading(true)
    try {
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.getSubscription()
      if (sub) {
        await supabase.from('push_subscriptions').delete().eq('endpoint', sub.endpoint)
        await sub.unsubscribe()
      }
      setState('unsubscribed')
    } finally {
      setLoading(false)
    }
  }

  return { state, loading, subscribe, unsubscribe, supported }
}
