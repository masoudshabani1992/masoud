import * as React from 'react'

export interface InstallPromptProps {
  visible?: boolean
  onDismiss?: () => void
  onInstall?: () => void
}

/**
 * بنر نصب برنامه مانوش.
 * وقتی `beforeinstallprompt` فایرفاکس/کروم Fired شد ( یعنی سایت قابل نصب است ),
 * این بنر در پایین صفحه نمایش داده می‌شود و کاربر با زدن «نصب» می‌تواند PWA را نصب کند.
 */
export const InstallPrompt: React.FC<InstallPromptProps> = ({
  visible = true,
  onDismiss,
  onInstall,
}) => {
  const [deferred, setDeferred] = React.useState<Promise<any> | null>(null)
  const [shown, setShown] = React.useState(false)

  React.useEffect(() => {
    const handler = (e: Event) => {
      // نمایش بنر نصب هنگام لود سایت در مرورگر (نه نصب‌شده)
      e.preventDefault()
      setDeferred(e as any)
      setShown(true)
    }

    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!deferred) return
    try {
      const result = await (deferred as any).prompt()
      const choice = await (deferred as any).userChoice
      if (choice.outcome === 'accepted') {
        onInstall?.()
      }
      setShown(false)
      onDismiss?.()
    } catch {
      setShown(false)
      onDismiss?.()
    }
  }

  if (!visible || !shown) return null

  return (
    <div
      className="fixed inset-x-0 bottom-4 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-3 px-4 py-3 rounded-2xl bg-white border border-green-200 shadow-xl text-right"
      role="alert"
      aria-label="نصب برنامه مانوش"
    >
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold">
        M
      </div>
      <div className="flex-1 min-w-0 text-sm leading-snug">
        <div className="font-semibold text-gray-900">نصب برنامه مانوش ارگانیک</div>
        <div className="text-gray-600 mt-0.5">
          برای خرید سریع‌تر و دسترسی آفلاین، برنامه را در صفحه اصلی نصب کنید.
        </div>
      </div>
      <button
        onClick={handleInstall}
        className="flex-shrink-0 rounded-xl bg-green-600 px-4 py-2 text-white text-sm font-semibold hover:bg-green-700 transition"
      >
        نصب
      </button>
      <button
        onClick={() => {
          setShown(false)
          onDismiss?.()
        }}
        className="flex-shrink-0 ml-2 text-gray-400 hover:text-gray-700"
        aria-label="بستن بنر"
      >
        ×
      </button>
    </div>
  )
}
