import { useEffect, useState } from 'react'
import { useAuth } from './useAuth'
import {
  subscribeContacts,
  createContact,
  updateContact,
  deleteContact,
} from '../api/contacts'
import type { Contact, ContactInput } from '../types/contact'

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

  const add = async (input: ContactInput) => {
    if (!clientId || !connectionId) return
    await createContact(clientId, connectionId, input)
  }

  const update = async (id: string, input: Partial<ContactInput>) => {
    await updateContact(id, input)
  }

  const remove = async (id: string) => {
    await deleteContact(id)
  }

  return { contacts, loading, add, update, remove }
}
