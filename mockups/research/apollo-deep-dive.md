# Apollo.io — deep research brief

Compiled June 10, 2026 from apollo.io, knowledge.apollo.io (indexed), docs.apollo.io, and third-party 2026 pricing/review analyses.

## 1. Pricing (2026)

| Tier | Annual (per user/mo) | Monthly | Key allowances / gates |
|---|---|---|---|
| Free | $0 | $0 | ~100 email credits/mo, 5 mobile + 10 export credits, 2 active sequences, 25-record export cap |
| Basic | ~$49 | ~$59 | ~1,000 credits/mo pool; basic filters, limited intent |
| Professional | ~$79 | ~$99 | Unlimited sequences + A/B, US auto dialer, call recording, dashboards |
| Organization | ~$119 (3-seat min) | ~$149 | International dialer, advanced API access, custom reports, admin/SSO |

- Credits **expire each cycle, no rollover** (explicit since late-2025 contract changes); overages ~$0.20/credit (250 min); **mobile credits ~8× email**; Advanced Dialer (power/parallel/international) is a paid add-on.
- **Late-2025 credit-model migration**: accounts moved off "legacy" terms; more actions (enrichment steps, exports, AI research) now burn credits; no plan has truly unlimited email credits (fair-use caps: 10K/mo free; paying = lesser of $paid/$0.025 or 1M/yr).
- **Export double-billing**: 1 export credit per contact *per destination* (CRM sync + CSV of the same contact = 2 credits). 10,000-record max single export (25 free).

## 2. Database & data

- Claims **275M+ contacts**; sourcing = **"Living Contributor Network"** of 2M+ users who link mailboxes/calendars and contribute extracted contact data back, plus crawling and licensed vendors. Revoking consent stops future collection but keeps already-collected data.
- Third-party tests: **~65% overall accuracy**; US 80–88%, non-US 60–73%; bounce rates on Apollo lists commonly **15–25%**. Applying the "Verified Email" filter collapses 275M to **~96M**.
- Weak spots: EMEA/APAC mobiles, SMB/niche industries, stale titles.

## 3. Product mechanics

- **Sequences**: auto/manual email, calls, tasks, LinkedIn tasks (via extension). Mailbox rotation assigns each contact to the mailbox with most remaining daily capacity, then locks it. Recommended start: **50 emails/day** (raise only at 5%+ reply). Deliverability Suite + "Inbox Ramp-Up" warm-up bundled.
- **Dialer**: click-to-call, local presence, international VoIP; recordings → AI transcripts/summaries; managers can join live. Power/parallel dialing = add-on.
- **Extension**: reveals on LinkedIn, Gmail sidebar, CRM overlay; batch-executes LinkedIn tasks. **LinkedIn formally lists Apollo's extension as prohibited scraping software** — users risk account restriction.
- **AI**: **AI Assistant** (Mar 2026) — natural-language agentic workflows (find → research → sequence → route); AI research agents, scoring, writing, post-call follow-ups; AI usage +500% YoY, 50K weekly AI users.
- **Intent**: Bombora, 14K+ topics (modeled topic-level, not first-party behavioral).
- **Enrichment**: CSV, API, Data Health Center (job-change/missing-email detection), **waterfall enrichment** across cascading third-party sources (a direct Clay response).
- **CRM sync**: true bi-directional HubSpot/Salesforce/Pipedrive, recurring pulls + near-real-time push; **mirrors CRM duplicates rather than resolving them** — dedupe before connecting.
- **API**: per-endpoint rate limits scale by plan but exact numbers unpublished (read response headers; usage endpoint needs a master key); People Search free, enrichment endpoints burn credits; advanced API = Organization+.

## 4. Reviews

- **G2 ~4.7/5, 9,000+ reviews**; Capterra ~4.5/5 (~381).
- Pros: all-in-one value, filters + extension, price vs ZoomInfo, CRM integrations.
- Cons: **data accuracy/bounces (#1)**, cluttered UI, weak lower-tier support, credit opacity and seat-cost creep.

## 5. Company

- Founded 2015 as ZenProspect (YC W16; Tim Zheng), rebranded 2018; SF HQ; ~1,600 employees.
- **$251M raised; $100M Series D (Aug 2023, Bain) at $1.6B.** ARR: $96M (2023) → $134M (2024) → $150M (May 2025) → ~$200M at Pocus deal.
- 2024–26: waterfall enrichment, Data Health Center, Deliverability Suite, Conversations (2025), **AI Assistant (Mar 2026)**, **acquired Pocus (Mar 19, 2026)**; enterprise accounts +400% YoY.

## 6. Security/compliance

SOC 2 Type II + ISO 27001 (A-LIGN), GDPR processor *and* controller, EU-US DPF; trust center via SafeBase. **US-hosted only — no EU residency.** Historical: 2018 breach (~125M records) still surfaces in security reviews.

## 7. Strategic flags

1. Consolidating into a **"GTM OS"** (AI Assistant + Pocus + enterprise push) — mirroring the Clari/Salesloft wave.
2. The data flywheel is the soft underbelly: cheap but accuracy-capped and a GDPR/procurement friction.
3. The late-2025 credit migration is a quiet price increase and a recurring resentment source.
4. **Whitespace vs Apollo**: real-time call coaching (theirs is post-call only) and LinkedIn-safe prospecting (their extension is banned).
