# Extension 1.7.33 → webapp parity plan

Triage of the Chrome extension's 1.7.33 release against the `webapp/`
prototype. Each item is tagged **Mirror** (build it), **Adapt** (the concept
lands differently in a web app), or **Skip** (extension-only).

Findings below were verified against current source on 2026-07-27 — several
features the release notes imply are new already exist here in some form, so
the real build surface is smaller than the notes suggest.

---

## Build order (recommended)

Cheapest-first, and front-loading the two that extend work already shipped.

| # | Item | Tag | Est. | Notes |
|---|------|-----|------|-------|
| 1 | Outcome column in list tables | Mirror | S | Already scoped, see below |
| 2 | Auto-enrich AI columns on list add | Mirror | S | Extends the dynamic-lists work just shipped |
| 3 | Simplified names | Adapt | S | Self-contained helper + preview wiring |
| 4 | Template organisation polish | Adapt | S–M | Most of it already exists |
| 5 | Reverse email lookup | Adapt | M | New import path |
| 6 | Auto-reply agent config | Mirror | **L** | Biggest gap; needs a data model |
| 7 | MCP prospect/company search | Skip | — | |
| 8 | Version-update banner | Skip | — | |

---

## 1. Outcome column in list tables — **Mirror** (S)

*Extension:* Outcome column (Interested, Not Interested, Won, Lost,
Qualified…) directly in the list, filterable, so you can build a campaign
from a subset.

*Here:* Not present. List tables have a **Status** column
(`table-columns.tsx:678`) showing `ProspectStatus`
(`new/contacted/replied/meeting/customer/not_interested`) — pipeline state,
a different concept. Kevin's call: **replace Status with Outcome.**

Outcome maps to `ConvStatus` (`types.ts:193`), whose labels/badges/ordering
already live in `lib/conv-status.ts` with all 7 locales — so no new copy is
needed.

**Wrinkle:** outcome isn't stored on `Prospect`; it lives on
`Conversation.status`, joined via `Conversation.prospectId`. In the mock data
**all 12 prospects with conversations have 2–3 each**, so the multi-conversation
tie-break affects every row, not an edge case.

Proposed rule — a decision on any thread beats an in-progress signal; among
decisions the strongest wins; among in-progress, furthest along wins:

```
won > lost > disqualified > not_interested
    > meeting_booked > qualified > interested > need_review
```

Plan:
- `lib/conv-status.ts` — add `OUTCOME_PRIORITY` + `pickOutcome(statuses)`
- `lib/store.ts` — add sync `getProspectOutcome(prospectId)` (`state` is
  module-level at :230, so no hook needed inside a column def)
- `lib/table-columns.tsx` — swap the `status` column for `outcome`, reusing
  `STATUS_META` badge styling, `filterType: "enum"`

Blast radius: `PEOPLE_COLUMNS` feeds **People.tsx, ListDetail.tsx,
CampaignDetail.tsx** — all three get the new column. `ProspectStatus` and
`StatusBadge` stay in use on the *detail* views (ProspectProfile,
ProspectSummaryPanel); only the table column changes.

## 2. Auto-enrich AI columns on list add — **Mirror** (S)

*Extension:* new prospect/company added to a list → scoring + AI columns
enrich automatically.

*Here:* Direct extension of the dynamic-lists work shipped in #495.
`aiColumnStore` / `useAiColumns` exist (`lib/ai-columns.ts:60,88`), and lists
now carry `enrichment: "once" | "continuous"`. Wire AI-column computation into
the same path, so "continuous" covers AI columns too rather than contact data
only. Mostly a matter of deciding whether AI columns follow the existing
enrichment toggle or get their own.

## 3. Simplified names — **Adapt** (S)

*Extension:* `J. Carlos → Carlos`, `Fiat S.p.a → Fiat`,
`Head of Marketing & Brand Awareness → Head of Marketing`. Automatic, no user
action.

*Here:* No shared helper — only ad-hoc splitting in `WarmIntros.tsx` /
`Inbox.tsx`. Add `lib/humanize-name.ts` with `firstName()`, `companyName()`,
`jobTitle()` and use it wherever merge vars resolve (`SAMPLE_DATA`,
`mergeVarsHighlighted`, sequence previews). Good demo value — visible in every
message preview.

## 4. Template organisation polish — **Adapt** (S–M)

*Extension:* folders, message-vs-prompt split, ordering, a designated main
template.

*Here:* **Most of this already exists** — `lib/template-folders.ts`,
`useTemplateFolders`, and a `sectionPrompts` section in `Templates.tsx`.
Remaining gap is presentational: the Messages/Prompts segmented toggle,
explicit ordering (01, 02…), and a "Main Template" designation.
Scope carefully — this is polish on a working page, not a rebuild.

## 5. Reverse email lookup — **Adapt** (M)

*Extension:* upload a file with professional emails but no LinkedIn URLs,
resolve profiles from the email. Lower hit rate than LinkedIn→email; rejects
generic addresses (`info@`).

*Here:* Fits the existing CSV import path (`ImportCsvDialog`,
`AddRecordsDialog` import mode). Add an email-only column mapping, mock a
realistic partial match rate, and surface the generic-address rejection —
that caveat is the interesting part of the UX.

## 6. Auto-reply agent config from campaign edit — **Mirror** (L)

*Extension:* configure the auto-reply agent from campaign edit — edit its
prompt, add/remove agents, per-channel settings (max replies, follow-up
on/off), pause all; agent handles OOO itself.

*Here:* **The biggest genuine gap.** Today auto-reply is a single
`autoReply?: boolean` on `Conversation` (`types.ts:266`), toggled per-thread
in the Inbox. There is no campaign-level agent, no prompt, no per-channel
config. Needs a real data model (agent entity, per-channel settings,
campaign association) plus a config dialog off CampaignDetail.

**Recommend scoping this one separately** once 1–5 are in — it's the only
item that isn't a small extension of something existing, and the screenshots
suggest a fair amount of surface.

## 7. MCP prospect/company search — **Skip**

Searching Kombo's database from inside Claude. An integration surface, not a
web-app screen; the webapp already has its own AI search (`Search.tsx`,
`QuickSearch.tsx`, `AddRecordsDialog`). Nothing meaningful to mirror.

## 8. Version-update banner — **Skip**

Chrome-extension versioning concern. A continuously-deployed web app has no
equivalent.

---

## Open question for Kevin

Item 6 (auto-reply agent) is roughly as large as items 1–5 combined. Worth
confirming whether it's in scope for this pass or a follow-up.
