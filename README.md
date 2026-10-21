# Authkeep

Keep your authenticator codes in one place. Load TOTP secrets once, then read live codes from an API or a small web dashboard. Email accounts are planned next.

```
apps/
├── api/   NestJS 12 + TypeORM + PostgreSQL. REST API protected by an API key
└── web/   Next.js 16 dashboard. Password login, calls the API server-side
docker-compose.yml   Postgres + api + web, ready for Coolify
```

## API

All routes except `GET /health` need `x-api-key: <key>` (or `Authorization: Bearer <key>`). Interactive docs are at `/docs`.

| Method | Path | What it does |
|---|---|---|
| `POST` | `/totp/accounts` | Add an account: `{ "uri": "otpauth://totp/..." }` or `{ "label", "secret", "issuer?", "digits?", "period?", "algorithm?" }` |
| `GET` | `/totp/accounts` | List accounts (secrets are never returned) |
| `DELETE` | `/totp/accounts/:id` | Remove an account |
| `GET` | `/totp/codes` | Live codes for every account |
| `GET` | `/totp/codes/:id` | Live code for one account |
| `GET` | `/health` | Database health check (public) |

```bash
curl -H "x-api-key: $KEY" https://api.example.com/totp/codes
# [{"id":"…","label":"me@example.com","issuer":"GitHub","code":"829274","remainingSeconds":19,"period":30}]
```

Secrets are encrypted with AES-256-GCM before they reach Postgres, using `ENCRYPTION_KEY`.

## Deploy on Coolify

1. Push this repo to GitHub.
2. In Coolify: **New Resource → Public/Private Repository**, pick the repo, and choose the **Docker Compose** build pack. Base directory: `/`, compose file: `/docker-compose.yml`.
3. Under **Domains**, set one for each service, for example:
   - `api` → `https://api.authkeep.example.com:3000`
   - `web` → `https://authkeep.example.com:3000`

   (With a wildcard domain set on the server, Coolify fills these in from `SERVICE_URL_API_3000` / `SERVICE_URL_WEB_3000`.)
4. **Deploy.** Coolify starts Postgres in its own container on a private network shared with the API and web. Postgres is not exposed to the internet. The API runs its migrations on boot.
5. Open **Environment Variables** to read the generated values:
   - `SERVICE_PASSWORD_64_APIKEY` is your API key.
   - `SERVICE_PASSWORD_WEBPASSWORD` is the dashboard password.
   - **Back up `SERVICE_PASSWORD_64_ENCRYPTION`.** If it's lost or changed, the stored secrets can't be decrypted.

Data lives in the `postgres-data` volume, so it survives redeploys. Turn on scheduled backups for it in Coolify.

## Local development

```bash
# API (needs a Postgres; see apps/api/.env.example)
cd apps/api && cp .env.example .env && npm install && npm run start:dev

# Web
cd apps/web && cp .env.example .env.local && npm install && npm run dev -- --port 3001

# Or the whole stack with Docker
cp .env.example .env && docker compose up --build
```

npm 10 has a resolver bug with this dependency tree. Use npm 11+ (bundled with Node 24), or run `npx npm@11 install`.
