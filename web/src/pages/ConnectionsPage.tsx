import { useState } from 'react'
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
} from '@mui/material'
import { useConnections } from '../hooks/useConnections'

export function ConnectionsPage() {
  const navigate = useNavigate()
  const { connections, loading, add, update, remove } = useConnections()
  const [openAdd, setOpenAdd] = useState(false)
  const [openEdit, setOpenEdit] = useState<{ id: string; name: string } | null>(null)
  const [openDelete, setOpenDelete] = useState<{ id: string; name: string } | null>(null)
  const [name, setName] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleOpenAdd = () => {
    setName('')
    setOpenAdd(true)
  }

  const handleAdd = async () => {
    if (!name.trim()) return
    setSubmitting(true)
    try {
      await add({ name: name.trim() })
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
      await update(openEdit.id, { name: name.trim() })
      setOpenEdit(null)
    } finally {
      setSubmitting(false)
    }
  }

  const handleOpenDelete = (id: string, connectionName: string) => {
    setOpenDelete({ id, name: connectionName })
  }

  const handleDelete = async () => {
    if (!openDelete) return
    setSubmitting(true)
    try {
      await remove(openDelete.id)
      setOpenDelete(null)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <Box className="flex justify-center p-8">
        <CircularProgress />
      </Box>
    )
  }

  return (
    <div>
      <Box className="flex justify-between items-center mb-4">
        <Typography variant="h4">Conexões</Typography>
        <Button variant="contained" onClick={handleOpenAdd}>
          Nova conexão
        </Button>
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
