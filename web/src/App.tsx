import { Box, CircularProgress } from '@mui/material'
import { useAuth } from './app/auth/hooks'
import { AppRoutes } from './routes'

export default function App() {
  const { loading } = useAuth()

  if (loading) {
    return (
      <Box className="min-h-screen flex items-center justify-center">
        <CircularProgress />
      </Box>
    )
  }

  return <AppRoutes />
}
