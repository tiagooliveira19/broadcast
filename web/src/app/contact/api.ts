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
import type { Contact, ContactInput } from './types'

const COLLECTION = 'contacts'

function contactFromDoc(id: string, data: Record<string, unknown>): Contact {
  return {
    id,
    clientId: data.clientId as string,
    connectionId: data.connectionId as string,
    name: data.name as string,
    phone: data.phone as string,
    createdAt: getTimestamp(data, 'createdAt') ?? Timestamp.fromMillis(0),
  }
}

export function subscribeContacts(
  clientId: string,
  connectionId: string,
  onData: (contacts: Contact[]) => void,
): Unsubscribe {
  const q = query(
    collection(db, COLLECTION),
    where('clientId', '==', clientId),
    where('connectionId', '==', connectionId),
    orderBy('createdAt', 'desc'),
  )
  return onSnapshot(q, (snapshot) => {
    const contacts = snapshot.docs.map((d) =>
      contactFromDoc(d.id, d.data() as Record<string, unknown>),
    )
    onData(contacts)
  })
}

export async function createContact(
  clientId: string,
  connectionId: string,
  input: ContactInput,
): Promise<string> {
  const ref = await addDoc(collection(db, COLLECTION), {
    clientId,
    connectionId,
    name: input.name,
    phone: input.phone,
    createdAt: serverTimestamp(),
  })
  return ref.id
}

export async function updateContact(
  contactId: string,
  input: Partial<ContactInput>,
): Promise<void> {
  const ref = doc(db, COLLECTION, contactId)
  await updateDoc(ref, { ...input })
}

export async function deleteContact(contactId: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, contactId))
}
