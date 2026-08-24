import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import type { AuthSession } from '../auth.ts'
import { createGame, deleteGame, getGames, type GameSummary } from './api.ts'
import './styles.css'

type GamesPageProps = {
  authSession: AuthSession | null
}

export function GamesPage({ authSession }: GamesPageProps) {
  const [games, setGames] = useState<GameSummary[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [deletingGameId, setDeletingGameId] = useState<number | null>(null)

  const refresh = useCallback(async () => {
    try {
      setGames(await getGames(authSession))
      setError(null)
    } catch (requestError: unknown) {
      setError(errorMessage(requestError))
    } finally {
      setLoading(false)
    }
  }, [authSession])

  useEffect(() => {
    void refresh()
  }, [refresh])

  async function addGame() {
    setCreating(true)
    setError(null)

    try {
      await createGame(authSession)
      await refresh()
    } catch (requestError: unknown) {
      setError(errorMessage(requestError))
    } finally {
      setCreating(false)
    }
  }

  async function removeGame(game: GameSummary) {
    if (!window.confirm(`Delete game ${game.joinCode}?`)) {
      return
    }

    setDeletingGameId(game.id)
    setError(null)

    try {
      await deleteGame(authSession, game.id)
      setGames((savedGames) =>
        savedGames.filter((savedGame) => savedGame.id !== game.id),
      )
    } catch (requestError: unknown) {
      setError(errorMessage(requestError))
    } finally {
      setDeletingGameId(null)
    }
  }

  return (
    <main className="game-page">
      <header className="game-page-header">
        <div>
          <p className="eyebrow">Saved worlds</p>
          <h1>Thugs and Dragons</h1>
        </div>
        <button
          className="compact-button"
          disabled={creating}
          onClick={addGame}
        >
          {creating ? 'Creating...' : 'New game'}
        </button>
      </header>

      {error ? (
        <p className="error" role="alert">
          {error}
        </p>
      ) : null}
      {loading ? <p className="loading">Loading games...</p> : null}
      {!loading && games.length === 0 ? (
        <p className="game-empty">No saved games. Make the first one.</p>
      ) : null}

      <section className="saved-games" aria-label="Saved games">
        {games.map((game) => (
          <article className="saved-game" key={game.id}>
            <div>
              <p className="game-code">Game {game.joinCode}</p>
              <p>
                {game.playerCount}{' '}
                {game.playerCount === 1 ? 'player' : 'players'}
                {' / '}
                {game.latestTurn
                  ? `Turn ${game.latestTurn.number}`
                  : 'Not started'}
              </p>
              <time dateTime={game.createdAt}>
                Created {new Date(game.createdAt).toLocaleString()}
              </time>
            </div>
            <div className="game-actions">
              <Link to={`/thugs-and-dragons/games/${game.id}/display`}>
                Resume
              </Link>
              <Link to={`/thugs-and-dragons/games/${game.id}/player`}>
                Player input
              </Link>
              <button
                className="text-button danger"
                disabled={deletingGameId === game.id}
                onClick={() => removeGame(game)}
              >
                {deletingGameId === game.id ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </article>
        ))}
      </section>
    </main>
  )
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Request failed'
}
