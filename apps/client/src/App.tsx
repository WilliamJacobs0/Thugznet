import { Navigate, NavLink, Route, Routes } from 'react-router-dom'
import './App.css'
import type { AuthSession } from './auth.ts'
import { GameDisplayPage } from './thugs-and-dragons/GameDisplayPage.tsx'
import { GamesPage } from './thugs-and-dragons/GamesPage.tsx'
import { PlayerPage } from './thugs-and-dragons/PlayerPage.tsx'
import ThugzcationPage from './thugzcation/ThugzcationPage.tsx'

type AppProps = {
  authSession: AuthSession | null
}

function App({ authSession }: AppProps) {
  return (
    <div className="app-shell">
      <nav className="app-navigation" aria-label="Thugznet">
        <NavLink to="/" end>
          Thugzcation
        </NavLink>
        <NavLink to="/thugs-and-dragons">Thugs and Dragons</NavLink>
      </nav>

      <Routes>
        <Route
          path="/"
          element={<ThugzcationPage authSession={authSession} />}
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
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}

export default App
