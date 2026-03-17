import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  getDocs,
  serverTimestamp,
  Timestamp,
  type Unsubscribe,
} from 'firebase/firestore'
import { db } from '../../api/firebase'
import { getTimestamp } from '../../utils/firestore'
import {
  queryConnections,
  queryContactsByConnection,
  queryMessagesByConnection,
} from '../../utils/queries'
import type { Connection, ConnectionInput } from './types'

const COLLECTION = 'connections'

function connectionFromDoc(id: string, data: Record<string, unknown>): Connection {
  return {
    id,
    clientId: data.clientId as string,
    name: data.name as string,
    createdAt: getTimestamp(data, 'createdAt') ?? Timestamp.fromMillis(0),
  }
}

export function subscribeConnections(
  clientId: string,
  onData: (connections: Connection[]) => void,
): Unsubscribe {
  return onSnapshot(queryConnections(clientId), (snapshot) => {
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

export async function deleteConnectionWithCascade(
  clientId: string,
  connectionId: string,
): Promise<void> {
  const contactsSnap = await getDocs(queryContactsByConnection(clientId, connectionId))
  for (const d of contactsSnap.docs) {
    await deleteDoc(d.ref)
  }
  const messagesSnap = await getDocs(queryMessagesByConnection(clientId, connectionId))
  for (const d of messagesSnap.docs) {
    await deleteDoc(d.ref)
  }
  await deleteDoc(doc(db, COLLECTION, connectionId))
}
