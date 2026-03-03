import { useEffect, useState } from 'react'
import { useAuth } from './useAuth'
import {
  subscribeMessages,
  createMessage,
  updateMessage,
  deleteMessage,
} from '../api/messages'
import type { Message, MessageInput, MessageStatus } from '../types/message'

export type MessageStatusFilter = MessageStatus | 'all'

export function useMessages(
  connectionId: string | undefined,
  statusFilter: MessageStatusFilter = 'all',
) {
  const { clientId } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!clientId || !connectionId) {
      setMessages([])
      setLoading(false)
      return
    }
    setLoading(true)
    const unsubscribe = subscribeMessages(
      clientId,
      connectionId,
      statusFilter,
      (data) => {
        setMessages(data)
        setLoading(false)
      },
    )
    return () => unsubscribe()
  }, [clientId, connectionId, statusFilter])

  // Ao abrir a tela: marca como "enviadas" as mensagens agendadas com data/hora já passada (não depende da Cloud Function)
  useEffect(() => {
    if (!messages.length) return
    const now = Date.now()
    const overdue = messages.filter(
      (m) =>
        m.status === 'scheduled' &&
        m.scheduledAt &&
        m.scheduledAt.seconds * 1000 <= now,
    )
    overdue.forEach((m) => updateMessage(m.id, { status: 'sent' }))
  }, [messages])

  const add = async (input: MessageInput) => {
    if (!clientId || !connectionId) return
    await createMessage(clientId, connectionId, input)
  }

  const update = async (id: string, input: Partial<MessageInput>) => {
    await updateMessage(id, input)
  }

  const remove = async (id: string) => {
    await deleteMessage(id)
  }

  return { messages, loading, add, update, remove }
}
