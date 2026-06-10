# Amplemarket help center — mechanical deep dive

Source: knowledge.amplemarket.com (+ docs.amplemarket.com). Compiled June 10, 2026 from indexed help-center content; direct fetching blocked (403). Cited URLs are real help-center pages.

## 1. Searcher / lead database

- "40+ traditional filters": title, seniority, location, industry, size/headcount, technologies, hiring/job openings, funding rounds in timeframe, growth-rate filters (e.g. ≥100% ad-count growth). Multiple combined conditions supported. Natural-language **AI Search** with ICP-tailored recommended searches. Exclusion criteria are first-class filters.
- **HubSpot Lists usable directly as Searcher filters** — suppress/target on live CRM membership without exports (article 28286714487181).
- **Personas** = saved ICP filter bundles reused by Searcher and Duo. **Saved Searches** are dynamic, shareable org-wide, with alerts and auto-push of new matches to Salesforce. Lookalike builder from seed person/company/list/website.
- **Exclusion lists**: CSV of emails/domains, additive-only (no bulk replace); ML auto-adds opt-outs; Workflows can auto-exclude "unsubscribe" replies; manageable via API.
- Data: proprietary managed waterfall across curated providers, verified in sequence, provider mix reviewed monthly; ~70M+ updates/week claimed (article 4409216247949).
- **Credits** (article 4406525110029): separate email and phone pools; reveal = 1 credit each. **CSV enrichment double-dips: 0.5 credit/lead to enrich + 0.5 to validate.** No re-charge once revealed anywhere. Credits renew annually on contract date; no published bad-data refund policy.

## 2. Sequences

- Step types: email (auto/manual), LinkedIn (connect, message, follow, profile visit, post like, **voice message**), call tasks (Dialer required), generic tasks. Failed automatic LinkedIn actions silently degrade to manual tasks.
- **Branching ("sequence blocks")**: Yes/No on conditions — LinkedIn-connection-accepted first, plus email/phone/LinkedIn-URL availability and email opens; configurable monitoring period. Placeholder-email stages for leads lacking emails. Native A/B testing.
- Sending: windows apply to email stages only. **Default daily limit cut 350 → 150 emails/mailbox/day**; cold guidance ≤50. Gmail caps 500/2,000 (Workspace).
- **Mailbox rotation**: 4–8 mailboxes/user; AI picks sender per recipient (engagement history, reputation, recipient domain, recent volume) — not round-robin. Send on behalf of other users; recurring sequences; reply sequences.
- Deliverability bundled on every plan: warm-up network (threads to 8 replies, 1–576 emails/day), **Domain Health Center** (SPF/DKIM/DMARC, blacklist monitoring, keep outbox:inbox below 4:1), **weekly seed-panel Email Placement Tests** per mailbox (Gmail/Outlook/Yahoo; Healthy/Unhealthy classification with rest-boost-retest flow). New domains: warm ≥4 weeks.
- **Safety Settings** (org-wide): recently-contacted suppression (default 3 months), holiday auto-rescheduling, forced unsubscribe footer, daily caps. OOO Smart Actions auto-pause until lead returns.

## 3. Duo AI agents

- Signal → Research → Sequence chain. Signals catalogue: job changes, competitor-LinkedIn engagement, company-page followers, profile visits, job openings, competitor G2 reviews, topic post engagement, Slack community signals, conference signals; custom API signals (Feb 2026).
- Daily feed of signal + bespoke sequence; approve/edit/regenerate/dismiss trains the model. **Autopilot**: SLA backstop (auto-sequence signals ignored N days) or full automation; instant autopilot since Dec 2025. Territory routing distributes signals without duplication.
- **Duo Copywriter**: tone/length controls, regenerate with different hooks. **Duo Inbox**: drafts replies for every response (email + social), rep reviews. **Duo Voice**: clone from short sample; sends personalized LinkedIn voice notes (≤60s, 1st-degree) as automated steps.

## 4. Integrations

- **Salesforce**: 2-way; field mapping per Lead/Contact/Account with optional fields; push on sequence enrollment; **dedupe by email only** — docs tell you to rewrite SF Duplicate Rules to key on email; alert-mode rules halt lead creation.
- **HubSpot**: bi-directional, **push sync every 3 hours** (real-time phone-number sync added Dec 2025); CRM custom fields become Dynamic Fields for templating.
- **Dialer**: native Twilio-backed; international outbound blocked until per-country docs verified; external dialers (Orum, Nooks) need 1:1 mapping to **6 non-editable dispositions**.
- **API** (docs.amplemarket.com): search, single/bulk enrichment (companies up to 10,000), validation, lead lists, sequences, exclusion lists, call logging. **500 req/min** default; call recordings 50 req/hr. Webhooks + "Send JSON" workflow actions. Clay can push in.

## 5. Workflow / UX

- Tasks list across channels; **Unibox/Master Inbox** with **Automatic Reply Labels** (AI classifies every reply) driving **Workflows** (triggers → actions: wait-for-return, email alternative POC, Slack alerts, JSON webhooks — no Zapier needed).
- **Outbox**: every scheduled action with status; pause/reprioritize/reschedule pre-send.
- Extension: import from LinkedIn/Sales Nav, reveal, push to sequences, voice messages, Gmail sidebar. Analytics: per-channel unique-lead open/reply (benchmark reply 2–5%), Duo-specific rates, CSV export.

## 6. Admin

- Roles: Admin vs Sales Rep; **Custom Roles** (Dec 2025); sequence-level permissions. Org-wide safety settings, LinkedIn action limits, Duo signal config, territories. Okta SSO.

## 7. Gotchas

- LinkedIn hard caps: **50 connection requests/day, 250 other actions/day** — subtract manual activity from these budgets.
- Email default 150/mailbox/day (was 350); HubSpot push 3-hourly; SF dedupe email-only.
- CSV enrichment double-charges; annual-only credits/contracts; no published overage rates.
- Dialer dispositions fixed at 6; exclusion uploads additive-only; failed LinkedIn autos become hidden manual workload.

**Strategic flags**: deliverability suite free on all plans; Duo's SLA autopilot + learning loop; automated voice-note cloning; label→workflow→webhook automation; branched sequences newer/narrower (2025, LinkedIn-accept first) than marketing implies.
