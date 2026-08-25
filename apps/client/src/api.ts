import { getApiToken, type AuthSession } from './auth.ts'

export async function authenticatedRequest<T>(
  session: AuthSession | null,
  input: RequestInfo | URL,
  init?: RequestInit,
) {
  const headers = new Headers(init?.headers)

  if (session) {
    const token = await getApiToken(session)
    headers.set('Authorization', `Bearer ${token}`)
  }

  return request<T>(input, { ...init, headers })
}

export async function request<T>(input: RequestInfo | URL, init?: RequestInit) {
  const response = await fetch(input, init)

  if (response.ok) {
    return response.json() as Promise<T>
  }

  const error = (await response.json().catch(() => null)) as {
    message?: string
  } | null
  throw new Error(
    error?.message ?? `Request failed with status ${response.status}`,
  )
}
