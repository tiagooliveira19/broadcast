import { useEffect, useState } from 'react'
import { useAuth } from '../auth/hooks'
import { subscribeConnections } from './api'
import type { Connection } from './types'

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

  return { connections, loading }
}
