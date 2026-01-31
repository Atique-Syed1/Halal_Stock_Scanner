import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/main.css'
import './i18n' // Initialize i18n
import App from './App.jsx'
import performanceMonitor from './utils/performance-monitor'

// Track app initialization
performanceMonitor.trackEvent('App Init Started');

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Track app mounted
performanceMonitor.trackEvent('App Mounted');
