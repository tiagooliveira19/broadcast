import { Outlet, useNavigate } from 'react-router-dom'
import { AppBar, Box, Button, Toolbar, Typography } from '@mui/material'
import { useAuth } from '../hooks/useAuth'
import { useHeaderAction } from '../contexts/HeaderActionContext'

type LayoutProps = {
  children?: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
  const navigate = useNavigate()
  const { logout } = useAuth()
  const { headerAction } = useHeaderAction()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <>
      <AppBar position="static" className="header">
        <Toolbar className="flex justify-between">
          <div className="flex items-center gap-6">
            <Box
              component="button"
              type="button"
              onClick={() => navigate('/conexoes')}
              className="flex items-center border-0 bg-transparent cursor-pointer p-0"
              aria-label="Broadcast - início"
            >
              <img src="/favicon.svg" alt="Broadcast" title="Broadcast" className="h-11 w-11" />
            </Box>
            {headerAction && (
              <Typography
                component="span"
                variant="body1"
                className={headerAction.className}
                sx={{ cursor: 'pointer', opacity: 0.95, ...(headerAction.sx ?? {}) }}
                onClick={headerAction.onClick}
              >
                {headerAction.label}
              </Typography>
            )}
          </div>
          <Button color="inherit" onClick={handleLogout}>
            Sair
          </Button>
        </Toolbar>
      </AppBar>
      <main className="p-4 m-25">{children ?? <Outlet />}</main>
    </>
  )
}
