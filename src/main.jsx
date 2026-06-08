import React, { useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import App from './ConnectedApp'
import './index.css'
import './storefront-alignment.css'
import installStorefrontAdapter from './storefrontAdapter'
import { initStorefrontSeo } from './seo/storefrontSeo'
import { initGa4Analytics } from './analytics/ga4'

const DEPLOY_CHECK_COMMIT = '3161652'
const STOREFRONT_SHELL_WIDTH = '1360px'

function applyStorefrontAlignment() {
  if (typeof document === 'undefined') return
  const root = document.getElementById('root')
  if (!root) return

  const selectors = [
    'header div.mx-auto.w-full',
    'section div.mx-auto.w-full',
    'footer div.mx-auto.w-full',
    'main div.mx-auto.w-full',
  ]

  root.querySelectorAll(selectors.join(',')).forEach((node) => {
    const el = node
    el.style.maxWidth = STOREFRONT_SHELL_WIDTH
    el.style.width = '100%'
    el.style.marginLeft = 'auto'
    el.style.marginRight = 'auto'
  })
}

function StorefrontAlignmentRuntime() {
  useEffect(() => {
    applyStorefrontAlignment()
    const timers = [50, 250, 750, 1500].map((ms) => window.setTimeout(applyStorefrontAlignment, ms))
    const observer = new MutationObserver(() => applyStorefrontAlignment())
    const root = document.getElementById('root')
    if (root) observer.observe(root, { childList: true, subtree: true })
    window.addEventListener('resize', applyStorefrontAlignment)
    window.addEventListener('locationchange', applyStorefrontAlignment)
    window.addEventListener('popstate', applyStorefrontAlignment)
    return () => {
      timers.forEach((timer) => window.clearTimeout(timer))
      observer.disconnect()
      window.removeEventListener('resize', applyStorefrontAlignment)
      window.removeEventListener('locationchange', applyStorefrontAlignment)
      window.removeEventListener('popstate', applyStorefrontAlignment)
    }
  }, [])
  return null
}

function DeployCheckBanner() {
  return (
    <div
      style={{
        position: 'fixed',
        right: 12,
        bottom: 12,
        zIndex: 2147483647,
        background: '#111827',
        color: '#ffffff',
        fontFamily: 'Inter, system-ui, sans-serif',
        fontSize: 11,
        fontWeight: 800,
        letterSpacing: '0.04em',
        padding: '8px 10px',
        borderRadius: 999,
        boxShadow: '0 10px 30px rgba(0,0,0,0.22)',
        border: '1px solid rgba(255,255,255,0.18)',
        pointerEvents: 'none',
      }}
    >
      frontend deploy check {DEPLOY_CHECK_COMMIT} · shell {STOREFRONT_SHELL_WIDTH}
    </div>
  )
}

// Install SaaS adapter BEFORE app mounts
installStorefrontAdapter()
initStorefrontSeo()
initGa4Analytics()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
    <StorefrontAlignmentRuntime />
    <DeployCheckBanner />
  </React.StrictMode>,
)
