import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button, TextField, Typography, Box, Paper, Alert, CircularProgress } from '@mui/material'
import { useAuth } from './hooks'

export function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { register, user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (user) navigate('/conexoes', { replace: true })
  }, [user, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await register(email, password)
      navigate('/conexoes')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao cadastrar.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box className="min-h-screen flex items-center justify-center p-4">
      <Paper className="p-6 w-full max-w-md">
        <Typography variant="h5" className="mb-25">
          Cadastro
        </Typography>
        {error && (
          <Alert severity="error" className="mb-4">
            {error}
          </Alert>
        )}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <TextField
            label="E-mail"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            fullWidth
          />
          <TextField
            label="Senha"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            fullWidth
          />
          <Button type="submit" variant="contained" fullWidth disabled={loading}>
            {loading ? (
              <>
                <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
                Carregando
              </>
            ) : (
              'Cadastrar'
            )}
          </Button>
        </form>
        <Typography className="text-center mt-25">
          Já tem conta? <Link to="/login">Entrar</Link>
        </Typography>
      </Paper>
    </Box>
  )
}
