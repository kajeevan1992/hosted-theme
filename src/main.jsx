import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './ConnectedApp'
import './index.css'
import './storefront-alignment.css'
import installStorefrontAdapter from './storefrontAdapter'
import { initStorefrontSeo } from './seo/storefrontSeo'
import { initGa4Analytics } from './analytics/ga4'

const DEPLOY_CHECK_COMMIT = '425503f'
const DEPLOY_CHECK_LABEL = `frontend deploy check ${DEPLOY_CHECK_COMMIT}`

function installStorefrontShellAlignment() {
  if (typeof document === 'undefined') return
  const existing = document.getElementById('holo-storefront-shell-alignment')
  if (existing) existing.remove()
  const style = document.createElement('style')
  style.id = 'holo-storefront-shell-alignment'
  style.textContent = `
    :root { --holo-storefront-shell: 1360px; }
    #root header > div.mx-auto.w-full,
    #root section > div.mx-auto.w-full,
    #root footer > div.mx-auto.w-full,
    #root footer .mx-auto.w-full,
    #root main > div.mx-auto.w-full {
      max-width: var(--holo-storefront-shell) !important;
      width: 100% !important;
      margin-left: auto !important;
      margin-right: auto !important;
    }
    @media (min-width: 1024px) {
      #root header > div.mx-auto.w-full,
      #root section > div.mx-auto.w-full,
      #root footer > div.mx-auto.w-full,
      #root footer .mx-auto.w-full,
      #root main > div.mx-auto.w-full {
        padding-left: 2rem !important;
        padding-right: 2rem !important;
      }
    }
  `
  document.head.appendChild(style)
}

function installDeployCheckBanner() {
  if (typeof document === 'undefined') return
  const existing = document.getElementById('holo-deploy-check-banner')
  if (existing) existing.remove()
  const banner = document.createElement('div')
  banner.id = 'holo-deploy-check-banner'
  banner.textContent = DEPLOY_CHECK_LABEL
  banner.style.position = 'fixed'
  banner.style.right = '12px'
  banner.style.bottom = '12px'
  banner.style.zIndex = '2147483647'
  banner.style.background = '#111827'
  banner.style.color = '#ffffff'
  banner.style.fontFamily = 'Inter, system-ui, sans-serif'
  banner.style.fontSize = '11px'
  banner.style.fontWeight = '800'
  banner.style.letterSpacing = '0.04em'
  banner.style.padding = '8px 10px'
  banner.style.borderRadius = '999px'
  banner.style.boxShadow = '0 10px 30px rgba(0,0,0,0.22)'
  banner.style.border = '1px solid rgba(255,255,255,0.18)'
  banner.style.pointerEvents = 'none'
  document.body.appendChild(banner)
}

// Install SaaS adapter BEFORE app mounts
installStorefrontAdapter()
initStorefrontSeo()
initGa4Analytics()
installStorefrontShellAlignment()
installDeployCheckBanner()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
