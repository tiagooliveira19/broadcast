import { useEffect, useState } from 'react'
import { useAuth } from '../auth/hooks'
import { subscribeMessages, updateMessage } from './api'
import { isBeforeNow } from '../../utils/date'
import type { Message, MessageStatus } from './types'

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
    const overdue = messages.filter(
      (m) => m.status === 'scheduled' && isBeforeNow(m.scheduledAt),
    )
    overdue.forEach((m) => updateMessage(m.id, { status: 'sent' }))
  }, [messages])

  return { messages, loading }
}
