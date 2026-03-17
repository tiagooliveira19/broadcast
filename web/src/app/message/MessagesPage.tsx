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
  Tabs,
  Tab,
  FormControlLabel,
  Checkbox,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import MessageIcon from '@mui/icons-material/Message'
import { useAuth } from '../auth/hooks'
import { useConnections } from '../connection/hooks'
import { useContacts } from '../contact/hooks'
import { useSnackbar } from '../../contexts/SnackbarContext'
import { useMessages, type MessageStatusFilter } from './hooks'
import { createMessage, updateMessage, deleteMessage } from './api'
import { MESSAGE_STATUS_LABEL } from '../../utils/constants'
import { formatTimestamp, formatTimestampForInput } from '../../utils/date'
import type { Message } from './types'

export function MessagesPage() {
  const { connectionId } = useParams()
  const navigate = useNavigate()
  const { clientId } = useAuth()
  const { connections } = useConnections()
  const [statusFilter, setStatusFilter] = useState<MessageStatusFilter>('all')
  const { messages, loading } = useMessages(connectionId, statusFilter)
  const { contacts } = useContacts(connectionId)
  const { showSuccess } = useSnackbar()
  const connectionName = connections.find((c) => c.id === connectionId)?.name ?? 'Conexão'

  const [openForm, setOpenForm] = useState(false)
  const [openEdit, setOpenEdit] = useState<Message | null>(null)
  const [openDelete, setOpenDelete] = useState<Message | null>(null)
  const [body, setBody] = useState('')
  const [selectedContactIds, setSelectedContactIds] = useState<string[]>([])
  const [scheduleMode, setScheduleMode] = useState(false)
  const [scheduledAt, setScheduledAt] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleOpenForm = () => {
    setBody('')
    setSelectedContactIds([])
    setScheduleMode(false)
    setScheduledAt('')
    setOpenForm(true)
  }

  const handleSend = async () => {
    if (!clientId || !connectionId || !body.trim()) return
    if (scheduleMode && !scheduledAt) return
    setSubmitting(true)
    try {
      await createMessage(clientId, connectionId, {
        contactIds: selectedContactIds,
        body: body.trim(),
        status: scheduleMode ? 'scheduled' : 'sent',
        scheduledAt: scheduleMode && scheduledAt ? new Date(scheduledAt) : null,
      })
      setOpenForm(false)
      showSuccess(scheduleMode ? 'Mensagem agendada.' : 'Mensagem enviada.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleSaveDraft = async () => {
    if (!clientId || !connectionId || !body.trim()) return
    setSubmitting(true)
    try {
      await createMessage(clientId, connectionId, {
        contactIds: selectedContactIds,
        body: body.trim(),
        status: 'draft',
        scheduledAt: null,
      })
      setOpenForm(false)
      showSuccess('Rascunho salvo.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleOpenEdit = (msg: Message) => {
    if (msg.status === 'sent') return
    setOpenEdit(msg)
    setBody(msg.body)
    setSelectedContactIds(msg.contactIds)
    setScheduleMode(msg.status === 'scheduled')
    setScheduledAt(formatTimestampForInput(msg.scheduledAt))
  }

  const handleEdit = async () => {
    if (!openEdit) return
    if (!body.trim()) return
    if (scheduleMode && !scheduledAt) return
    setSubmitting(true)
    try {
      await updateMessage(openEdit.id, {
        contactIds: selectedContactIds,
        body: body.trim(),
        status: scheduleMode ? 'scheduled' : 'draft',
        scheduledAt: scheduleMode && scheduledAt ? new Date(scheduledAt) : null,
      })
      setOpenEdit(null)
      showSuccess('Mensagem atualizada.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!openDelete) return
    setSubmitting(true)
    try {
      await deleteMessage(openDelete.id)
      setOpenDelete(null)
      showSuccess('Mensagem excluída.')
    } finally {
      setSubmitting(false)
    }
  }

  const toggleContact = (id: string) => {
    setSelectedContactIds((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
    )
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
          <Typography variant="h4">Mensagens</Typography>
          <Typography variant="body2" color="text.secondary">
            {connectionName}
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenForm}>
          Nova mensagem
        </Button>
      </Box>

      <Tabs value={statusFilter} onChange={(_, v) => setStatusFilter(v)} sx={{ mb: 2 }}>
        <Tab label={MESSAGE_STATUS_LABEL.all} value="all" />
        <Tab label={MESSAGE_STATUS_LABEL.sent} value="sent" />
        <Tab label={MESSAGE_STATUS_LABEL.scheduled} value="scheduled" />
        <Tab label={MESSAGE_STATUS_LABEL.draft} value="draft" />
      </Tabs>

      {messages.length === 0 ? (
        <Box
          sx={{
            textAlign: 'center',
            py: 6,
            px: 2,
            borderRadius: 2,
            bgcolor: 'action.hover',
          }}
        >
          <MessageIcon sx={{ fontSize: 56, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {statusFilter === 'all'
              ? 'Nenhuma mensagem ainda'
              : `Nenhuma mensagem ${MESSAGE_STATUS_LABEL[statusFilter].toLowerCase()}`}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {statusFilter === 'all'
              ? 'Crie uma mensagem para enviar ou agendar.'
              : 'Altere a aba ou crie uma nova mensagem.'}
          </Typography>
          {statusFilter === 'all' && (
            <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenForm}>
              Nova mensagem
            </Button>
          )}
        </Box>
      ) : (
        <List disablePadding>
          {messages.map((m) => (
            <ListItem
              key={m.id}
              sx={{
                bgcolor: 'grey.50',
                borderRadius: 2,
                mb: 1.5,
                '&:hover': { bgcolor: 'grey.100' },
              }}
              secondaryAction={
                <ListItemSecondaryAction sx={{ display: 'flex', gap: 0.5 }}>
                  {m.status !== 'sent' && (
                    <>
                      <Button
                        size="small"
                        startIcon={<EditIcon />}
                        onClick={() => handleOpenEdit(m)}
                      >
                        Editar
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        startIcon={<DeleteOutlineIcon />}
                        onClick={() => setOpenDelete(m)}
                      >
                        Excluir
                      </Button>
                    </>
                  )}
                </ListItemSecondaryAction>
              }
            >
              <ListItemText
                primary={m.body.slice(0, 80) + (m.body.length > 80 ? '...' : '')}
                secondary={
                  <>
                    Status: {MESSAGE_STATUS_LABEL[m.status]} • Contatos: {m.contactIds.length}
                    {m.scheduledAt && ` • Agendada: ${formatTimestamp(m.scheduledAt)}`}
                    {m.sentAt && ` • Enviada: ${formatTimestamp(m.sentAt)}`}
                  </>
                }
              />
            </ListItem>
          ))}
        </List>
      )}

      <Dialog open={openForm} onClose={() => setOpenForm(false)} fullWidth maxWidth="sm">
        <DialogTitle>Nova mensagem</DialogTitle>
        <DialogContent className="flex flex-col gap-2">
          <Typography variant="subtitle2">Contatos</Typography>
          <Box className="max-h-40 overflow-auto border rounded p-2">
            {contacts.map((c) => (
              <FormControlLabel
                key={c.id}
                control={
                  <Checkbox
                    checked={selectedContactIds.includes(c.id)}
                    onChange={() => toggleContact(c.id)}
                  />
                }
                label={`${c.name} (${c.phone})`}
              />
            ))}
          </Box>
          <TextField
            label="Mensagem"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            multiline
            rows={3}
            fullWidth
            margin="dense"
          />
          <FormControlLabel
            control={
              <Checkbox checked={scheduleMode} onChange={(e) => setScheduleMode(e.target.checked)} />
            }
            label="Agendar envio"
          />
          {scheduleMode && (
            <TextField
              type="datetime-local"
              label="Data e hora"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              fullWidth
              margin="dense"
              InputLabelProps={{ shrink: true }}
            />
          )}
        </DialogContent>
        <DialogActions className="flex-wrap gap-2">
          <Button onClick={() => setOpenForm(false)}>Cancelar</Button>
          <Button
            onClick={handleSaveDraft}
            disabled={submitting || !body.trim()}
            title="Salva como rascunho para editar ou enviar depois"
          >
            {submitting ? 'Salvando...' : 'Salvar rascunho'}
          </Button>
          <Button
            onClick={handleSend}
            variant="contained"
            disabled={submitting || !body.trim() || (scheduleMode && !scheduledAt)}
          >
            {submitting ? 'Salvando...' : scheduleMode ? 'Agendar' : 'Enviar'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!openEdit} onClose={() => setOpenEdit(null)} fullWidth maxWidth="sm">
        <DialogTitle>Editar mensagem</DialogTitle>
        <DialogContent className="flex flex-col gap-2">
          <Typography variant="subtitle2">Contatos</Typography>
          <Box className="max-h-40 overflow-auto border rounded p-2">
            {contacts.map((c) => (
              <FormControlLabel
                key={c.id}
                control={
                  <Checkbox
                    checked={selectedContactIds.includes(c.id)}
                    onChange={() => toggleContact(c.id)}
                  />
                }
                label={`${c.name} (${c.phone})`}
              />
            ))}
          </Box>
          <TextField
            label="Mensagem"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            multiline
            rows={3}
            fullWidth
            margin="dense"
          />
          <FormControlLabel
            control={
              <Checkbox checked={scheduleMode} onChange={(e) => setScheduleMode(e.target.checked)} />
            }
            label="Agendar envio"
          />
          {scheduleMode && (
            <TextField
              type="datetime-local"
              label="Data e hora"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              fullWidth
              margin="dense"
              InputLabelProps={{ shrink: true }}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEdit(null)}>Cancelar</Button>
          <Button
            onClick={handleEdit}
            variant="contained"
            disabled={submitting || !body.trim() || (scheduleMode && !scheduledAt)}
          >
            {submitting ? 'Salvando...' : 'Salvar'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!openDelete} onClose={() => setOpenDelete(null)}>
        <DialogTitle>Excluir mensagem?</DialogTitle>
        <DialogContent>
          <Typography>
            Excluir esta mensagem? &quot;
            {openDelete?.body && openDelete.body.length > 50
              ? openDelete.body.slice(0, 50) + '...'
              : openDelete?.body}
            &quot;
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
