export type Theme = 'light' | 'dark'

const KEY = 'amlich.theme'

function prefersDark(): boolean {
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
}

export function getStoredTheme(): Theme | null {
  try {
    const v = localStorage.getItem(KEY)
    return v === 'dark' || v === 'light' ? v : null
  } catch {
    return null
  }
}

export function getInitialTheme(): Theme {
  const stored = getStoredTheme()
  return stored ?? (prefersDark() ? 'dark' : 'light')
}

export function applyTheme(theme: Theme) {
  const root = document.documentElement
  if (theme === 'dark') root.classList.add('dark')
  else root.classList.remove('dark')
  try { localStorage.setItem(KEY, theme) } catch {}
  try { window.dispatchEvent(new CustomEvent('amlich:theme-changed', { detail: { theme } })) } catch {}
}

export function toggleTheme(): Theme {
  const next: Theme = document.documentElement.classList.contains('dark') ? 'light' : 'dark'
  applyTheme(next)
  return next
}
