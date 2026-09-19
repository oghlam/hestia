import { useEffect, useState } from 'react'

export type Theme = 'light' | 'dark'

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === 'undefined') return 'light'
    const saved = localStorage.getItem('hestia-theme') as Theme | null
    if (saved === 'light' || saved === 'dark') return saved
    return 'light'
  })

  useEffect(() => {
    const root = document.documentElement
    root.setAttribute('data-theme', theme)
    localStorage.setItem('hestia-theme', theme)
  }, [theme])

  const toggle = () => setTheme((t) => (t === 'light' ? 'dark' : 'light'))

  return { theme, setTheme, toggle }
}
