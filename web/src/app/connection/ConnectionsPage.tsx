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
import LinkIcon from '@mui/icons-material/Link'
import MessageIcon from '@mui/icons-material/Message'
import EditIcon from '@mui/icons-material/Edit'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import { useAuth } from '../auth/hooks'
import { useHeaderAction } from '../../contexts/HeaderActionContext'
import { useSnackbar } from '../../contexts/SnackbarContext'
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
  const { showSuccess, showError } = useSnackbar()
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
      showSuccess('Conexão criada.')
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
      showSuccess('Conexão atualizada.')
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
      showSuccess('Conexão excluída.')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao excluir.'
      setDeleteError(msg)
      showError(msg)
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

      {connections.length === 0 ? (
        <Box
          sx={{
            textAlign: 'center',
            py: 6,
            px: 2,
            borderRadius: 2,
            bgcolor: 'action.hover',
          }}
        >
          <LinkIcon sx={{ fontSize: 56, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Nenhuma conexão ainda
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Crie sua primeira conexão para organizar contatos e mensagens.
          </Typography>
          <Button variant="contained" onClick={handleOpenAdd}>
            Criar primeira conexão
          </Button>
        </Box>
      ) : (
        <List disablePadding>
          {connections.map((c) => (
            <ListItem
              key={c.id}
              sx={{
                bgcolor: 'grey.50',
                borderRadius: 2,
                mb: 1.5,
                '&:hover': { bgcolor: 'grey.100' },
              }}
              secondaryAction={
                <ListItemSecondaryAction sx={{ display: 'flex', gap: 0.5 }}>
                  <Button
                    size="small"
                    startIcon={<LinkIcon />}
                    onClick={() => navigate(`/conexoes/${c.id}/contatos`)}
                  >
                    Contatos
                  </Button>
                  <Button
                    size="small"
                    startIcon={<MessageIcon />}
                    onClick={() => navigate(`/conexoes/${c.id}/mensagens`)}
                  >
                    Mensagens
                  </Button>
                  <Button
                    size="small"
                    startIcon={<EditIcon />}
                    onClick={() => handleOpenEdit(c.id, c.name)}
                  >
                    Editar
                  </Button>
                  <Button
                    size="small"
                    color="error"
                    startIcon={<DeleteOutlineIcon />}
                    onClick={() => handleOpenDelete(c.id, c.name)}
                  >
                    Excluir
                  </Button>
                </ListItemSecondaryAction>
              }
            >
              <ListItemText primary={c.name} />
            </ListItem>
          ))}
        </List>
      )}

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
