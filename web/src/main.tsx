import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { CssBaseline, ThemeProvider } from '@mui/material'
import { AuthProvider } from './app/auth/AuthContext'
import { HeaderActionProvider } from './contexts/HeaderActionContext'
import { SnackbarProvider } from './contexts/SnackbarContext'
import App from './App'
import { theme } from './theme'
import './style.css'
import './styles/global.css'

createRoot(document.getElementById('app')!).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <AuthProvider>
          <HeaderActionProvider>
            <SnackbarProvider>
              <App />
            </SnackbarProvider>
          </HeaderActionProvider>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>,
)
