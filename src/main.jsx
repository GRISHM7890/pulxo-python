import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { AuthProvider } from './context/AuthContext'
import { GamificationProvider } from './context/GamificationContext'

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <GamificationProvider>
        <App />
      </GamificationProvider>
    </AuthProvider>
  </React.StrictMode>
)
