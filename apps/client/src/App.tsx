import { useEffect, useState } from 'react'
import { Link, Navigate, NavLink, Route, Routes } from 'react-router-dom'
import './App.css'
import type { AuthSession } from './auth.ts'
import { GameDisplayPage } from './thugs-and-dragons/GameDisplayPage.tsx'
import { GamesPage } from './thugs-and-dragons/GamesPage.tsx'
import { PlayerPage } from './thugs-and-dragons/PlayerPage.tsx'
import ThugzcationPage from './thugzcation/ThugzcationPage.tsx'
import { getCurrentThug, type Thug } from './thugz/api.ts'
import { ThugzPage } from './thugz/ThugzPage.tsx'

type AppProps = {
  authSession: AuthSession | null
}

function App({ authSession }: AppProps) {
  const isSignedIn = Boolean(authSession?.client.getActiveAccount())
  const [currentThug, setCurrentThug] = useState<Thug | null>(null)
  const [identityError, setIdentityError] = useState<string | null>(null)

  useEffect(() => {
    if (authSession && !isSignedIn) {
      return
    }

    void getCurrentThug(authSession)
      .then((thug) => {
        setCurrentThug(thug)
        setIdentityError(null)
      })
      .catch((error: unknown) => {
        setCurrentThug(null)
        setIdentityError(
          error instanceof Error ? error.message : 'Could not load identity.',
        )
      })
  }, [authSession, isSignedIn])

  async function signIn() {
    if (authSession) {
      await authSession.client.loginRedirect({ scopes: [authSession.apiScope] })
    }
  }

  async function signOut() {
    await authSession?.client.logoutRedirect()
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <Link className="app-name" to="/">
          Thugznet
        </Link>
        <nav className="app-navigation" aria-label="Thugznet">
          <NavLink to="/" end>
            Thugzcation
          </NavLink>
          <NavLink to="/thugs-and-dragons">Thugs and Dragons</NavLink>
          <NavLink to="/thugz">Thugz</NavLink>
        </nav>
        <div className="identity">
          {currentThug ? (
            <Link to="/thugz">{currentThug.displayName}</Link>
          ) : null}
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

      {identityError ? (
        <p className="shell-error" role="alert">
          {identityError}
        </p>
      ) : null}

      <Routes>
        <Route
          path="/"
          element={
            <ThugzcationPage
              authSession={authSession}
              currentThug={currentThug}
            />
          }
        />
        <Route
          path="/thugs-and-dragons"
          element={<GamesPage authSession={authSession} />}
        />
        <Route
          path="/thugs-and-dragons/games/:gameId/display"
          element={<GameDisplayPage authSession={authSession} />}
        />
        <Route
          path="/thugs-and-dragons/games/:gameId/player"
          element={<PlayerPage authSession={authSession} />}
        />
        <Route
          path="/thugz"
          element={
            <ThugzPage
              key={currentThug?.id ?? 'anonymous'}
              authSession={authSession}
              currentThug={currentThug}
              onCurrentThugChange={setCurrentThug}
            />
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}

export default App
