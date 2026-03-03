import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button, TextField, Typography, Box, Paper, Alert } from '@mui/material'
import { useAuth } from '../hooks/useAuth'

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { login, user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (user) navigate('/conexoes', { replace: true })
  }, [user, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      await login(email, password)
      navigate('/conexoes')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao entrar.')
    }
  }

  return (
    <Box className="min-h-screen flex items-center justify-center p-4">
      <Paper className="p-6 w-full max-w-md">
        <Typography variant="h5" className="mb-4">
          Entrar
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
          <Button type="submit" variant="contained" fullWidth>
            Entrar
          </Button>
        </form>
        <Typography className="mt-4 text-center">
          Não tem conta? <Link to="/cadastro">Cadastre-se</Link>
        </Typography>
      </Paper>
    </Box>
  )
}
