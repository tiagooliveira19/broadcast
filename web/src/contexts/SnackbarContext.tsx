import { createContext, useCallback, useContext, useState } from 'react'
import { Snackbar, Alert } from '@mui/material'

type Severity = 'success' | 'error' | 'info'

type SnackbarContextValue = {
  showSuccess: (message: string) => void
  showError: (message: string) => void
  showInfo: (message: string) => void
}

const SnackbarContext = createContext<SnackbarContextValue | null>(null)

export function SnackbarProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [severity, setSeverity] = useState<Severity>('success')

  const show = useCallback((msg: string, sev: Severity) => {
    setMessage(msg)
    setSeverity(sev)
    setOpen(true)
  }, [])

  const showSuccess = useCallback((msg: string) => show(msg, 'success'), [show])
  const showError = useCallback((msg: string) => show(msg, 'error'), [show])
  const showInfo = useCallback((msg: string) => show(msg, 'info'), [show])

  const handleClose = useCallback(() => setOpen(false), [])

  return (
    <SnackbarContext.Provider value={{ showSuccess, showError, showInfo }}>
      {children}
      <Snackbar
        open={open}
        autoHideDuration={4000}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleClose} severity={severity} variant="filled" sx={{ width: '100%' }}>
          {message}
        </Alert>
      </Snackbar>
    </SnackbarContext.Provider>
  )
}

export function useSnackbar() {
  const ctx = useContext(SnackbarContext)
  if (!ctx) throw new Error('useSnackbar must be used within SnackbarProvider')
  return ctx
}
