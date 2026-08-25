import { authenticatedRequest, request } from '../api.ts'
import type { AuthSession } from '../auth.ts'

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

export type ThugzMansionInput = {
  title: string
  listingUrl: string
  summary: string
  location: string | null
  bedrooms: number | null
}

export function getThugzcation() {
  return request<ThugzcationView>('/api/thugzcation')
}

export function addThugzMansion(
  session: AuthSession | null,
  mansion: ThugzMansionInput,
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

export function updateThugzMansion(
  session: AuthSession | null,
  mansionId: number,
  mansion: ThugzMansionInput,
) {
  return authenticatedRequest<ThugzMansion>(
    session,
    `/api/thugzcation/mansions/${mansionId}`,
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(mansion),
    },
  )
}

export function deleteThugzMansion(
  session: AuthSession | null,
  mansionId: number,
) {
  return authenticatedRequest<ThugzMansion>(
    session,
    `/api/thugzcation/mansions/${mansionId}`,
    { method: 'DELETE' },
  )
}
