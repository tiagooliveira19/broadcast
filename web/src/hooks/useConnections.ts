import { useEffect, useState } from 'react'
import { useAuth } from './useAuth'
import {
  subscribeConnections,
  createConnection,
  updateConnection,
  deleteConnectionWithCascade,
} from '../api/connections'
import type { Connection, ConnectionInput } from '../types/connection'

export function useConnections() {
  const { clientId } = useAuth()
  const [connections, setConnections] = useState<Connection[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!clientId) {
      setConnections([])
      setLoading(false)
      return
    }
    setLoading(true)
    const unsubscribe = subscribeConnections(clientId, (data) => {
      setConnections(data)
      setLoading(false)
    })
    return () => unsubscribe()
  }, [clientId])

  const add = async (input: ConnectionInput) => {
    if (!clientId) return
    await createConnection(clientId, input)
  }

  const update = async (id: string, input: Partial<ConnectionInput>) => {
    await updateConnection(id, input)
  }

  const remove = async (id: string) => {
    await deleteConnectionWithCascade(id)
  }

  return { connections, loading, add, update, remove }
}
