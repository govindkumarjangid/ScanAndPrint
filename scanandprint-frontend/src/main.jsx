import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from './lib/queryClient'
import './index.css'
import App from './App.jsx'

// Auto-recover from stale chunks after new production deployments
window.addEventListener('vite:preloadError', (event) => {
  console.warn('[Vite] Stale chunk detected after deployment. Reloading with fresh bundle...', event)
  const lastReload = sessionStorage.getItem('last_chunk_reload')
  const now = Date.now()
  if (!lastReload || now - parseInt(lastReload, 10) > 10000) {
    sessionStorage.setItem('last_chunk_reload', String(now))
    window.location.reload()
  }
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
)
