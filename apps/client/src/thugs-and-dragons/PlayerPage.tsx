import { useCallback, useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import type { AuthSession } from '../auth.ts'
import { getGame, joinGame, submitInput, type Game } from './api.ts'
import './styles.css'

type PlayerPageProps = {
  authSession: AuthSession | null
}

export function PlayerPage({ authSession }: PlayerPageProps) {
  const gameId = Number(useParams().gameId)
  const [game, setGame] = useState<Game | null>(null)
  const [text, setText] = useState('')
  const [lastSent, setLastSent] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [sending, setSending] = useState(false)
  const [serverTime, setServerTime] = useState(0)

  const refresh = useCallback(async () => {
    if (!Number.isInteger(gameId)) {
      setError('Invalid game.')
      return
    }

    try {
      const loadedGame = await getGame(authSession, gameId)
      setGame(loadedGame)
      setServerTime(Date.parse(loadedGame.serverTime))
      setError(null)
    } catch (requestError: unknown) {
      setError(errorMessage(requestError))
    }
  }, [authSession, gameId])

  useEffect(() => {
    let active = true

    void joinGame(authSession, gameId)
      .then((joinedGame) => {
        if (active) {
          setGame(joinedGame)
          setServerTime(Date.parse(joinedGame.serverTime))
          setError(null)
        }
      })
      .catch((requestError: unknown) => {
        if (active) {
          setError(errorMessage(requestError))
        }
      })

    const polling = window.setInterval(() => void refresh(), 1000)
    return () => {
      active = false
      window.clearInterval(polling)
    }
  }, [authSession, gameId, refresh])

  async function sendInput(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!activeTurn || !text.trim()) {
      return
    }

    const submittedText = text
    setSending(true)
    setError(null)

    try {
      await submitInput(authSession, activeTurn.id, submittedText)
      setText('')
      setLastSent(submittedText)
      await refresh()
    } catch (requestError: unknown) {
      setError(errorMessage(requestError))
    } finally {
      setSending(false)
    }
  }

  const activeTurn = game?.turns.find((turn) => !turn.resolvedAt) ?? null
  const inputIsOpen = activeTurn
    ? new Date(activeTurn.closesAt).getTime() > serverTime
    : false

  return (
    <main className="game-page player-page">
      <header className="game-toolbar">
        <Link to="/thugs-and-dragons">Exit</Link>
        {game ? <span>Game {game.joinCode}</span> : null}
        {game ? (
          <Link to={`/thugs-and-dragons/games/${game.id}/display`}>
            Display
          </Link>
        ) : null}
      </header>

      <section className="player-console">
        <p className="eyebrow">Player input</p>
        {error ? (
          <p className="error" role="alert">
            {error}
          </p>
        ) : null}
        {!game && !error ? <p className="loading">Joining game...</p> : null}

        {activeTurn ? (
          <>
            <h1>{activeTurn.prompt}</h1>
            {inputIsOpen ? (
              <form onSubmit={sendInput}>
                <label>
                  What do you do?
                  <textarea
                    autoFocus
                    required
                    rows={6}
                    value={text}
                    onChange={(event) => setText(event.target.value)}
                  />
                </label>
                <button disabled={sending} type="submit">
                  {sending ? 'Sending...' : 'Send'}
                </button>
              </form>
            ) : (
              <p>Time is up. Waiting for the result...</p>
            )}
          </>
        ) : game ? (
          <p>Waiting for the next turn.</p>
        ) : null}

        {lastSent ? <p className="last-input">Sent: {lastSent}</p> : null}
      </section>
    </main>
  )
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Request failed'
}
