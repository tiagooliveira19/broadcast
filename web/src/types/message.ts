export type MessageStatus = 'draft' | 'scheduled' | 'sent'

export type Message = {
  id: string
  clientId: string
  connectionId: string
  contactIds: string[]
  body: string
  status: MessageStatus
  scheduledAt: { seconds: number; nanoseconds: number } | null
  sentAt: { seconds: number; nanoseconds: number } | null
  createdAt: { seconds: number; nanoseconds: number }
}

export type MessageInput = {
  contactIds: string[]
  body: string
  status: MessageStatus
  scheduledAt?: Date | null
}
