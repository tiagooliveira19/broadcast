import type { Timestamp } from 'firebase/firestore'

export type Contact = {
  id: string
  clientId: string
  connectionId: string
  name: string
  phone: string
  createdAt: Timestamp
}

export type ContactInput = {
  name: string
  phone: string
}
