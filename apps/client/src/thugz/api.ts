import { authenticatedRequest } from '../api.ts'
import type { AuthSession } from '../auth.ts'

export type Thug = {
  id: number
  firstName: string
  displayName: string
}

export function getCurrentThug(session: AuthSession | null) {
  return authenticatedRequest<Thug>(session, '/api/me')
}

export function getThugz(session: AuthSession | null) {
  return authenticatedRequest<Thug[]>(session, '/api/thugz')
}

export function updateCurrentThug(
  session: AuthSession | null,
  displayName: string,
) {
  return authenticatedRequest<Thug>(session, '/api/me', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ displayName }),
  })
}
