# Kombo

Two independent projects in one repo:

- **Repo root** — the static KomboAI marketing site (`index.html`, `about.html`, …, `styles.css`, `script.js`). No build step; open `index.html` in a browser or serve the directory with anything that serves static files.
- **[`cms/`](./cms/)** — a Payload 3 + Next.js app, fully isolated. Has its own `package.json`, dependencies, dev server, admin panel, MCP wiring, and SQLite database.

## Static site

```bash
# any static server works; here's a one-liner with Python
python3 -m http.server 8080
```

Then open <http://localhost:8080>.

## Payload CMS

```bash
cd cms
cp .env.example .env       # set PAYLOAD_SECRET
npm install
npm run dev
```

Admin panel: <http://localhost:3000/admin>. See [`cms/README.md`](./cms/README.md) for the full setup, including the MCP plugin and the `bootstrap-mcp.sh` helper for wiring Claude Code.

## Why both?

The static site is the public marketing surface — fast, hostable anywhere, no runtime. The CMS is a separate workspace where content can be modeled, edited in an admin UI, and exposed over MCP. They don't share code; if/when the static site is replaced by the Payload-rendered frontend, this README will move.
