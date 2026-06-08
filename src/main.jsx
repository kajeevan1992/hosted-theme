import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom/client'
import App from './ConnectedApp'
import './index.css'
import './storefront-alignment.css'
import installStorefrontAdapter from './storefrontAdapter'
import { initStorefrontSeo } from './seo/storefrontSeo'
import { initGa4Analytics } from './analytics/ga4'

const DEPLOY_CHECK_COMMIT = '27f169a'
const STOREFRONT_SHELL_WIDTH = '1360px'

function applyStorefrontAlignment() {
  if (typeof document === 'undefined') return 0
  const root = document.getElementById('root')
  if (!root) return 0

  const selectors = [
    '[class*="max-w-[1220px]"]',
    '[class*="max-w-[1280px]"]',
    'header [class*="max-w-[1360px]"]',
    'section [class*="max-w-[1360px]"]',
    'footer [class*="max-w-[1360px]"]',
    'main [class*="max-w-[1360px]"]',
    'header div.mx-auto.w-full',
    'section div.mx-auto.w-full',
    'footer div.mx-auto.w-full',
    'main div.mx-auto.w-full',
  ]

  let count = 0
  root.querySelectorAll(selectors.join(',')).forEach((node) => {
    const el = node
    const className = String(el.className || '')
    const looksLikeShell = className.includes('mx-auto') || className.includes('max-w-[')
    if (!looksLikeShell) return
    el.style.maxWidth = STOREFRONT_SHELL_WIDTH
    el.style.width = '100%'
    el.style.marginLeft = 'auto'
    el.style.marginRight = 'auto'
    el.dataset.holoAlignedShell = STOREFRONT_SHELL_WIDTH
    count += 1
  })
  window.__holoAlignedShellCount = count
  return count
}

function StorefrontAlignmentRuntime() {
  const [count, setCount] = useState(0)
  useEffect(() => {
    const run = () => setCount(applyStorefrontAlignment())
    run()
    const timers = [50, 250, 750, 1500, 3000].map((ms) => window.setTimeout(run, ms))
    const observer = new MutationObserver(run)
    const root = document.getElementById('root')
    if (root) observer.observe(root, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] })
    window.addEventListener('resize', run)
    window.addEventListener('locationchange', run)
    window.addEventListener('popstate', run)
    return () => {
      timers.forEach((timer) => window.clearTimeout(timer))
      observer.disconnect()
      window.removeEventListener('resize', run)
      window.removeEventListener('locationchange', run)
      window.removeEventListener('popstate', run)
    }
  }, [])
  return <DeployCheckBanner alignedCount={count} />
}

function DeployCheckBanner({ alignedCount = 0 }) {
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
      frontend {DEPLOY_CHECK_COMMIT} · shell {STOREFRONT_SHELL_WIDTH} · aligned {alignedCount}
    </div>
  )
}

installStorefrontAdapter()
initStorefrontSeo()
initGa4Analytics()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
    <StorefrontAlignmentRuntime />
  </React.StrictMode>,
)
