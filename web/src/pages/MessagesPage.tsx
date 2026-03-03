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
import { useMessages, type MessageStatusFilter } from '../hooks/useMessages'
import { useContacts } from '../hooks/useContacts'
import { MESSAGE_STATUS_LABEL } from '../utils/constants'
import type { Message } from '../types/message'

function formatDate(ts: { seconds: number; nanoseconds: number } | null): string {
  if (!ts) return '-'
  return new Date(ts.seconds * 1000).toLocaleString('pt-BR')
}

export function MessagesPage() {
  const { connectionId } = useParams()
  const navigate = useNavigate()
  const [statusFilter, setStatusFilter] = useState<MessageStatusFilter>('all')
  const { messages, loading, add, update, remove } = useMessages(connectionId, statusFilter)
  const { contacts } = useContacts(connectionId)

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
    if (!body.trim()) return
    if (scheduleMode && !scheduledAt) return
    setSubmitting(true)
    try {
      await add({
        contactIds: selectedContactIds,
        body: body.trim(),
        status: scheduleMode ? 'scheduled' : 'sent',
        scheduledAt: scheduleMode && scheduledAt ? new Date(scheduledAt) : null,
      })
      setOpenForm(false)
    } finally {
      setSubmitting(false)
    }
  }

  const handleSaveDraft = async () => {
    if (!body.trim()) return
    setSubmitting(true)
    try {
      await add({
        contactIds: selectedContactIds,
        body: body.trim(),
        status: 'draft',
        scheduledAt: null,
      })
      setOpenForm(false)
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
    setScheduledAt(
      msg.scheduledAt
        ? new Date(msg.scheduledAt.seconds * 1000).toISOString().slice(0, 16)
        : '',
    )
  }

  const handleEdit = async () => {
    if (!openEdit) return
    if (!body.trim()) return
    if (scheduleMode && !scheduledAt) return
    setSubmitting(true)
    try {
      await update(openEdit.id, {
        contactIds: selectedContactIds,
        body: body.trim(),
        status: scheduleMode ? 'scheduled' : 'draft',
        scheduledAt: scheduleMode && scheduledAt ? new Date(scheduledAt) : null,
      })
      setOpenEdit(null)
    } finally {
      setSubmitting(false)
    }
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
        </Box>
        <Button variant="contained" onClick={handleOpenForm}>
          Nova mensagem
        </Button>
      </Box>

      <Tabs value={statusFilter} onChange={(_, v) => setStatusFilter(v)} className="mb-4">
        <Tab label={MESSAGE_STATUS_LABEL.all} value="all" />
        <Tab label={MESSAGE_STATUS_LABEL.sent} value="sent" />
        <Tab label={MESSAGE_STATUS_LABEL.scheduled} value="scheduled" />
        <Tab label={MESSAGE_STATUS_LABEL.draft} value="draft" />
      </Tabs>

      <List>
        {messages.map((m) => (
          <ListItem
            key={m.id}
            className="bg-gray-50 rounded-lg mb-2"
            secondaryAction={
              <ListItemSecondaryAction className="flex gap-1">
                {m.status !== 'sent' && (
                  <>
                    <Button size="small" onClick={() => handleOpenEdit(m)}>
                      Editar
                    </Button>
                    <Button size="small" color="error" onClick={() => setOpenDelete(m)}>
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
                  {m.scheduledAt && ` • Agendada: ${formatDate(m.scheduledAt)}`}
                  {m.sentAt && ` • Enviada: ${formatDate(m.sentAt)}`}
                </>
              }
            />
          </ListItem>
        ))}
      </List>

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
        <DialogActions>
          <Button onClick={() => setOpenForm(false)}>Cancelar</Button>
          <Button
            onClick={handleSaveDraft}
            disabled={submitting || !body.trim()}
          >
            {submitting ? 'Salvando...' : 'Salvar rascunho'}
          </Button>
          <Button
            onClick={handleSend}
            variant="contained"
            disabled={submitting || !body.trim() || (scheduleMode && !scheduledAt)}
          >
            {submitting ? 'Salvando...' : scheduleMode ? 'Agendar' : 'Enviar (fake)'}
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
