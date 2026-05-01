import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import installStorefrontAdapter from './storefrontAdapter'

// Install SaaS adapter BEFORE app mounts
installStorefrontAdapter()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
