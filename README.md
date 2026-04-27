# Kombo

Payload 3 site, scaffolded from the official `blank` template and configured for SQLite.

## Local development

```bash
cp .env.example .env        # then edit PAYLOAD_SECRET
npm install
npm run dev
```

Then open http://localhost:3000. The admin panel is at http://localhost:3000/admin — follow the on-screen flow to create the first admin user.

The SQLite database file (`payload.db`) is created next to the project root on first run and is gitignored.

## Scripts

- `npm run dev` — start Next.js + Payload in dev mode
- `npm run build` — production build
- `npm run start` — run the production build
- `npm run generate:types` — regenerate `src/payload-types.ts` from the config
- `npm run generate:importmap` — regenerate the admin import map
- `npm run lint` — run ESLint

## Layout

- `src/payload.config.ts` — Payload config (SQLite adapter, Lexical editor, Users + Media collections)
- `src/collections/` — collection definitions
- `src/app/(payload)/` — Payload admin route group
- `src/app/(frontend)/` — public site route group
