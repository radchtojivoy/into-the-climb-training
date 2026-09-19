import { useEffect, useState } from 'react'
import { Icon } from './ui/Icon'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

function isStandalone(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as unknown as { standalone?: boolean }).standalone === true
  )
}

function isIos(): boolean {
  return /iphone|ipad|ipod/i.test(navigator.userAgent)
}

const DISMISS_KEY = 'itc-install-dismissed'

export function InstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null)
  const [showIosHint, setShowIosHint] = useState(false)
  const [dismissed, setDismissed] = useState(() => localStorage.getItem(DISMISS_KEY) === '1')

  useEffect(() => {
    if (isStandalone()) return

    function onPrompt(e: Event) {
      e.preventDefault()
      setDeferred(e as BeforeInstallPromptEvent)
    }
    window.addEventListener('beforeinstallprompt', onPrompt)

    if (isIos()) setShowIosHint(true)

    return () => window.removeEventListener('beforeinstallprompt', onPrompt)
  }, [])

  if (dismissed || isStandalone() || (!deferred && !showIosHint)) return null

  function dismiss() {
    localStorage.setItem(DISMISS_KEY, '1')
    setDismissed(true)
  }

  async function handleInstall() {
    if (!deferred) return
    await deferred.prompt()
    await deferred.userChoice
    setDeferred(null)
  }

  return (
    <div
      style={{
        position: 'fixed',
        left: 16,
        right: 16,
        bottom: 16,
        zIndex: 50,
        background: 'var(--ink)',
        color: 'var(--paper)',
        borderRadius: 20,
        padding: '14px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        boxShadow: '0 12px 30px -10px rgba(0,0,0,.5)',
      }}
    >
      <div style={{ flex: 1, fontSize: 13, lineHeight: 1.4 }}>
        {deferred ? (
          <>
            <strong>Встанови застосунок</strong>
            <div style={{ opacity: 0.75, marginTop: 2 }}>Швидкий доступ з головного екрана</div>
          </>
        ) : (
          <>
            <strong>Встанови застосунок</strong>
            <div style={{ opacity: 0.75, marginTop: 2 }}>Кнопка «Поділитися» → «На екран Домой»</div>
          </>
        )}
      </div>
      {deferred && (
        <button
          onClick={handleInstall}
          style={{
            border: 0,
            background: 'var(--clay)',
            color: 'var(--paper)',
            borderRadius: 999,
            height: 38,
            padding: '0 16px',
            fontWeight: 800,
            fontSize: 13,
            flex: 'none',
          }}
        >
          Встановити
        </button>
      )}
      <button
        onClick={dismiss}
        aria-label="Закрити"
        style={{ border: 0, background: 'transparent', color: 'var(--paper)', opacity: 0.6, flex: 'none', padding: 4 }}
      >
        <Icon name="x" style={{ width: 16, height: 16, display: 'block' }} />
      </button>
    </div>
  )
}
