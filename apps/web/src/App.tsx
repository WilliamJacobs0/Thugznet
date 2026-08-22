import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import './App.css'

type Thug = {
  id: number
  name: string
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
  thugz: Thug[]
  eligibleThugzMansions: ThugzMansion[]
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

function App() {
  const [view, setView] = useState<ThugzcationView | null>(null)
  const [mansion, setMansion] = useState(emptyMansion)
  const [error, setError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    void fetch('/api/thugzcation')
      .then(responseJson<ThugzcationView>)
      .then(setView)
      .catch((requestError: unknown) => {
        setError(
          requestError instanceof Error ? requestError.message : 'Request failed',
        )
      })
  }, [])

  async function addMansion(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setIsSaving(true)

    try {
      const createdMansion = await fetch('/api/thugzcation/mansions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mansion),
      }).then(responseJson<ThugzMansion>)

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
      setError(
        requestError instanceof Error ? requestError.message : 'Request failed',
      )
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

        <section className="thug-roster" aria-labelledby="thugz-title">
          <h2 id="thugz-title">Thugz:</h2>
          <ul>
            {view?.thugz.map((thug) => <li key={thug.id}>{thug.name}</li>)}
          </ul>
        </section>
      </header>

      {error ? <p className="error" role="alert">{error}</p> : null}

      <div className="workspace">
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

        <aside className="add-panel">
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
        </aside>
      </div>
    </main>
  )
}

export default App
