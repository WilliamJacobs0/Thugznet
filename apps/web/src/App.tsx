import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import './App.css'
import { getApiToken, type AuthSession } from './auth.ts'

type Thug = {
  id: number
  firstName: string
  displayName: string
}

type ThugzMansion = {
  id: number
  title: string
  listingUrl: string
  summary: string
  location: string | null
  bedrooms: number | null
}

type ThugzcationView = {
  thugzcation: {
    id: number
    year: number
    selectedThugzMansion: ThugzMansion | null
  }
  eligibleThugzMansions: ThugzMansion[]
}

type AppProps = {
  authSession: AuthSession | null
}

const emptyMansion = {
  title: '',
  listingUrl: '',
  summary: '',
}

async function responseJson<T>(response: Response): Promise<T> {
  if (response.ok) {
    return response.json() as Promise<T>
  }

  const error = (await response.json().catch(() => null)) as {
    message?: string
  } | null
  throw new Error(error?.message ?? `Request failed with status ${response.status}`)
}

async function authenticatedJson<T>(
  session: AuthSession,
  input: RequestInfo | URL,
  init?: RequestInit,
) {
  const token = await getApiToken(session)
  const headers = new Headers(init?.headers)
  headers.set('Authorization', `Bearer ${token}`)

  return fetch(input, { ...init, headers }).then(responseJson<T>)
}

function App({ authSession }: AppProps) {
  const isSignedIn = Boolean(authSession?.client.getActiveAccount())
  const [view, setView] = useState<ThugzcationView | null>(null)
  const [currentThug, setCurrentThug] = useState<Thug | null>(null)
  const [thugz, setThugz] = useState<Thug[]>([])
  const [displayName, setDisplayName] = useState('')
  const [mansion, setMansion] = useState(emptyMansion)
  const [error, setError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    void fetch('/api/thugzcation')
      .then(responseJson<ThugzcationView>)
      .then(setView)
      .catch(showError)
  }, [])

  useEffect(() => {
    if (!authSession || !isSignedIn) {
      return
    }

    void Promise.all([
      authenticatedJson<Thug>(authSession, '/api/me'),
      authenticatedJson<Thug[]>(authSession, '/api/thugz'),
    ])
      .then(([profile, roster]) => {
        setCurrentThug(profile)
        setDisplayName(profile.displayName)
        setThugz(roster)
      })
      .catch(showError)
  }, [authSession, isSignedIn])

  function showError(requestError: unknown) {
    setError(
      requestError instanceof Error ? requestError.message : 'Request failed',
    )
  }

  async function signIn() {
    if (!authSession) {
      return
    }

    await authSession.client.loginRedirect({ scopes: [authSession.apiScope] })
  }

  async function signOut() {
    await authSession?.client.logoutRedirect()
  }

  async function updateProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!authSession || !currentThug) {
      return
    }

    setError(null)
    setIsSaving(true)

    try {
      const updatedThug = await authenticatedJson<Thug>(authSession, '/api/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ displayName }),
      })

      setCurrentThug(updatedThug)
      setThugz((roster) =>
        roster.map((thug) => (thug.id === updatedThug.id ? updatedThug : thug)),
      )
    } catch (requestError: unknown) {
      showError(requestError)
    } finally {
      setIsSaving(false)
    }
  }

  async function addMansion(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!authSession) {
      return
    }

    setError(null)
    setIsSaving(true)

    try {
      const createdMansion = await authenticatedJson<ThugzMansion>(
        authSession,
        '/api/thugzcation/mansions',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(mansion),
        },
      )

      setView((currentView) =>
        currentView
          ? {
              ...currentView,
              eligibleThugzMansions: [
                createdMansion,
                ...currentView.eligibleThugzMansions,
              ],
            }
          : currentView,
      )
      setMansion(emptyMansion)
    } catch (requestError: unknown) {
      showError(requestError)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <main>
      <header className="page-header">
        <div>
          <p className="eyebrow">
            {view ? `${view.thugzcation.year} trip` : 'Annual trip'}
          </p>
          <h1>Thugzcation</h1>
        </div>

        <div className="identity">
          {currentThug ? <span>{currentThug.displayName}</span> : null}
          {isSignedIn ? (
            <button className="text-button" type="button" onClick={signOut}>
              Sign out
            </button>
          ) : authSession ? (
            <button className="text-button" type="button" onClick={signIn}>
              Sign in
            </button>
          ) : null}
        </div>
      </header>

      {currentThug ? (
        <section className="thug-roster" aria-labelledby="thugz-title">
          <h2 id="thugz-title">Thugz:</h2>
          <ul>
            {thugz.map((thug) => <li key={thug.id}>{thug.displayName}</li>)}
          </ul>
        </section>
      ) : null}

      {error ? <p className="error" role="alert">{error}</p> : null}

      <div className={`workspace ${currentThug ? '' : 'public'}`}>
        <section className="mansion-section" aria-labelledby="mansions-title">
          <div className="section-heading">
            <div>
              <p className="eyebrow">The contenders</p>
              <h2 id="mansions-title">Eligible Thugz Mansions</h2>
            </div>
            {view ? <span>{view.eligibleThugzMansions.length}</span> : null}
          </div>

          {!view && !error ? <p className="loading">Loading mansions...</p> : null}

          {view && view.eligibleThugzMansions.length === 0 ? (
            <p className="empty-state">No eligible mansions yet.</p>
          ) : null}

          <div className="mansion-grid">
            {view?.eligibleThugzMansions.map((eligibleMansion) => (
              <article className="mansion-card" key={eligibleMansion.id}>
                <h3>{eligibleMansion.title}</h3>
                {eligibleMansion.summary ? <p>{eligibleMansion.summary}</p> : null}
                {eligibleMansion.location || eligibleMansion.bedrooms ? (
                  <dl>
                    {eligibleMansion.location ? (
                      <div>
                        <dt>Location</dt>
                        <dd>{eligibleMansion.location}</dd>
                      </div>
                    ) : null}
                    {eligibleMansion.bedrooms ? (
                      <div>
                        <dt>Bedrooms</dt>
                        <dd>{eligibleMansion.bedrooms}</dd>
                      </div>
                    ) : null}
                  </dl>
                ) : null}
                <a href={eligibleMansion.listingUrl} target="_blank" rel="noreferrer">
                  View listing <span aria-hidden="true">↗</span>
                </a>
              </article>
            ))}
          </div>
        </section>

        {currentThug ? (
          <aside className="sidebar">
            <section className="profile-panel">
              <p className="eyebrow">Signed in as {currentThug.firstName}</p>
              <h2>Your display name</h2>
              <form onSubmit={updateProfile}>
                <label>
                  Display name
                  <input
                    required
                    maxLength={50}
                    value={displayName}
                    onChange={(event) => setDisplayName(event.target.value)}
                  />
                </label>
                <button disabled={isSaving} type="submit">Save name</button>
              </form>
            </section>

            <section className="add-panel">
              <p className="eyebrow">Nominate a house</p>
              <h2>Add a Thugz Mansion</h2>
              <form onSubmit={addMansion}>
                <label>
                  Title
                  <input
                    required
                    value={mansion.title}
                    onChange={(event) =>
                      setMansion({ ...mansion, title: event.target.value })
                    }
                    placeholder="House title"
                  />
                </label>

                <label>
                  Listing link
                  <input
                    required
                    type="url"
                    value={mansion.listingUrl}
                    onChange={(event) =>
                      setMansion({ ...mansion, listingUrl: event.target.value })
                    }
                    placeholder="https://..."
                  />
                </label>

                <label>
                  Summary
                  <textarea
                    required
                    rows={5}
                    value={mansion.summary}
                    onChange={(event) =>
                      setMansion({ ...mansion, summary: event.target.value })
                    }
                    placeholder="What should the Thugz know?"
                  />
                </label>

                <button disabled={isSaving} type="submit">
                  {isSaving ? 'Adding...' : 'Add mansion'}
                </button>
              </form>
            </section>
          </aside>
        ) : null}
      </div>
    </main>
  )
}

export default App
