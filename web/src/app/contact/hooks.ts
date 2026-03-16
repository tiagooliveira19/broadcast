import { useEffect, useState } from 'react'
import { useAuth } from '../auth/hooks'
import { subscribeContacts } from './api'
import type { Contact } from './types'

export function useContacts(connectionId: string | undefined) {
  const { clientId } = useAuth()
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!clientId || !connectionId) {
      setContacts([])
      setLoading(false)
      return
    }
    setLoading(true)
    const unsubscribe = subscribeContacts(clientId, connectionId, (data) => {
      setContacts(data)
      setLoading(false)
    })
    return () => unsubscribe()
  }, [clientId, connectionId])

  return { contacts, loading }
}
