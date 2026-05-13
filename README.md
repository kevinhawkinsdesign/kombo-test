# Kombo

Three things in one repo:

- **[`mockups/`](./mockups/)** — the active design workspace. `v9_glass_cathedral.html` is the chosen direction and is now a full multi-page website. All other pages (team, about, podcast, features, pricing, etc.) are built on the same design system.
- **Repo root** — the original static KomboAI marketing site (`index.html`, `about.html`, …). Kept as reference; `mockups/` is the living version.
- **[`cms/`](./cms/)** — a Payload 3 + Next.js app, fully isolated. Admin panel, MCP wiring, SQLite database.

## Mockups — v9 Glass Cathedral

`v9_glass_cathedral.html` is the homepage. The full site lives in `mockups/`:

| Page | File |
|---|---|
| Homepage | `v9_glass_cathedral.html` |
| About | `about.html` |
| Team | `team.html` |
| Podcast | `podcast.html` |
| Features | `features.html` |
| Pricing | `pricing.html` |
| Integrations | `integrations.html` |
| Customers | `customers.html` |
| Blog | `blog.html` |
| Blog post | `blog-post.html` |
| How it works | `how-it-works.html` |
| Contact | `contact.html` |
| Changelog | `changelog.html` |
| Brand guidelines | `brand-guidelines.html` |
| Feature: CRM Intelligence | `feature-crm-intelligence.html` |
| Feature: Email Personalization | `feature-email-personalization.html` |
| Feature: Forecasting | `feature-forecasting.html` |
| Feature: Lead Ranking | `feature-lead-ranking.html` |
| Feature: Revenue Insights | `feature-revenue-insights.html` |

All pages share the v9 design system: dark background (`#080808`), neon green (`#00ff88`) accents, JetBrains Mono, glass/blur card surfaces, and a consistent nav/footer.

**Team page** includes real headshots for the core team (Ignacio, Ale, Michel, David) and advisors/investors (Ernest, Roger, Charles, Alvaro, Tom, Merce, Stephane). Photos live in `mockups/images/team/`.

**Homepage variants** v1–v12 are preserved in `mockups/` for reference. v9 is the active one.

```bash
# Serve mockups locally
python3 -m http.server 8080 --directory mockups
# then open http://localhost:8080/v9_glass_cathedral.html
```

## Original static site (root)

```bash
python3 -m http.server 8080
# then open http://localhost:8080
```

## Payload CMS

```bash
cd cms
cp .env.example .env       # set PAYLOAD_SECRET
npm install
npm run dev
```

Admin panel: <http://localhost:3000/admin>. See [`cms/README.md`](./cms/README.md) for full setup.
