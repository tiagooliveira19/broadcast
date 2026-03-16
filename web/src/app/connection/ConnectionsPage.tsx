import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Box,
  Alert,
} from '@mui/material'
import { useAuth } from '../auth/hooks'
import { useHeaderAction } from '../../contexts/HeaderActionContext'
import { useConnections } from './hooks'
import {
  createConnection,
  updateConnection,
  deleteConnectionWithCascade,
} from './api'

export function ConnectionsPage() {
  const navigate = useNavigate()
  const { clientId } = useAuth()
  const { connections, loading } = useConnections()
  const { setHeaderAction } = useHeaderAction()
  const [openAdd, setOpenAdd] = useState(false)
  const [openEdit, setOpenEdit] = useState<{ id: string; name: string } | null>(null)
  const [openDelete, setOpenDelete] = useState<{ id: string; name: string } | null>(null)
  const [deleteError, setDeleteError] = useState('')
  const [name, setName] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleOpenAdd = useCallback(() => {
    setName('')
    setOpenAdd(true)
  }, [])

  const handleAdd = async () => {
    if (!clientId || !name.trim()) return
    setSubmitting(true)
    try {
      await createConnection(clientId, { name: name.trim() })
      setOpenAdd(false)
    } finally {
      setSubmitting(false)
    }
  }

  const handleOpenEdit = (id: string, currentName: string) => {
    setOpenEdit({ id, name: currentName })
    setName(currentName)
  }

  const handleEdit = async () => {
    if (!openEdit || !name.trim()) return
    setSubmitting(true)
    try {
      await updateConnection(openEdit.id, { name: name.trim() })
      setOpenEdit(null)
    } finally {
      setSubmitting(false)
    }
  }

  const handleOpenDelete = (id: string, connectionName: string) => {
    setDeleteError('')
    setOpenDelete({ id, name: connectionName })
  }

  const handleDelete = async () => {
    if (!openDelete || !clientId) return
    setDeleteError('')
    setSubmitting(true)
    try {
      await deleteConnectionWithCascade(clientId, openDelete.id)
      setOpenDelete(null)
    } catch (err: unknown) {
      setDeleteError(err instanceof Error ? err.message : 'Erro ao excluir.')
    } finally {
      setSubmitting(false)
    }
  }

  useEffect(() => {
    setHeaderAction({
      label: 'Nova conexão',
      onClick: handleOpenAdd,
      className: 'font-semibold uppercase tracking-wide',
      sx: { fontSize: '0.875rem', '&:hover': { opacity: 1 }, marginLeft: '25px' },
    })
    return () => setHeaderAction(null)
  }, [setHeaderAction, handleOpenAdd])

  if (loading) {
    return (
      <Box className="flex justify-center p-8">
        <CircularProgress />
      </Box>
    )
  }

  return (
    <div>
      <Box className="mb-4">
        <Typography variant="h4">Conexões</Typography>
      </Box>

      <List>
        {connections.map((c) => (
          <ListItem
            key={c.id}
            className="bg-gray-50 rounded-lg mb-2"
            secondaryAction={
              <ListItemSecondaryAction className="flex gap-1">
                <Button size="small" onClick={() => navigate(`/conexoes/${c.id}/contatos`)}>
                  Contatos
                </Button>
                <Button size="small" onClick={() => navigate(`/conexoes/${c.id}/mensagens`)}>
                  Mensagens
                </Button>
                <Button size="small" onClick={() => handleOpenEdit(c.id, c.name)}>
                  Editar
                </Button>
                <Button size="small" color="error" onClick={() => handleOpenDelete(c.id, c.name)}>
                  Excluir
                </Button>
              </ListItemSecondaryAction>
            }
          >
            <ListItemText primary={c.name} />
          </ListItem>
        ))}
      </List>

      <Dialog open={openAdd} onClose={() => setOpenAdd(false)} fullWidth maxWidth="sm">
        <DialogTitle>Nova conexão</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            label="Nome"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
            margin="dense"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAdd(false)}>Cancelar</Button>
          <Button onClick={handleAdd} variant="contained" disabled={submitting || !name.trim()}>
            {submitting ? 'Salvando...' : 'Criar'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!openEdit} onClose={() => setOpenEdit(null)} fullWidth maxWidth="sm">
        <DialogTitle>Editar conexão</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            label="Nome"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
            margin="dense"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEdit(null)}>Cancelar</Button>
          <Button onClick={handleEdit} variant="contained" disabled={submitting || !name.trim()}>
            {submitting ? 'Salvando...' : 'Salvar'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!openDelete} onClose={() => setOpenDelete(null)}>
        <DialogTitle>Excluir conexão?</DialogTitle>
        <DialogContent>
          {deleteError && (
            <Alert severity="error" className="mb-4">
              {deleteError}
            </Alert>
          )}
          <Typography>
            Excluir &quot;{openDelete?.name}&quot;? Contatos e mensagens desta conexão também serão
            excluídos.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDelete(null)}>Cancelar</Button>
          <Button onClick={handleDelete} color="error" variant="contained" disabled={submitting}>
            {submitting ? 'Excluindo...' : 'Excluir'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}
