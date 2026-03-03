export type Connection = {
  id: string
  clientId: string
  name: string
  createdAt: { seconds: number; nanoseconds: number }
}

export type ConnectionInput = {
  name: string
}
