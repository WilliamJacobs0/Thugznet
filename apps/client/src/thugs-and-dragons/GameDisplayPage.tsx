import { useCallback, useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import type { AuthSession } from '../auth.ts'
import { getGame, resolveTurn, startTurn, type Game, type Turn } from './api.ts'
import './styles.css'

type GameDisplayPageProps = {
  authSession: AuthSession | null
}

export function GameDisplayPage({ authSession }: GameDisplayPageProps) {
  const gameId = Number(useParams().gameId)
  const [game, setGame] = useState<Game | null>(null)
  const [prompt, setPrompt] = useState('What do you do?')
  const [durationSeconds, setDurationSeconds] = useState('60')
  const [serverTime, setServerTime] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [starting, setStarting] = useState(false)
  const resolvingTurnId = useRef<number | null>(null)

  const refresh = useCallback(async () => {
    if (!Number.isInteger(gameId)) {
      setError('Invalid game.')
      return
    }

    try {
      const loadedGame = await getGame(authSession, gameId)
      const loadedServerTime = Date.parse(loadedGame.serverTime)
      setGame(loadedGame)
      setServerTime(loadedServerTime)
      setError(null)

      const expiredTurn = loadedGame.turns.find(
        (turn) =>
          !turn.resolvedAt &&
          new Date(turn.closesAt).getTime() <= loadedServerTime,
      )

      if (expiredTurn && resolvingTurnId.current !== expiredTurn.id) {
        resolvingTurnId.current = expiredTurn.id
        await resolveTurn(authSession, expiredTurn.id)
        const resolvedGame = await getGame(authSession, gameId)
        setGame(resolvedGame)
        setServerTime(Date.parse(resolvedGame.serverTime))
        resolvingTurnId.current = null
      }
    } catch (requestError: unknown) {
      setError(errorMessage(requestError))
      resolvingTurnId.current = null
    }
  }, [authSession, gameId])

  useEffect(() => {
    void refresh()
    const polling = window.setInterval(() => void refresh(), 1000)
    return () => window.clearInterval(polling)
  }, [refresh])

  async function beginTurn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setStarting(true)
    setError(null)

    try {
      await startTurn(authSession, gameId, prompt, Number(durationSeconds))
      await refresh()
    } catch (requestError: unknown) {
      setError(errorMessage(requestError))
    } finally {
      setStarting(false)
    }
  }

  const activeTurn = game?.turns.find((turn) => !turn.resolvedAt) ?? null
  const secondsRemaining = activeTurn
    ? Math.max(
        0,
        Math.ceil(
          (new Date(activeTurn.closesAt).getTime() - serverTime) / 1000,
        ),
      )
    : 0

  return (
    <main className="game-page game-display">
      <header className="game-toolbar">
        <Link to="/thugs-and-dragons">Exit game</Link>
        {game ? <span>Join code: {game.joinCode}</span> : null}
        {game ? (
          <Link
            to={`/thugs-and-dragons/games/${game.id}/player`}
            target="_blank"
          >
            Open player input <span aria-hidden="true">&#8599;</span>
          </Link>
        ) : null}
      </header>

      {error ? (
        <p className="error" role="alert">
          {error}
        </p>
      ) : null}
      {!game && !error ? <p className="loading">Loading world...</p> : null}

      {game ? (
        <>
          <section className="game-screen" aria-live="polite">
            <p className="screen-title">Thugs and Dragons</p>
            {activeTurn ? (
              <div className="active-turn">
                <p>Turn {activeTurn.number}</p>
                <h1>{activeTurn.prompt}</h1>
                <p>
                  {secondsRemaining > 0
                    ? `${secondsRemaining}s`
                    : 'Resolving...'}
                </p>
                <p>{inputCount(activeTurn)} received</p>
              </div>
            ) : (
              <div className="transcript">
                {game.turns.length === 0 ? (
                  <p>The world is quiet.</p>
                ) : (
                  game.turns.map((turn) => (
                    <article key={turn.id}>
                      <p className="turn-label">
                        Turn {turn.number} / {turn.prompt}
                      </p>
                      <p>{turn.narrative || 'Nothing was said.'}</p>
                    </article>
                  ))
                )}
              </div>
            )}
          </section>

          {!activeTurn ? (
            <form className="turn-controls" onSubmit={beginTurn}>
              <label>
                Prompt
                <input
                  required
                  value={prompt}
                  onChange={(event) => setPrompt(event.target.value)}
                />
              </label>
              <label>
                Input seconds
                <input
                  required
                  min="1"
                  step="1"
                  type="number"
                  value={durationSeconds}
                  onChange={(event) => setDurationSeconds(event.target.value)}
                />
              </label>
              <button disabled={starting} type="submit">
                {starting ? 'Starting...' : 'Start turn'}
              </button>
            </form>
          ) : null}
        </>
      ) : null}
    </main>
  )
}

function inputCount(turn: Turn) {
  const count = turn.inputs.length
  return `${count} ${count === 1 ? 'input' : 'inputs'}`
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Request failed'
}
