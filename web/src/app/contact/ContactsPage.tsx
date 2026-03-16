import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
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
import { useAuth } from '../auth/hooks'
import { useContacts } from './hooks'
import { createContact, updateContact, deleteContact } from './api'

/** Máscara (11) 98765-4321 – até 11 dígitos */
function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11)
  if (digits.length <= 2) return digits ? `(${digits}` : ''
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
}

export function ContactsPage() {
  const { connectionId } = useParams()
  const navigate = useNavigate()
  const { clientId } = useAuth()
  const { contacts, loading } = useContacts(connectionId)
  const [openAdd, setOpenAdd] = useState(false)
  const [openEdit, setOpenEdit] = useState<{ id: string; name: string; phone: string } | null>(null)
  const [openDelete, setOpenDelete] = useState<{ id: string; name: string } | null>(null)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleOpenAdd = () => {
    setName('')
    setPhone('')
    setOpenAdd(true)
  }

  const handleAdd = async () => {
    if (!clientId || !connectionId || !name.trim() || !phone.trim()) return
    setSubmitting(true)
    try {
      await createContact(clientId, connectionId, { name: name.trim(), phone: phone.trim() })
      setOpenAdd(false)
    } finally {
      setSubmitting(false)
    }
  }

  const handleOpenEdit = (id: string, currentName: string, currentPhone: string) => {
    setOpenEdit({ id, name: currentName, phone: currentPhone })
    setName(currentName)
    setPhone(formatPhone(currentPhone))
  }

  const handleEdit = async () => {
    if (!openEdit || !name.trim() || !phone.trim()) return
    setSubmitting(true)
    try {
      await updateContact(openEdit.id, { name: name.trim(), phone: phone.trim() })
      setOpenEdit(null)
    } finally {
      setSubmitting(false)
    }
  }

  const handleOpenDelete = (id: string, contactName: string) => {
    setOpenDelete({ id, name: contactName })
  }

  const handleDelete = async () => {
    if (!openDelete) return
    setSubmitting(true)
    try {
      await deleteContact(openDelete.id)
      setOpenDelete(null)
    } finally {
      setSubmitting(false)
    }
  }

  if (!connectionId) return null

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
        <Box>
          <Button size="small" onClick={() => navigate('/conexoes')} className="mb-25">
            ← Voltar às conexões
          </Button>
          <Typography variant="h4">Contatos</Typography>
        </Box>
        <Button variant="contained" onClick={handleOpenAdd}>
          Novo contato
        </Button>
      </Box>

      <List>
        {contacts.map((c) => (
          <ListItem
            key={c.id}
            className="bg-gray-50 rounded-lg mb-2"
            secondaryAction={
              <ListItemSecondaryAction className="flex gap-1">
                <Button size="small" onClick={() => handleOpenEdit(c.id, c.name, c.phone)}>
                  Editar
                </Button>
                <Button size="small" color="error" onClick={() => handleOpenDelete(c.id, c.name)}>
                  Excluir
                </Button>
              </ListItemSecondaryAction>
            }
          >
            <ListItemText primary={c.name} secondary={c.phone} />
          </ListItem>
        ))}
      </List>

      <Dialog open={openAdd} onClose={() => setOpenAdd(false)} fullWidth maxWidth="sm">
        <DialogTitle>Novo contato</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            label="Nome"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
            margin="dense"
          />
          <TextField
            label="Telefone"
            value={phone}
            onChange={(e) => setPhone(formatPhone(e.target.value))}
            placeholder="(11) 98765-4321"
            fullWidth
            margin="dense"
            inputProps={{ inputMode: 'numeric', maxLength: 16 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAdd(false)}>Cancelar</Button>
          <Button
            onClick={handleAdd}
            variant="contained"
            disabled={submitting || !name.trim() || !phone.trim()}
          >
            {submitting ? 'Salvando...' : 'Criar'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!openEdit} onClose={() => setOpenEdit(null)} fullWidth maxWidth="sm">
        <DialogTitle>Editar contato</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            label="Nome"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
            margin="dense"
          />
          <TextField
            label="Telefone"
            value={phone}
            onChange={(e) => setPhone(formatPhone(e.target.value))}
            placeholder="(11) 98765-4321"
            fullWidth
            margin="dense"
            inputProps={{ inputMode: 'numeric', maxLength: 16 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEdit(null)}>Cancelar</Button>
          <Button
            onClick={handleEdit}
            variant="contained"
            disabled={submitting || !name.trim() || !phone.trim()}
          >
            {submitting ? 'Salvando...' : 'Salvar'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!openDelete} onClose={() => setOpenDelete(null)}>
        <DialogTitle>Excluir contato?</DialogTitle>
        <DialogContent>
          <Typography>Excluir &quot;{openDelete?.name}&quot;?</Typography>
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
