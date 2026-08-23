import { getApiToken, type AuthSession } from './auth.ts'

export type Thug = {
  id: number
  firstName: string
  displayName: string
}

export type ThugzMansion = {
  id: number
  title: string
  listingUrl: string
  summary: string
  location: string | null
  bedrooms: number | null
}

export type ThugzcationView = {
  thugzcation: {
    id: number
    year: number
    selectedThugzMansion: ThugzMansion | null
  }
  eligibleThugzMansions: ThugzMansion[]
}

export type NewThugzMansion = {
  title: string
  listingUrl: string
  summary: string
}

export function getThugzcation() {
  return request<ThugzcationView>('/api/thugzcation')
}

export function getCurrentThug(session: AuthSession) {
  return authenticatedRequest<Thug>(session, '/api/me')
}

export function getThugz(session: AuthSession) {
  return authenticatedRequest<Thug[]>(session, '/api/thugz')
}

export function updateCurrentThug(
  session: AuthSession,
  displayName: string,
) {
  return authenticatedRequest<Thug>(session, '/api/me', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ displayName }),
  })
}

export function addThugzMansion(
  session: AuthSession,
  mansion: NewThugzMansion,
) {
  return authenticatedRequest<ThugzMansion>(
    session,
    '/api/thugzcation/mansions',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(mansion),
    },
  )
}

async function authenticatedRequest<T>(
  session: AuthSession,
  input: RequestInfo | URL,
  init?: RequestInit,
) {
  const token = await getApiToken(session)
  const headers = new Headers(init?.headers)
  headers.set('Authorization', `Bearer ${token}`)

  return request<T>(input, { ...init, headers })
}

async function request<T>(input: RequestInfo | URL, init?: RequestInit) {
  const response = await fetch(input, init)

  if (response.ok) {
    return response.json() as Promise<T>
  }

  const error = (await response.json().catch(() => null)) as {
    message?: string
  } | null
  throw new Error(error?.message ?? `Request failed with status ${response.status}`)
}
