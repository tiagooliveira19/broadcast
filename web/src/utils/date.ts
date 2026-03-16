import type { Timestamp } from 'firebase/firestore'

export function timestampToDate(ts: Timestamp | null): Date | null {
  if (!ts) return null
  return ts.toDate()
}

export function formatTimestamp(
  ts: Timestamp | null,
  locale = 'pt-BR',
): string {
  if (!ts) return '-'
  return timestampToDate(ts)!.toLocaleString(locale)
}

export function formatTimestampForInput(ts: Timestamp | null): string {
  if (!ts) return ''
  return timestampToDate(ts)!.toISOString().slice(0, 16)
}

export function isBeforeNow(ts: Timestamp | null): boolean {
  if (!ts) return false
  return timestampToDate(ts)!.getTime() <= Date.now()
}
