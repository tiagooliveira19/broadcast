import type { Timestamp } from 'firebase/firestore'

export type MessageStatus = 'draft' | 'scheduled' | 'sent'

export type Message = {
  id: string
  clientId: string
  connectionId: string
  contactIds: string[]
  body: string
  status: MessageStatus
  scheduledAt: Timestamp | null
  sentAt: Timestamp | null
  createdAt: Timestamp
}

export type MessageInput = {
  contactIds: string[]
  body: string
  status: MessageStatus
  scheduledAt?: Date | null
}
