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
  getDocs,
  serverTimestamp,
  type Unsubscribe,
  type Timestamp,
} from 'firebase/firestore'
import { db } from './firebase'
import type { Connection, ConnectionInput } from '../types/connection'

const COLLECTION = 'connections'

function connectionFromDoc(id: string, data: Record<string, unknown>): Connection {
  const createdAt = data.createdAt as Timestamp
  return {
    id,
    clientId: data.clientId as string,
    name: data.name as string,
    createdAt: createdAt ? { seconds: createdAt.seconds, nanoseconds: createdAt.nanoseconds } : { seconds: 0, nanoseconds: 0 },
  }
}

export function subscribeConnections(
  clientId: string,
  onData: (connections: Connection[]) => void,
): Unsubscribe {
  const q = query(
    collection(db, COLLECTION),
    where('clientId', '==', clientId),
    orderBy('createdAt', 'desc'),
  )
  return onSnapshot(q, (snapshot) => {
    const connections = snapshot.docs.map((d) =>
      connectionFromDoc(d.id, d.data() as Record<string, unknown>),
    )
    onData(connections)
  })
}

export async function createConnection(
  clientId: string,
  input: ConnectionInput,
): Promise<string> {
  const ref = await addDoc(collection(db, COLLECTION), {
    clientId,
    name: input.name,
    createdAt: serverTimestamp(),
  })
  return ref.id
}

export async function updateConnection(
  connectionId: string,
  input: Partial<ConnectionInput>,
): Promise<void> {
  const ref = doc(db, COLLECTION, connectionId)
  await updateDoc(ref, { ...input })
}

export async function deleteConnection(connectionId: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, connectionId))
}

export async function deleteConnectionWithCascade(connectionId: string): Promise<void> {
  const contactsSnap = await getDocs(
    query(collection(db, 'contacts'), where('connectionId', '==', connectionId)),
  )
  for (const d of contactsSnap.docs) {
    await deleteDoc(d.ref)
  }
  const messagesSnap = await getDocs(
    query(collection(db, 'messages'), where('connectionId', '==', connectionId)),
  )
  for (const d of messagesSnap.docs) {
    await deleteDoc(d.ref)
  }
  await deleteDoc(doc(db, COLLECTION, connectionId))
}
