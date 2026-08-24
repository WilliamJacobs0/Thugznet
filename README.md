# Thugznet

Thugznet is the small application the Thugz use to organize their yearly
Thugzcation. Its first job is keeping eligible Thugz Mansions easy to add,
review, and compare.

## How it is organized

- `apps/client` is the React application running in the browser.
- `apps/server` is the trusted NestJS application and HTTP API.
- `apps/server/prisma` defines the PostgreSQL schema, migrations, and seed data.

The mansion list is public. Profile changes, the Thug roster, and mansion
creation require the server to resolve the request to a seeded `Thug`.

## Authentication

Authentication proves which seeded Thug is making a request. It never creates
users automatically.

In local development, the server reads the developer's identity from their
untracked `apps/server/.env` file:

```env
AUTH_MODE="local"
LOCAL_THUG_FIRST_NAME="Willie"
```

Local mode loads that existing database record and then uses
the same application behavior as production. It is refused when
`NODE_ENV=production`.

Production will use Microsoft Entra:

1. The browser signs in through a SPA app registration.
2. It sends the resulting API access token to the server.
3. The server verifies the token and its `access_as_user` scope.
4. The token's Entra object ID must match a seeded Thug's `entraObjectId`.

An authenticated Entra account without a matching Thug receives `403: Not a Thug`. No
passwords or client secrets are stored by Thugznet.

## Local development

Create the local server configuration once:

```powershell
Copy-Item apps/server/.env.example apps/server/.env
```

Set `LOCAL_THUG_FIRST_NAME`, then prepare the local database:

```powershell
make setup
```

Start PostgreSQL, the server, and the client together:

```powershell
make dev
```

Vite opens `http://localhost:5173`. Press `Ctrl+C` to stop the client and
server, then use `make stop` when you also want to stop PostgreSQL.
