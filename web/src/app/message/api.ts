import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  type Unsubscribe,
} from 'firebase/firestore'
import { db } from '../../api/firebase'
import { getTimestamp } from '../../utils/firestore'
import type { Message, MessageInput, MessageStatus } from './types'

const COLLECTION = 'messages'

function messageFromDoc(id: string, data: Record<string, unknown>): Message {
  return {
    id,
    clientId: data.clientId as string,
    connectionId: data.connectionId as string,
    contactIds: (data.contactIds as string[]) ?? [],
    body: (data.body as string) ?? '',
    status: (data.status as MessageStatus) ?? 'draft',
    scheduledAt: getTimestamp(data, 'scheduledAt'),
    sentAt: getTimestamp(data, 'sentAt'),
    createdAt: getTimestamp(data, 'createdAt') ?? Timestamp.fromMillis(0),
  }
}

export function subscribeMessages(
  clientId: string,
  connectionId: string,
  statusFilter: MessageStatus | 'all',
  onData: (messages: Message[]) => void,
): Unsubscribe {
  let q = query(
    collection(db, COLLECTION),
    where('clientId', '==', clientId),
    where('connectionId', '==', connectionId),
    orderBy('createdAt', 'desc'),
  )
  if (statusFilter !== 'all') {
    q = query(
      collection(db, COLLECTION),
      where('clientId', '==', clientId),
      where('connectionId', '==', connectionId),
      where('status', '==', statusFilter),
      orderBy('createdAt', 'desc'),
    )
  }
  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map((d) =>
      messageFromDoc(d.id, d.data() as Record<string, unknown>),
    )
    onData(messages)
  })
}

export async function createMessage(
  clientId: string,
  connectionId: string,
  input: MessageInput,
): Promise<string> {
  const scheduledAt = input.scheduledAt
    ? Timestamp.fromDate(input.scheduledAt)
    : null
  const ref = await addDoc(collection(db, COLLECTION), {
    clientId,
    connectionId,
    contactIds: input.contactIds,
    body: input.body,
    status: input.status,
    scheduledAt,
    sentAt: input.status === 'sent' ? serverTimestamp() : null,
    createdAt: serverTimestamp(),
  })
  return ref.id
}

export async function updateMessage(
  messageId: string,
  input: Partial<MessageInput>,
): Promise<void> {
  const ref = doc(db, COLLECTION, messageId)
  const { scheduledAt: sa, ...rest } = input
  const data: Record<string, unknown> = { ...rest }
  if (sa !== undefined) {
    data.scheduledAt = sa ? Timestamp.fromDate(sa) : null
  }
  if (input.status === 'sent') {
    data.sentAt = serverTimestamp()
  }
  await updateDoc(ref, data)
}

export async function deleteMessage(messageId: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, messageId))
}
