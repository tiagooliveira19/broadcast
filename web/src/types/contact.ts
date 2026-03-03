export type Contact = {
  id: string
  clientId: string
  connectionId: string
  name: string
  phone: string
  createdAt: { seconds: number; nanoseconds: number }
}

export type ContactInput = {
  name: string
  phone: string
}
