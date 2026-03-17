import { collection, query, where, orderBy, type Query } from 'firebase/firestore'
import { db } from '../api/firebase'

const CONNECTIONS = 'connections'
const CONTACTS = 'contacts'
const MESSAGES = 'messages'

/** Query de conexões do cliente, ordenadas por createdAt desc. */
export function queryConnections(clientId: string): Query {
  return query(
    collection(db, CONNECTIONS),
    where('clientId', '==', clientId),
    orderBy('createdAt', 'desc'),
  )
}

/** Query de contatos da conexão, ordenados por createdAt desc. */
export function queryContacts(clientId: string, connectionId: string): Query {
  return query(
    collection(db, CONTACTS),
    where('clientId', '==', clientId),
    where('connectionId', '==', connectionId),
    orderBy('createdAt', 'desc'),
  )
}

export type MessageStatusFilter = 'all' | 'draft' | 'scheduled' | 'sent'

/** Query de mensagens da conexão, ordenadas por createdAt desc. Opcional filtro por status. */
export function queryMessages(
  clientId: string,
  connectionId: string,
  statusFilter: MessageStatusFilter = 'all',
): Query {
  if (statusFilter === 'all') {
    return query(
      collection(db, MESSAGES),
      where('clientId', '==', clientId),
      where('connectionId', '==', connectionId),
      orderBy('createdAt', 'desc'),
    )
  }
  return query(
    collection(db, MESSAGES),
    where('clientId', '==', clientId),
    where('connectionId', '==', connectionId),
    where('status', '==', statusFilter),
    orderBy('createdAt', 'desc'),
  )
}

/** Query de contatos por conexão (sem orderBy). Para getDocs, ex.: cascade delete. */
export function queryContactsByConnection(
  clientId: string,
  connectionId: string,
): Query {
  return query(
    collection(db, CONTACTS),
    where('clientId', '==', clientId),
    where('connectionId', '==', connectionId),
  )
}

/** Query de mensagens por conexão (sem orderBy). Para getDocs, ex.: cascade delete. */
export function queryMessagesByConnection(
  clientId: string,
  connectionId: string,
): Query {
  return query(
    collection(db, MESSAGES),
    where('clientId', '==', clientId),
    where('connectionId', '==', connectionId),
  )
}
