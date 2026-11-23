import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import { AppErrorBoundary } from './components/AppErrorBoundary.jsx'
import { AuthProvider } from './contexts/AuthProvider.jsx'
import { AppRoutes } from './routes/AppRoutes.jsx'
import { GlobalToaster } from './components/notifications/GlobalToaster.jsx'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AppErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
          <GlobalToaster />
        </AuthProvider>
      </BrowserRouter>
    </AppErrorBoundary>
  </StrictMode>,
)
