import { Outlet, useNavigate } from 'react-router-dom'
import { AppBar, Button, Toolbar, Typography } from '@mui/material'
import { useAuth } from '../hooks/useAuth'

type LayoutProps = {
  children?: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
  const navigate = useNavigate()
  const { logout } = useAuth()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <>
      <AppBar position="static">
        <Toolbar className="flex justify-between">
          <Typography
            component="span"
            variant="h6"
            sx={{ cursor: 'pointer' }}
            onClick={() => navigate('/conexoes')}
          >
            Broadcast
          </Typography>
          <Button color="inherit" onClick={handleLogout}>
            Sair
          </Button>
        </Toolbar>
      </AppBar>
      <main className="p-4">{children ?? <Outlet />}</main>
    </>
  )
}
