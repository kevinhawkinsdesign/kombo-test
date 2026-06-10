# Enginy (ex-Genesy AI) — competitor brief

Sources: help.enginy.ai (+ legacy mirror help.genesy.ai), docs.enginy.ai, enginy.ai, press. Compiled June 10, 2026; direct fetching blocked, assembled from search-indexed content. Confidence high on basics, medium on help-doc mechanics.

## 1. What is Enginy?

- AI-native all-in-one outbound platform ("AI SDR": data + outreach combined). **Founded 2023 in Barcelona as Genesy AI** (GENESY SALES SOLUTIONS, SL) by Kai Brandt (CEO, ex-BCG/Agicap) and Jaume P. (CTO, ex-Skyscanner/New Relic); rebranded to Enginy for "European ambition."
- **€5M seed (Jan 2025)** led by Samaipata, with KFund and Itnig.
- 2025 close: **~€3M ARR (3× YoY), 500+ clients, ~50 employees**, Barcelona + Madrid; markets ES/UK/IT/DE/FR/US. Clients: Factorial, Sequra, Honest Greens.
- **Pricing: sales-led only — no trial, no self-serve.** "Smart" plan floor ~€799/mo (Capterra); third-party estimates €1,500–3,000/mo for 5–10 SDR teams. Per-credit costs undisclosed.
- Reviews: G2 4.8 (~22), Capterra 4.9 (~17). Complaints: bugs, **HubSpot sync breakage/duplicates**, data errors, prompt-tuning difficulty, "too expensive, I feel like I cannot leave" lock-in.

## 2. Features & mechanics (Find → Enrich → Engage)

- **Find**: people/company search, social prospecting, intent signals; import from LinkedIn, Google Maps, CSV/Excel.
- **Enrich**: waterfall over **30+ sources / 20+ providers run cheapest→premium** per record until verified; verification built into the step. Claims ~5% more emails, 7% more phones, up to 45% fewer bounces vs single-provider.
- **ICP scoring (AI Playbook)**: "Fill with AI" auto-generates the ICP from website + LinkedIn; contacts scored High/Medium/Low/Disqualified with hover explanations; ICP Quick Filter.
- **Engage**: sequences mixing LinkedIn invites/messages + email; built-in warm-up & deliverability; smart inbox. **AI Sales Agent** continues conversations autonomously — objections, qualification via dialogue, reply drafting, intent prioritization, books meetings via the rep's calendar.
- **No voice/calling, no meeting/call intelligence, no Chrome extension** (LinkedIn import is native/list-based).

## 3. Onboarding (help docs)

"Start Here": Guide 1 — connect CRM (HubSpot, Salesforce, Pipedrive, Dynamics) + build a **blocklist** (customers/competitors/open pipeline excluded from lists and campaigns). Guide 2 — list building: import → ICP score → enrich → campaign or export. Guide 3 — campaign building. Weekly webinars. Collections: AI Configuration, Blocklist/Exclusions, Campaigns, Dashboard, Integrations, Credits/Usage & Billing, Settings.

## 4. Billing

"Credits · Usage & Billing" help section exists (~2 articles); specifics not public. Cost scales on enrichment credits, sends, lookups; all quotes custom.

## 5. Integrations & API

- CRMs: HubSpot, Salesforce, Pipedrive, Dynamics (bi-directional); Zoho export; OpenAI; Slack. No Zapier app found.
- **Public API (docs.enginy.ai) + MCP server at openapi.enginy.ai/mcp** — OAuth sign-in, scope checks, `mcp_whoami`; **MCP tools auto-generated from the OpenAPI spec** (every REST verb becomes a tool) for querying contacts, companies, campaigns, inbox threads. Ahead of the curve for a company this size.

## 6. Security/compliance

GDPR + Spanish LOPDGDD; **AWS EMEA hosting**; Google Workspace data not used to train general models. **No SOC 2 or ISO 27001 found anywhere** — the posture is residency + GDPR, not certifications.

## 7. Competitive overlap

- vs **Lusha**: both sell contact data, but Enginy has no proprietary DB — it's a waterfall broker bundled with outreach; no extension, no self-serve. Publishes "Lusha alternatives" SEO content.
- vs **Lemlist**: overlapping multichannel sequencing + warm-up + unified inbox; Enginy adds native data + autonomous replies; Lemlist self-serve and far cheaper.
- vs **Amplemarket**: closest analog (data + sequencing + AI copilot suite); Enginy is EU-centric, smaller, email+LinkedIn only, no dialer.
- vs **Clay**: both waterfall over many providers; Clay is a composable canvas, Enginy an opinionated end-to-end pipeline with execution built in.
- vs **a live-call-coaching copilot (KomboAI)**: minimal overlap — no in-call product at all; CRM writes are lead sync, not conversation capture. Complementary more than competitive pre-meeting.

## Strategic flags

1. MCP server auto-generated from OpenAPI — betting on agent-to-agent workflows early.
2. Aggressive competitor-branded-keyword SEO (Apollo/Clay/Lemlist/Lusha/Cognism/11x pricing & alternatives posts) — cheap-CAC EU playbook.
3. Sales-led, no-trial €799+ floor is an anomaly and a documented churn-resentment source — attack surface for self-serve rivals.
4. No proprietary data, no voice, no call intelligence — an orchestration layer whose defensibility is workflow + EU GTM.
5. Quality debt: repeated G2 bug/sync complaints suggest scaling strain after 3× growth.
