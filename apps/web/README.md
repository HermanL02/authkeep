# @authkeep/web

Next.js dashboard for Authkeep. It shows live codes with a countdown and lets you add or remove accounts.

The browser never sees the API key: route handlers under `src/app/api` call the Nest API server-side. The dashboard is behind a single password (`WEB_PASSWORD`) with a signed, httpOnly session cookie.

```bash
cp .env.example .env.local   # then fill it in
npm install
npm run dev -- --port 3001
```
