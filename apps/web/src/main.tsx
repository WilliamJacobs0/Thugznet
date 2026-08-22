import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { createAuthSession } from './auth.ts'

async function bootstrap() {
  const authSession = await createAuthSession()

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App authSession={authSession} />
    </StrictMode>,
  )
}

void bootstrap()
