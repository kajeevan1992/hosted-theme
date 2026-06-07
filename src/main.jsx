import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './ConnectedApp'
import './index.css'
import installStorefrontAdapter from './storefrontAdapter'
import { initStorefrontSeo } from './seo/storefrontSeo'
import { initGa4Analytics } from './analytics/ga4'

// Install SaaS adapter BEFORE app mounts
installStorefrontAdapter()
initStorefrontSeo()
initGa4Analytics()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
