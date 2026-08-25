import { authenticatedRequest } from '../api.ts'
import type { AuthSession } from '../auth.ts'

export type GameSummary = {
  id: number
  joinCode: string
  createdAt: string
  playerCount: number
  latestTurn: {
    number: number
    resolvedAt: string | null
    narrative: string | null
  } | null
}

export type Game = {
  id: number
  joinCode: string
  createdAt: string
  serverTime: string
  world: {
    description: string
    characters: WorldEntity[]
    locations: WorldEntity[]
    things: WorldEntity[]
  } | null
  players: Array<{
    id: number
    thug: {
      id: number
      firstName: string
      displayName: string
    }
  }>
  turns: Turn[]
}

export type Turn = {
  id: number
  number: number
  prompt: string
  openedAt: string
  closesAt: string
  resolvedAt: string | null
  narrative: string | null
  inputs: Array<{
    id: number
    text: string
    createdAt: string
    player: {
      id: number
      thug: { displayName: string }
    }
  }>
}

export type SubmittedInput = {
  id: number
  turnId: number
  playerId: number
  text: string
  createdAt: string
}

type WorldEntity = {
  id: number
  name: string
  description: string
}

const basePath = '/api/thugs-and-dragons'

export function getGames(session: AuthSession | null) {
  return authenticatedRequest<GameSummary[]>(session, `${basePath}/games`)
}

export function createGame(session: AuthSession | null) {
  return authenticatedRequest<Game>(session, `${basePath}/games`, {
    method: 'POST',
  })
}

export function getGame(session: AuthSession | null, gameId: number) {
  return authenticatedRequest<Game>(session, `${basePath}/games/${gameId}`)
}

export function deleteGame(session: AuthSession | null, gameId: number) {
  return authenticatedRequest<{ id: number }>(
    session,
    `${basePath}/games/${gameId}`,
    { method: 'DELETE' },
  )
}

export function joinGame(session: AuthSession | null, gameId: number) {
  return authenticatedRequest<Game>(
    session,
    `${basePath}/games/${gameId}/players`,
    { method: 'POST' },
  )
}

export function startTurn(
  session: AuthSession | null,
  gameId: number,
  prompt: string,
  durationSeconds: number,
) {
  return authenticatedRequest<Turn>(
    session,
    `${basePath}/games/${gameId}/turns`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, durationSeconds }),
    },
  )
}

export function submitInput(
  session: AuthSession | null,
  turnId: number,
  text: string,
) {
  return authenticatedRequest<SubmittedInput>(
    session,
    `${basePath}/turns/${turnId}/inputs`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    },
  )
}

export function resolveTurn(session: AuthSession | null, turnId: number) {
  return authenticatedRequest<{
    id: number
    number: number
    narrative: string | null
    resolvedAt: string | null
  }>(session, `${basePath}/turns/${turnId}/resolve`, { method: 'POST' })
}
