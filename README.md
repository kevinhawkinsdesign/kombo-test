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

- `src/payload.config.ts` — Payload config (SQLite adapter, Lexical editor, Users + Media + Pages, MCP plugin, seed-on-init)
- `src/collections/` — collection definitions (`Users`, `Media`, `Pages`)
- `src/seed/` — seed data + bootstrap that populates Pages on first run if none exist
- `src/components/` — shared `Header` / `Footer` used by the public layout
- `src/app/(payload)/` — Payload admin route group
- `src/app/(frontend)/` — public site (`/` is the home page; `/[slug]` renders any other Page from Payload)
- `public/site.js` — small client script for the nav dropdowns / mobile menu

## Pages

The original static HTML pages (home, about, blog, contact, customers, features, integrations, newsletter, podcast, team) were migrated into the `pages` collection. Each doc has `slug`, `title`, `metaDescription`, and a `bodyHtml` code field. The shared header and footer live in React components and are not part of `bodyHtml`.

On first run, `seedIfEmpty` (`src/seed/index.ts`) creates the 10 docs from `src/seed/pages-data.ts`. To re-seed, delete `payload.db` and restart the dev server. To edit content, log into `/admin` and edit the doc; the change is live on the next request.

## MCP

`@payloadcms/plugin-mcp` exposes Payload as an MCP server at `POST /api/mcp`. The repo ships a project-scoped `.mcp.json` so Claude Code (and any other MCP client that reads `.mcp.json`) auto-registers a `payload` server when run from this directory.

### One-time setup

The fast path — with the dev server running (`npm run dev`):

```bash
bash scripts/bootstrap-mcp.sh
set -a; source .env.mcp.local; set +a
claude   # launched from the repo root so .mcp.json is picked up
```

`scripts/bootstrap-mcp.sh` registers an admin user, creates a `payload-mcp-api-keys` doc with full media + pages permissions, generates a UUID for the key, and writes it to `.env.mcp.local` (gitignored, mode 600). Override `ADMIN_EMAIL` / `ADMIN_PASSWORD` / `KEY_LABEL` / `BASE_URL` via env vars if the defaults don't fit.

The manual path:

1. `npm run dev` and create the first admin at http://localhost:3000/admin.
2. In the admin, go to **MCP → API Keys**, click **Create New**, toggle capabilities per collection, click the **Generate New API Key** control, and copy the key.
3. Export it in whatever shell launches Claude Code (`export PAYLOAD_MCP_API_KEY=...`). Claude Code reads `${VAR}` placeholders in `.mcp.json` from the shell environment — it does **not** auto-load this project's `.env`.
4. Start Claude Code from the repo root: it'll pick up `.mcp.json` and attach the `payload` MCP server. The dev server must be running for tool calls to succeed.

### Override the URL

`.mcp.json` falls back to `http://127.0.0.1:3000/api/mcp`. Point it elsewhere (e.g. a deployed instance) by exporting `PAYLOAD_MCP_URL`.

### Alternative: user-scoped install

If you'd rather register the server globally instead of per-project:

```bash
claude mcp add --transport http Payload http://127.0.0.1:3000/api/mcp \
  --header "Authorization: Bearer $PAYLOAD_MCP_API_KEY"
```

### Exposing more collections

The `media` collection is enabled in `payload.config.ts`. Add more collections (or `globals`) to the `mcpPlugin({...})` call as needed — see the [Payload MCP docs](https://payloadcms.com/docs/plugins/mcp).
