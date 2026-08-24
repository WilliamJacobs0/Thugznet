import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import './App.css'
import {
  addThugzMansion,
  deleteThugzMansion,
  getCurrentThug,
  getThugzcation,
  getThugz,
  updateThugzMansion,
  updateCurrentThug,
  type Thug,
  type ThugzMansion,
  type ThugzcationView,
} from './api.ts'
import type { AuthSession } from './auth.ts'

type AppProps = {
  authSession: AuthSession | null
}

const emptyMansion = {
  title: '',
  listingUrl: '',
  summary: '',
  location: '',
  bedrooms: '',
}

function App({ authSession }: AppProps) {
  const isSignedIn = Boolean(authSession?.client.getActiveAccount())
  const [view, setView] = useState<ThugzcationView | null>(null)
  const [currentThug, setCurrentThug] = useState<Thug | null>(null)
  const [thugz, setThugz] = useState<Thug[]>([])
  const [displayName, setDisplayName] = useState('')
  const [mansion, setMansion] = useState(emptyMansion)
  const [editingMansionId, setEditingMansionId] = useState<number | null>(null)
  const [deletingMansionId, setDeletingMansionId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [profileIsSaving, setProfileIsSaving] = useState(false)
  const [mansionIsSaving, setMansionIsSaving] = useState(false)

  useEffect(() => {
    void getThugzcation()
      .then(setView)
      .catch(showError)
  }, [])

  useEffect(() => {
    if (authSession && !isSignedIn) {
      return
    }

    void Promise.all([
      getCurrentThug(authSession),
      getThugz(authSession),
    ])
      .then(([profile, roster]) => {
        setCurrentThug(profile)
        setDisplayName(profile.displayName)
        setThugz(roster)
      })
      .catch((requestError: unknown) => {
        if (authSession) {
          showError(requestError)
        }
      })
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

    if (!currentThug) {
      return
    }

    setError(null)
    setProfileIsSaving(true)

    try {
      const updatedThug = await updateCurrentThug(authSession, displayName)

      setCurrentThug(updatedThug)
      setThugz((roster) =>
        roster.map((thug) => (thug.id === updatedThug.id ? updatedThug : thug)),
      )
    } catch (requestError: unknown) {
      showError(requestError)
    } finally {
      setProfileIsSaving(false)
    }
  }

  function editMansion(selectedMansion: ThugzMansion) {
    setEditingMansionId(selectedMansion.id)
    setMansion({
      title: selectedMansion.title,
      listingUrl: selectedMansion.listingUrl,
      summary: selectedMansion.summary,
      location: selectedMansion.location ?? '',
      bedrooms: selectedMansion.bedrooms?.toString() ?? '',
    })
  }

  function resetMansionForm() {
    setEditingMansionId(null)
    setMansion(emptyMansion)
  }

  async function saveMansion(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!currentThug) {
      return
    }

    setError(null)
    setMansionIsSaving(true)

    try {
      const mansionInput = {
        ...mansion,
        location: mansion.location || null,
        bedrooms: mansion.bedrooms === '' ? null : Number(mansion.bedrooms),
      }
      const savedMansion = editingMansionId === null
        ? await addThugzMansion(authSession, mansionInput)
        : await updateThugzMansion(authSession, editingMansionId, mansionInput)

      setView((currentView) =>
        currentView
          ? {
              ...currentView,
              thugzcation: {
                ...currentView.thugzcation,
                selectedThugzMansion:
                  currentView.thugzcation.selectedThugzMansion?.id ===
                  savedMansion.id
                    ? savedMansion
                    : currentView.thugzcation.selectedThugzMansion,
              },
              eligibleThugzMansions: editingMansionId === null
                ? [savedMansion, ...currentView.eligibleThugzMansions]
                : currentView.eligibleThugzMansions.map((existingMansion) =>
                    existingMansion.id === savedMansion.id
                      ? savedMansion
                      : existingMansion,
                  ),
            }
          : currentView,
      )
      resetMansionForm()
    } catch (requestError: unknown) {
      showError(requestError)
    } finally {
      setMansionIsSaving(false)
    }
  }

  async function removeMansion(selectedMansion: ThugzMansion) {
    if (!currentThug || !window.confirm(`Delete “${selectedMansion.title}”?`)) {
      return
    }

    setError(null)
    setDeletingMansionId(selectedMansion.id)

    try {
      await deleteThugzMansion(authSession, selectedMansion.id)
      setView((currentView) =>
        currentView
          ? {
              ...currentView,
              thugzcation: {
                ...currentView.thugzcation,
                selectedThugzMansion:
                  currentView.thugzcation.selectedThugzMansion?.id ===
                  selectedMansion.id
                    ? null
                    : currentView.thugzcation.selectedThugzMansion,
              },
              eligibleThugzMansions:
                currentView.eligibleThugzMansions.filter(
                  (existingMansion) =>
                    existingMansion.id !== selectedMansion.id,
                ),
            }
          : currentView,
      )

      if (editingMansionId === selectedMansion.id) {
        resetMansionForm()
      }
    } catch (requestError: unknown) {
      showError(requestError)
    } finally {
      setDeletingMansionId(null)
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
                {eligibleMansion.location || eligibleMansion.bedrooms !== null ? (
                  <dl>
                    {eligibleMansion.location ? (
                      <div>
                        <dt>Location</dt>
                        <dd>{eligibleMansion.location}</dd>
                      </div>
                    ) : null}
                    {eligibleMansion.bedrooms !== null ? (
                      <div>
                        <dt>Bedrooms</dt>
                        <dd>{eligibleMansion.bedrooms}</dd>
                      </div>
                    ) : null}
                  </dl>
                ) : null}
                <div className="mansion-card-footer">
                  <a href={eligibleMansion.listingUrl} target="_blank" rel="noreferrer">
                    View listing <span aria-hidden="true">&#8599;</span>
                  </a>
                  {currentThug ? (
                    <div className="mansion-actions">
                      <button
                        className="text-button"
                        type="button"
                        onClick={() => editMansion(eligibleMansion)}
                      >
                        Edit
                      </button>
                      <button
                        className="text-button danger"
                        disabled={deletingMansionId === eligibleMansion.id}
                        type="button"
                        onClick={() => removeMansion(eligibleMansion)}
                      >
                        {deletingMansionId === eligibleMansion.id
                          ? 'Deleting...'
                          : 'Delete'}
                      </button>
                    </div>
                  ) : null}
                </div>
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
                <button disabled={profileIsSaving} type="submit">
                  {profileIsSaving ? 'Saving...' : 'Save name'}
                </button>
              </form>
            </section>

            <section className="add-panel">
              <p className="eyebrow">
                {editingMansionId === null
                  ? 'Nominate a house'
                  : 'Update the details'}
              </p>
              <h2>
                {editingMansionId === null
                  ? 'Add a Thugz Mansion'
                  : 'Edit Thugz Mansion'}
              </h2>
              <form onSubmit={saveMansion}>
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
                  Location
                  <input
                    value={mansion.location}
                    onChange={(event) =>
                      setMansion({ ...mansion, location: event.target.value })
                    }
                    placeholder="Town, State"
                  />
                </label>

                <label>
                  Bedrooms
                  <input
                    min="0"
                    step="1"
                    type="number"
                    value={mansion.bedrooms}
                    onChange={(event) =>
                      setMansion({ ...mansion, bedrooms: event.target.value })
                    }
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

                <div className="form-actions">
                  <button disabled={mansionIsSaving} type="submit">
                    {mansionIsSaving
                      ? 'Saving...'
                      : editingMansionId === null ? 'Add mansion' : 'Save mansion'}
                  </button>
                  {editingMansionId !== null ? (
                    <button
                      className="text-button"
                      disabled={mansionIsSaving}
                      type="button"
                      onClick={resetMansionForm}
                    >
                      Cancel
                    </button>
                  ) : null}
                </div>
              </form>
            </section>
          </aside>
        ) : null}
      </div>
    </main>
  )
}

export default App
