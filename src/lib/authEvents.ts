const listeners = new Set<(subject: string) => void>()
export function onSessionExpired(listener: (subject: string) => void) {
  listeners.add(listener)
  return () => { listeners.delete(listener) }
}
export function notifySessionExpired(subject: string) {
  for (const listener of listeners) listener(subject)
}
