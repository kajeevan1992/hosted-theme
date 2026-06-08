import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './ConnectedApp'
import './index.css'
import './storefront-alignment.css'
import installStorefrontAdapter from './storefrontAdapter'
import { initStorefrontSeo } from './seo/storefrontSeo'
import { initGa4Analytics } from './analytics/ga4'

const DEPLOY_CHECK_COMMIT = '6e1b8d9'

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
      frontend deploy check {DEPLOY_CHECK_COMMIT}
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
    <DeployCheckBanner />
  </React.StrictMode>,
)
