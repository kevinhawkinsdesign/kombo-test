# Clay docs (university.clay.com) — mechanical deep dive

Compiled June 10, 2026 from indexed docs content; direct fetching blocked (403). Cited slugs are real docs pages (university.clay.com/docs/<slug>).

## 1. Tables & workflow model

- Every table starts with a **source** (Find People/Companies/Jobs, CSV, CRM, webhooks, signals); columns are enrichments, AI/Claygent, formulas, exports running per-row.
- **Hard cap: 50,000 rows per table on ALL plans**; Clay imports to the limit and silently stops. **Webhook sources burn their 50K quota permanently even after row deletion** — create a new webhook when exhausted (Enterprise gets passthrough tables). Bulk-enrichment flow is the no-row-limit escape hatch.
- **"Only run if"** conditional runs (natural-language via "Use AI") are the main credit-conservation lever. Formulas = free JS generated from natural language. Auto-dedupe watches a column, keeps oldest row. Write-to-table + Lookup Rows enable multi-table architectures.

## 2. Credits post-March-2026 (actions-data-credits, plans-and-billing, legacy-plans)

- **Actions** = orchestration: 1 per record enriched/exported regardless of provider (~tenths of a cent). Sequencer = 1 Action per lead added (not per email). HTTP API = 1 Action/record. **Actions never roll over.**
- **Data Credits** = marketplace data/AI (~pennies). Monthly Launch/Growth roll over to **2× monthly allotment**; annual/Enterprise 15% rollover only on equal-or-higher renewal.
- March 11, 2026: Launch $185/mo (2,500 DC / 15,000 Actions), Growth $495/mo (adds CRM sync, HTTP API, Web Intent). Data costs cut 50–90%. **Legacy plans frozen — old pricing kept but no new features.** Trial: 14 days, 1,000 credits, Pro-level unlocks.
- Failed lookups: provider-specific (e.g. Sumble refunds on no-find); **no blanket no-charge-on-miss guarantee**. Per-workbook/workspace spend limits + cost estimates + usage dashboard.

## 3. Waterfall enrichment

- Providers run in configurable sequence, stop at first hit; reorder/add/delete. Email waterfalls end with validation (**ZeroBounce default**, swappable). **Catch-all emails treated as VALID by default** (toggle exists) — inflates found-email rates.
- **BYOK: own provider/AI key = zero Data Credits but still 1 Action/row**; provider bills directly. ClearoutPhone validates line type; BetterContact available. Clay publishes head-to-head provider data tests.

## 4. Claygent & AI

- Claygent browses live pages, extracts unstructured public data. Clay model tiers: Helium (1 credit), Argon (3), Neon (flagship). Third-party GPT/Claude/Gemini selectable.
- **Two AI pricing regimes**: Fixed (flat credits, ~80% of models) vs **Variable — actual compute passed through at 0% markup** (~20%, advanced reasoning models).
- **Sculptor**: conversational agent-builder — prompt, variables, output schema, test cases; test on production data; deploy one agent across tables with propagating edits. AI formulas free; "Use AI" columns billed.

## 5. Signals & intent

- **Job changes: 1 Action + 0.2 Data Credits per contact per check** — daily checks on 10K contacts = 2K credits + 10K Actions/day. New hires (last 3 months at targets), promotions, layoffs, funding, M&A, launches; custom signals.
- **Web Intent** (Growth+): first-party JS, identifies **accounts not people**; person-level requires chained enrichment spend. Signals act as table sources → auto-run enrich/export pipelines.

## 6. Sequencer & outbound

- Native Sequencer throttled ~20 min between sends ≈ **24 emails/day/mailbox**; always-on campaigns; auto-stop on reply with OOO detection; Campaign Events table + analytics. 1 Action per lead added.
- External (Smartlead/Instantly/lemlist/Outreach/SalesLoft): push/update/remove leads — **campaigns must already exist; Clay can't create them**.

## 7. CRM sync

- CRM source syncs **every 24h by default**; mapped fields drive filters and writes. Salesforce: Lookup (free, SOQL), Find, Create, Update, Upsert (needs external ID). Recommended dedupe: free Lookup first, then conditional Create/Update; start with auto-update disabled. Gated to Growth ($495)+. HubSpot mirrors; docs warn no merge engine — dedupe is your job.

## 8. Automation & MCP

- Scheduled sources (plan-capped count). Webhooks in/out; **HTTP API column: no pagination (first page only), needs ≥~5 req/s rate limits**, Growth-gated. Zapier/Make via webhooks.
- **MCP server**: run lookups/research from ChatGPT/Claude/xAI; per-member MCP credit limits; dedicated **"Sales rep" role** for MCP-only users + a "Clay MCP for Reps" course — a seat-expansion motion beyond ops.
- Infinite-loop warnings have a dedicated doc (webhook→table→webhook cycles).

## 9. Admin

- Roles: Admin, Editor, Viewer (Enterprise-only), Sales rep (MCP). Connection-level access control. Template marketplace + "Share as Template" links + column-group templates.

## 10. Gotchas (consolidated)

50K rows/table everywhere; webhook quota permanent; Actions never roll over; catch-all = valid default; HTTP API unpaginated; sequencer 24/day; job-change monitoring compounds; legacy plans feature-frozen; web intent is account-level; CRM cadence 24h.

**Strategic flags**: Actions monetize orchestration itself (no free ride with BYOK); 0%-markup variable AI = AI as loss-leader vs data margin; MCP + Sales-rep role = land-and-expand into every rep's assistant.
