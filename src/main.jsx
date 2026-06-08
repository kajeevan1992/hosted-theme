import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './ConnectedApp'
import './index.css'
import './storefront-alignment.css'
import installStorefrontAdapter from './storefrontAdapter'
import { initStorefrontSeo } from './seo/storefrontSeo'
import { initGa4Analytics } from './analytics/ga4'

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

// Install SaaS adapter BEFORE app mounts
installStorefrontAdapter()
initStorefrontSeo()
initGa4Analytics()
installStorefrontShellAlignment()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
