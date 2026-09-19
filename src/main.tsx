import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import './styles.css'
import './map-overrides.css'

// Suppress noisy chrome-extension promise noise (Adobe Acrobat) from polluting HESTIA console — not a HESTIA bug
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (e: PromiseRejectionEvent) => {
    const msg = String((e.reason as Error)?.message ?? e.reason ?? '')
    if (msg.includes('A listener indicated an asynchronous response')) e.preventDefault()
  })
}
// Register PWA Service Worker for Native Mobile Installation
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {})
  })
}

createRoot(document.getElementById('root')!).render(
  <StrictMode><App /></StrictMode>,
)
