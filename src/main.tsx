import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import './styles.css'
import './map-overrides.css'

// Register PWA Service Worker for Native Mobile Installation
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => {
        console.log('HESTIA PWA ServiceWorker registered with scope:', reg.scope)
      })
      .catch((err) => {
        console.warn('HESTIA PWA ServiceWorker registration failed:', err)
      })
  })
}

createRoot(document.getElementById('root')!).render(
  <StrictMode><App /></StrictMode>,
)
