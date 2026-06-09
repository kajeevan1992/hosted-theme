import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom/client'
import App from './ConnectedApp'
import './index.css'
import './storefront-alignment.css'
import './mobile-responsive.css'
import installStorefrontAdapter from './storefrontAdapter'
import { initStorefrontSeo } from './seo/storefrontSeo'
import { initGa4Analytics } from './analytics/ga4'

const DEPLOY_CHECK_COMMIT = 'df7f48c'
const DESKTOP_RAIL_MIN_WIDTH = 1024
const DESKTOP_SHELL_GUTTER = 64

function isDesktopRails() {
  return typeof window !== 'undefined' && window.innerWidth >= DESKTOP_RAIL_MIN_WIDTH
}

function findHeaderContentRail() {
  const header = document.querySelector('#root header')
  if (!header) return null
  const buttons = Array.from(header.querySelectorAll('button'))
  const logo = buttons.find((button) => String(button.textContent || '').replace(/\s+/g, '').includes('HOLOPRINT'))
  const cart = buttons.find((button) => String(button.textContent || '').includes('£')) || buttons[buttons.length - 1]
  if (!logo || !cart) return null
  const logoRect = logo.getBoundingClientRect()
  const cartRect = cart.getBoundingClientRect()
  const rawWidth = Math.round(cartRect.right - logoRect.left)
  const maxWidth = Math.max(900, window.innerWidth - DESKTOP_SHELL_GUTTER)
  const width = Math.max(900, Math.min(rawWidth, maxWidth))
  const left = Math.max(16, Math.round((window.innerWidth - width) / 2))
  const right = Math.round(left + width)
  return { left, right, width }
}

function clearDesktopRailStyles(root) {
  const selectors = [
    'header > div.mx-auto.w-full',
    'section > div.mx-auto.w-full',
    'footer > div.mx-auto.w-full',
    'footer div.mx-auto.w-full',
    'main > div.mx-auto.w-full',
    'header .absolute.left-0.right-0.top-full.hidden.xl\\:block',
  ]
  root.querySelectorAll(selectors.join(',')).forEach((node) => {
    const el = node
    ;['box-sizing', 'max-width', 'width', 'margin-left', 'margin-right', 'padding-left', 'padding-right', 'left', 'right'].forEach((prop) => el.style.removeProperty(prop))
    delete el.dataset.holoAlignedLeft
    delete el.dataset.holoAlignedRight
    delete el.dataset.holoAlignedMenu
  })
}

function applyShellStyles(el, shell) {
  el.style.setProperty('box-sizing', 'border-box', 'important')
  el.style.setProperty('max-width', 'none', 'important')
  el.style.setProperty('width', `${shell.width}px`, 'important')
  el.style.setProperty('margin-left', 'auto', 'important')
  el.style.setProperty('margin-right', 'auto', 'important')
  el.style.setProperty('padding-left', '0', 'important')
  el.style.setProperty('padding-right', '0', 'important')
  el.dataset.holoAlignedLeft = String(shell.left)
  el.dataset.holoAlignedRight = String(shell.right)
}

function alignMegaMenus(root, shell) {
  let count = 0
  root.querySelectorAll('header .absolute.left-0.right-0.top-full.hidden.xl\\:block').forEach((node) => {
    const el = node
    const parentRect = (el.offsetParent || document.body).getBoundingClientRect()
    const left = Math.round(shell.left - parentRect.left)
    el.style.setProperty('left', `${left}px`, 'important')
    el.style.setProperty('right', 'auto', 'important')
    el.style.setProperty('width', `${shell.width}px`, 'important')
    el.style.setProperty('max-width', 'none', 'important')
    el.dataset.holoAlignedMenu = String(shell.width)
    count += 1
  })
  window.__holoAlignedMenuCount = count
  return count
}

function applyStorefrontAlignment() {
  if (typeof document === 'undefined') return { count: 0, width: 0, menuCount: 0 }
  const root = document.getElementById('root')
  if (!root) return { count: 0, width: 0, menuCount: 0 }

  if (!isDesktopRails()) {
    clearDesktopRailStyles(root)
    window.__holoAlignedShellCount = 0
    window.__holoAlignedRails = null
    window.__holoAlignedMenuCount = 0
    return { count: 0, width: 0, menuCount: 0 }
  }

  const shell = findHeaderContentRail()
  if (!shell) return { count: 0, width: 0, menuCount: 0 }

  const selectors = [
    'header > div.mx-auto.w-full',
    'section > div.mx-auto.w-full',
    'footer > div.mx-auto.w-full',
    'footer div.mx-auto.w-full',
    'main > div.mx-auto.w-full',
  ]

  let count = 0
  root.querySelectorAll(selectors.join(',')).forEach((node) => {
    applyShellStyles(node, shell)
    count += 1
  })

  const menuCount = alignMegaMenus(root, shell)
  window.__holoAlignedShellCount = count
  window.__holoAlignedRails = shell
  return { count, width: shell.width, menuCount }
}

function StorefrontAlignmentRuntime() {
  const [state, setState] = useState({ count: 0, width: 0, menuCount: 0 })
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
  return <DeployCheckBanner alignedCount={state.count} railWidth={state.width} menuCount={state.menuCount} />
}

function DeployCheckBanner({ alignedCount = 0, railWidth = 0, menuCount = 0 }) {
  if (typeof window !== 'undefined' && window.innerWidth < DESKTOP_RAIL_MIN_WIDTH) return null
  if (typeof window !== 'undefined' && !window.location.search.includes('deployCheck=1')) return null
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
      frontend {DEPLOY_CHECK_COMMIT} · shared rail {railWidth}px · shells {alignedCount} · menu {menuCount}
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
