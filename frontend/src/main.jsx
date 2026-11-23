import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import { AppErrorBoundary } from './components/AppErrorBoundary.jsx'
import { AuthProvider } from './contexts/AuthProvider.jsx'
import { AppRoutes } from './routes/AppRoutes.jsx'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AppErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </AppErrorBoundary>
  </StrictMode>,
)
