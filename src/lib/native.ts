/**
 * Optional native integrations. These are no-ops on the web and only
 * activate when running inside the Capacitor Android shell.
 */
export async function initNative() {
  // @ts-expect-error Capacitor is injected at runtime in the native shell
  const isNative = window.Capacitor?.isNativePlatform?.() ?? false
  if (!isNative) return

  try {
    const { App } = await import('@capacitor/app')
    App.addListener('backButton', ({ canGoBack }) => {
      if (window.location.pathname === '/' || !canGoBack) {
        App.exitApp()
      } else {
        window.history.back()
      }
    })
  } catch {
    /* plugin not available */
  }
}
