import type { MessageStatus } from '../types/message'

export const MESSAGE_STATUS_LABEL: Record<MessageStatus | 'all', string> = {
  all: 'Todas',
  draft: 'Rascunhos',
  scheduled: 'Agendadas',
  sent: 'Enviadas',
}
