import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom/client'
import App from './ConnectedApp'
import './index.css'
import './storefront-alignment.css'
import installStorefrontAdapter from './storefrontAdapter'
import { initStorefrontSeo } from './seo/storefrontSeo'
import { initGa4Analytics } from './analytics/ga4'

const DEPLOY_CHECK_COMMIT = '3bc5712'

function findHeaderRails() {
  const header = document.querySelector('#root header')
  if (!header) return null
  const buttons = Array.from(header.querySelectorAll('button'))
  const logo = buttons.find((button) => String(button.textContent || '').replace(/\s+/g, '').includes('HOLOPRINT'))
  const cart = buttons.find((button) => String(button.textContent || '').includes('£')) || buttons[buttons.length - 1]
  if (!logo || !cart) return null
  const logoRect = logo.getBoundingClientRect()
  const cartRect = cart.getBoundingClientRect()
  const left = Math.max(16, Math.round(logoRect.left))
  const right = Math.min(window.innerWidth - 16, Math.round(cartRect.right))
  const width = Math.max(320, right - left)
  return { left, right, width }
}

function applyStorefrontAlignment() {
  if (typeof document === 'undefined') return { count: 0, width: 0 }
  const root = document.getElementById('root')
  if (!root) return { count: 0, width: 0 }
  const rails = findHeaderRails()
  if (!rails) return { count: 0, width: 0 }

  const selectors = [
    'section > div.mx-auto.w-full',
    'footer > div.mx-auto.w-full',
    'footer div.mx-auto.w-full',
    'main > div.mx-auto.w-full',
  ]

  let count = 0
  root.querySelectorAll(selectors.join(',')).forEach((node) => {
    const el = node
    const insideHeader = Boolean(el.closest('header'))
    if (insideHeader) return
    el.style.setProperty('box-sizing', 'border-box', 'important')
    el.style.setProperty('max-width', 'none', 'important')
    el.style.setProperty('width', `${rails.width}px`, 'important')
    el.style.setProperty('margin-left', `${rails.left}px`, 'important')
    el.style.setProperty('margin-right', '0', 'important')
    el.style.setProperty('padding-left', '0', 'important')
    el.style.setProperty('padding-right', '0', 'important')
    el.dataset.holoAlignedLeft = String(rails.left)
    el.dataset.holoAlignedRight = String(rails.right)
    count += 1
  })
  window.__holoAlignedShellCount = count
  window.__holoAlignedRails = rails
  return { count, width: rails.width }
}

function StorefrontAlignmentRuntime() {
  const [state, setState] = useState({ count: 0, width: 0 })
  useEffect(() => {
    const run = () => setState(applyStorefrontAlignment())
    run()
    const timers = [50, 250, 750, 1500, 3000].map((ms) => window.setTimeout(run, ms))
    const observer = new MutationObserver(run)
    const root = document.getElementById('root')
    if (root) observer.observe(root, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'style'] })
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
  return <DeployCheckBanner alignedCount={state.count} railWidth={state.width} />
}

function DeployCheckBanner({ alignedCount = 0, railWidth = 0 }) {
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
      frontend {DEPLOY_CHECK_COMMIT} · header rails {railWidth}px · aligned {alignedCount}
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
