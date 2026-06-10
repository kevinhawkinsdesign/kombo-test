# Lusha help center — mechanical deep dive

Source: info.lusha.com. Compiled June 10, 2026 from indexed help-center content; direct fetching blocked (403). Cited article IDs are real help-center pages.

## 1. Credits & billing

- **Charged per data point, not per contact** — one reveal can deduct multiple credits (email and phone billed separately). Search/filter and company info are free. (637743)
- Asymmetric: email = 1 credit; phone historically 5, newer material shows **10 credits/phone** (full contact = 11). Four credit categories: contact data, workflow tools, signals, API. (341431)
- Each data point charged once; re-reveals free. **Bulk reveals charge for every selected contact including partial-data results; no refunds** — only "patterns" of bad data reviewed by support. (637743, 634202)
- **Rollover: monthly plans roll to 2× monthly allowance; annual plans get all credits upfront and unused ones expire** — an unusual inversion. Credits forfeit on non-renewal. (634202)
- Admin per-user/group bulk-credit caps (pooled for groups); 75%/100% warning dots. Mid-cycle top-ups billed immediately; subscriptions non-refundable by default.

## 2. Extension

- Works on LinkedIn profiles/search, Sales Navigator, company pages/websites, your CRM. Chrome + Edge only.
- Bulk from Sales Nav: bulk reveal, bulk save to lists, bulk push to CRM; bulk size plan-gated (Free 25, Pro 50, Premium 150, Scale up to 5,000–10,000).
- **"Lusha Everywhere"**: employee lists on any B2B website — requires all-sites browser permission (dedicated justification article, 163863).

## 3. Prospecting platform

- Filters: location, industry, title, seniority, department, size, technographics, specialties, funding, intent, job-change (changed title/company within 60/90 days, 9/12 months; match vs previous company/title).
- **Workspace**: AI table UI with AI-generated Signal Columns (news, funding, exec changes, hiring trends, competitor data, sentiment). **Playlists** = live lists, AI auto-adds lookalikes daily/weekly, all plans; pre-built playlist library. AI + intent-based recommendations.

## 4. Engage (sequencing)

- Email-centric; **sends through your own Gmail/Outlook only** — no Lusha sending infra, no warm-up, no rotation.
- Limits: system max 1,000/user/day and 60/hour; recommended 50/day (20–30 new domains); **10 active sequences/user**; 45K chars/email; reply polling ~10–15 min auto-stops. AI Email Assistant generates two sequence options; Auto Sequence auto-enrolls. Sequence activity syncs to Salesforce.

## 5. Conversations (ex-Novacy)

- Bot joins meetings from Google/Outlook calendars; transcripts, summaries, action items; talk-time ratios, engagement, deal visibility; Snippets Library. Pushes to Salesforce as Events. Custom bot name + notification message. **Included from the Free tier up** — a land-grab vs Gong pricing. Post-call recording, not live coaching.

## 6. Intent & signals

- Intent = **Bombora Company Surge**; Very Hot/Hot/Warm with week-over-week trend. **Topics changeable only once per month**; max topics plan-dependent. Free/self-serve see only 25 intent results; full + 10K exports Scale-only.
- **Signals API**: job moves, promotions, funding, hiring surges; 6-month lookback; also a Clay connector.

## 7. CRM, API, CSV

- Salesforce: push as Leads/Contacts/Accounts; field mapping with "Allow Override"; gotchas — Contact State populates US-only, use String not picklists for Lusha fields.
- HubSpot: admins can disable new-record creation; **HubSpot Identifier icon + "Exclude HubSpot objects" toggle skips already-owned contacts in bulk reveals so no credits burn** (mirrored for Bullhorn).
- Per-export caps: **150 to Salesforce, 100 to HubSpot, 25 others**.
- API: **Premium/Scale only**; 25 req/sec (legacy 300/min, 600/hr, 6,000/day); per-key monthly credit caps can 429 while the dashboard shows balance. Person API V2 matches by email/LinkedIn URL/name+company. MCP server, Clay/Workato/Zapier connectors.
- CSV enrichment: 20 MB / 10,000 rows; match waterfall LinkedIn URL > email > name+domain > name+company; 1 credit per matched contact, **unmatched rows free**.

## 8. Admin & compliance

- Roles User/Manager/Admin; credit-usage analytics + scheduled emailed reports; SSO (Scale). DNC list toggle hides phones on selected countries' registries.
- GDPR/DSAR: self-serve removal form; access requests free. Key admission: **no opt-in consent collected from individuals — customers must ensure their own outreach is lawful** (633727).

## 9. Gotchas

- Bulk reveals burn credits on partials, no refunds; phone:email credit asymmetry up to 10:1.
- Annual = no rollover; monthly = 2×.
- Engage rides customer mailboxes; Lusha takes no deliverability liability.
- Intent is an enterprise upsell with a 25-result teaser; topics locked monthly.
- API per-key caps are a documented support trap. US-bias hints (e.g., Contact State US-only).
