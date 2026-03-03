import { createContext, useCallback, useContext, useState } from 'react'

import type { SxProps, Theme } from '@mui/material'

export type HeaderAction = {
  label: string
  onClick: () => void
  /** Classe CSS (Tailwind ou global.css) */
  className?: string
  /** Estilos MUI (sobrescreve os padrões do item) */
  sx?: SxProps<Theme>
} | null

type HeaderActionContextValue = {
  headerAction: HeaderAction
  setHeaderAction: (action: HeaderAction) => void
}

const HeaderActionContext = createContext<HeaderActionContextValue | null>(null)

export function HeaderActionProvider({ children }: { children: React.ReactNode }) {
  const [headerAction, setHeaderActionState] = useState<HeaderAction>(null)
  const setHeaderAction = useCallback((action: HeaderAction) => {
    setHeaderActionState(action)
  }, [])
  return (
    <HeaderActionContext.Provider value={{ headerAction, setHeaderAction }}>
      {children}
    </HeaderActionContext.Provider>
  )
}

export function useHeaderAction() {
  const ctx = useContext(HeaderActionContext)
  if (!ctx) throw new Error('useHeaderAction must be used within HeaderActionProvider')
  return ctx
}
