# @authkeep/api

NestJS API for Authkeep. Stores authenticator (TOTP) secrets in PostgreSQL, encrypted with AES-256-GCM, and serves live codes.

```bash
cp .env.example .env    # then fill it in
npm install
npm run start:dev       # http://localhost:3000, Swagger UI at /docs
npm test                # unit tests (RFC 6238 vectors)
npm run test:e2e        # needs DATABASE_URL, API_KEYS, ENCRYPTION_KEY
```

Every route except `GET /health` needs an API key in the `x-api-key` header (or `Authorization: Bearer <key>`). Migrations run automatically on boot.
