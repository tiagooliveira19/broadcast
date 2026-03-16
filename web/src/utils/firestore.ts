import type { Timestamp } from 'firebase/firestore'

export function getTimestamp(
  data: Record<string, unknown>,
  key: string,
): Timestamp | null {
  const value = data[key]
  if (value == null) return null
  return value as Timestamp
}
