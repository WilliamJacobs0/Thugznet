import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import type { AuthSession } from '../auth.ts'
import { getThugz, updateCurrentThug, type Thug } from './api.ts'
import './styles.css'

type ThugzPageProps = {
  authSession: AuthSession | null
  currentThug: Thug | null
  onCurrentThugChange: (thug: Thug) => void
}

export function ThugzPage({
  authSession,
  currentThug,
  onCurrentThugChange,
}: ThugzPageProps) {
  const [thugz, setThugz] = useState<Thug[]>([])
  const [displayName, setDisplayName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setDisplayName(currentThug?.displayName ?? '')

    if (!currentThug) {
      setThugz([])
      return
    }

    void getThugz(authSession)
      .then((roster) => {
        setThugz(roster)
        setError(null)
      })
      .catch((requestError: unknown) => setError(errorMessage(requestError)))
  }, [authSession, currentThug])

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)
    setError(null)

    try {
      const updatedThug = await updateCurrentThug(authSession, displayName)
      onCurrentThugChange(updatedThug)
      setThugz((roster) =>
        roster.map((thug) => (thug.id === updatedThug.id ? updatedThug : thug)),
      )
    } catch (requestError: unknown) {
      setError(errorMessage(requestError))
    } finally {
      setSaving(false)
    }
  }

  return (
    <main className="thugz-page">
      <header className="page-header">
        <div>
          <p className="eyebrow">The group</p>
          <h1>Thugz</h1>
        </div>
      </header>

      {error ? (
        <p className="error" role="alert">
          {error}
        </p>
      ) : null}

      <div className="thugz-workspace">
        <section className="roster-panel" aria-labelledby="roster-title">
          <h2 id="roster-title">Roster</h2>
          {thugz.length > 0 ? (
            <ul>
              {thugz.map((thug) => (
                <li key={thug.id}>
                  <strong>{thug.displayName}</strong>
                  <span>{thug.firstName}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p>
              {currentThug ? 'Loading Thugz...' : 'Sign in to view the Thugz.'}
            </p>
          )}
        </section>

        {currentThug ? (
          <section className="profile-panel">
            <p className="eyebrow">Signed in as {currentThug.firstName}</p>
            <h2>Your profile</h2>
            <form onSubmit={saveProfile}>
              <label>
                Display name
                <input
                  required
                  maxLength={50}
                  value={displayName}
                  onChange={(event) => setDisplayName(event.target.value)}
                />
              </label>
              <button disabled={saving} type="submit">
                {saving ? 'Saving...' : 'Save name'}
              </button>
            </form>
          </section>
        ) : null}
      </div>
    </main>
  )
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Request failed'
}
