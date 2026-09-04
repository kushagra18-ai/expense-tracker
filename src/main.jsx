import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'
import { ToastProvider } from './components/common/Toast'
import { ExpenseProvider } from './contexts/ExpenseContext'
import { SettingsProvider } from './contexts/SettingsContext'
import { GoogleSheetsProvider } from './contexts/GoogleSheetsContext'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <SettingsProvider>
        <ExpenseProvider>
          <GoogleSheetsProvider>
            <ToastProvider>
              <App />
            </ToastProvider>
          </GoogleSheetsProvider>
        </ExpenseProvider>
      </SettingsProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
