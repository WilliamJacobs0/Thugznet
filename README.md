# Thugzcation

## Local development

```powershell
npm install
npm run db:up
npm run db:migrate
npm run db:seed
npm run dev:server
npm run dev:client
```

The mansion list is public and works without Entra configuration. Profile,
roster, and mansion-creation endpoints require authentication.

## Entra configuration

Create two app registrations in the same Entra tenant:

1. An API registration exposing the delegated scope `access_as_user`.
2. A SPA registration with `http://localhost:5173` as a redirect URI and
   delegated permission to the API scope.

Copy `apps/server/.env.example` to `apps/server/.env` and
`apps/client/.env.example` to `apps/client/.env`, then supply the tenant,
application, and scope identifiers. No client secret is used by the SPA or
required by the API for token validation.

Invite each friend as an Entra B2B guest. Put their Entra object IDs in the
corresponding `THUG_*_ENTRA_OBJECT_ID` values and rerun `npm run db:seed` to
bind those accounts to the seeded Thugs.
