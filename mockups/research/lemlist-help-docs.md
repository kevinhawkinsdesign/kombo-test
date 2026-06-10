# Lemlist help center — mechanical deep dive

Source: help.lemlist.com. Compiled June 10, 2026 from indexed help-center content; direct fetching blocked (403). Cited article IDs are real help-center pages.

## 1. Campaigns / sequences

- Steps: email, LinkedIn (visit, invite, chat, **voice message**, video), call (manual task), WhatsApp, generic tasks. Any email/LinkedIn step can be **marked manual** → generates a task, timing preserved. (10301600)
- **Advanced Conditions**: Yes/No branches with time windows. Condition types: opened email, clicked link, unsubscribed, booked meeting, accepted invite, opened LinkedIn message, has score, has phone, call status, has WhatsApp. "Wait until" semantics. (8290177)
- Delays count **sending days, not calendar days**. Bounced leads excluded from later email steps. (12875247)
- **A/B**: sequence-level and step-level; must be created **before launch** (existing leads stay in A); manual winner selection only. 50–100 leads/variation guidance.
- Scheduling: timezone + days + window + "new lead every X min" (15–20 rec., step 1 only); multiple windows; **lead-local-timezone sending** option.
- **Inbox rotation**: rotates senders per new lead, sticky thereafter; "force a sender" per step. (8263428)
- Review queue: leads land in "To review" before launch; auto-launch optional.

## 2. Personalization

- Full **Liquid syntax** (`{% if %}`) on lead attributes; case-sensitive variables. Dynamic images (text-on-image, auto website screenshots), **dynamic landing pages** (per-lead, with video, CTA, live chat).
- AI: sequence generator (campaign + list + multichannel sequence); **AI variables/columns** — reusable per-lead generation, auto-run on new leads, chainable, shareable workflow templates; **signal-triggered icebreakers** (signal → campaign push with signal variables → AI column writes opener). Same credit pool.

## 3. Deliverability

- **lemwarm**: peer network of 10,000+ real users (not bot inboxes); Smart Clusters match warm-up content by industry. Ramp: rec. 30/day (<6 mo mailbox) or 40, increment 1–2/day; **3–5 weeks to full warm-up**. Score = 70% fixed factors (domain age, SPF/DKIM/MX) + 30% inbox rate. Auto-pauses on bounces/blacklists/DNS errors/relays.
- Caps: ≤40/day on <1 yr mailboxes; steady state **60–70/day/mailbox total**; hard ceiling guidance 100/day. **Bounce auto-pause only at >50% bounce after ≥100 contacted** (alert at 10%). Bouncer verification built in.
- DNS: **SPF must exclude lemlist — sends go through your own provider** (key architecture fact); DMARC ≥ p=quarantine; custom tracking domain isolates click links.
- **Matching ESP**: with ≥1 Google + ≥1 Microsoft mailbox, routes each send from the mailbox matching the recipient's ESP (Gmail→Gmail) — genuinely differentiated. (12750538)
- Lemlist **sells domains + pre-configured mailboxes in-app** at the moment of need.

## 4. Database & enrichment

- People database claimed 450M+ (product pages now 600M+), sourced from public LinkedIn profiles; waterfall across "up to 10 providers"; some teams plug own Lusha/Apollo accounts.
- **Credits charged only on success** ("deliverable or risky" email, or phone found); failed lookups free. One shared team pool, no per-user quotas; only Admins buy; top-ups $0.01/credit and purchased credits roll over. Included: 1,000/user/mo (Email Pro), 1,500 (Multichannel Expert). (8944295)
- Extension: LinkedIn search/profiles up to 999 leads, Sales Nav up to 2,500; no Recruiter/event pages.

## 5. Multichannel

- **LinkedIn caps: 20 invites/day, 30 messages/day, 30 visits/day, ~100 actions/day**; new accounts ramp from ~50; auto-withdraw stale invites; 200-char invite notes; runs on **your LinkedIn session** (disconnections are a documented support theme).
- LinkedIn voice ≤1 min/20 MB + **AI-generated voice messages**. Calling: Aircall (needs ≥3 seats) or native in-app calling (Multichannel Expert; minute-metered, "call from my phone" = 2× credits/min; Ringover supported). WhatsApp: paid add-on, **personal accounts only via QR** (Business unsupported). Unified inbox across all channels.

## 6. Integrations

- HubSpot: per-field direction (1-way either way or 2-way), activity→timeline mapping, **2–10 min latency, mappings not retroactive**. Salesforce: per-field bi-directional, create-missing-records with Lead-vs-Contact choice. **Import caps: Salesforce 2,000/campaign vs HubSpot/Pipedrive 10,000, CSV/API 40,000.**
- Full REST API (developer.lemlist.com; key shown once) + webhooks; Clay/Zapier/Make/n8n. lemcal: booking link in signatures; "booked a meeting" works as stop condition and branch condition.

## 7. Teams / plans

- Email Pro $79/user/mo, Multichannel Expert $109, Enterprise (annual, min 5 seats). Mailbox slots: 3 / 5 included; **extras $9/mo**. lemwarm Essential bundled free. Roles Admin/Member (+ Extern/custom on Enterprise); guest seats 5 (unlimited Enterprise). **Agency Cockpit**: isolated client workspaces.

## 8. Claap & signals ("smartbound")

- **Claap x Lemlist documented**: recorded dialer calls auto-import to Claap minutes after call end; transcription, notes, CRM sync — currently one-way lemlist→Claap, not fused. (13726423)
- **Signal Agents**: website visitor identification (JS snippet, company-level, **20 credits per company identified**, custom high-intent URLs) and LinkedIn company-page engagement; signals auto-push leads into campaigns with variables feeding AI icebreakers.

## 9. Gotchas

Trial: 14 days, 50 emails/day, 200 credits, no lemwarm/Aircall. A/B not retroactive. Shared credit pool drainable by one user. WhatsApp personal-only. Session-based LinkedIn fragility. Bounce auto-stop threshold high (50%). Mappings not retroactive. API key shown once.

**Strategic flags**: Matching ESP; sends through customer's provider then monetizes the deliverability burden (lemwarm, domain resale, $9 mailboxes); success-only credits as a sales weapon; signal→AI-variable→auto-campaign loop is the live "smartbound" motion.
