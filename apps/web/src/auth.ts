import {
  BrowserCacheLocation,
  InteractionRequiredAuthError,
  PublicClientApplication,
} from '@azure/msal-browser'

export type AuthSession = {
  client: PublicClientApplication
  apiScope: string
}

export async function createAuthSession(): Promise<AuthSession | null> {
  const tenantId = import.meta.env.VITE_ENTRA_TENANT_ID
  const clientId = import.meta.env.VITE_ENTRA_SPA_CLIENT_ID
  const apiScope = import.meta.env.VITE_ENTRA_API_SCOPE

  if (!tenantId || !clientId || !apiScope) {
    return null
  }

  const client = new PublicClientApplication({
    auth: {
      clientId,
      authority: `https://login.microsoftonline.com/${tenantId}`,
      redirectUri: window.location.origin,
      postLogoutRedirectUri: window.location.origin,
    },
    cache: { cacheLocation: BrowserCacheLocation.SessionStorage },
  })

  await client.initialize()
  const redirectResult = await client.handleRedirectPromise()
  const account = redirectResult?.account ?? client.getAllAccounts()[0]

  if (account) {
    client.setActiveAccount(account)
  }

  return { client, apiScope }
}

export async function getApiToken(session: AuthSession) {
  const account = session.client.getActiveAccount()

  if (!account) {
    throw new Error('Sign in is required.')
  }

  try {
    const result = await session.client.acquireTokenSilent({
      account,
      scopes: [session.apiScope],
    })
    return result.accessToken
  } catch (error) {
    if (error instanceof InteractionRequiredAuthError) {
      await session.client.acquireTokenRedirect({
        account,
        scopes: [session.apiScope],
      })
    }

    throw error
  }
}
