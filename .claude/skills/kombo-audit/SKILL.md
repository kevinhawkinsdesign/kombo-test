---
name: kombo-audit
description: Run a systematic UI/copy/pattern consistency sweep across kombo-test/webapp's V1-scoped pages, tag findings as Bug vs Decision/Gap, and turn Decisions into a batched AskUserQuestion round. Use when the user asks for a "consistency audit," "consistency sweep," "what's inconsistent," or wants a fresh pass after a batch of feature work has landed.
---

# kombo-audit

The codebase drifts in specific, recurring ways as pages get built
independently. This skill runs the same sweep every time instead of
reinventing the checklist, so findings are comparable across audits and
nothing falls through because it wasn't top of mind that day.

## Step 1 — Define scope

Default scope is every page in `webapp/src/pages/` **except** the ones
listed in `lib/release-mode.ts`'s `V2_ONLY_PATHS` (those are v2-only
surfaces with no shipping-extension equivalent yet — still worth a note if
something's badly broken, but not the primary sweep target). State the
scope explicitly before starting so the user can redirect if they meant
something narrower (one flow) or broader (include v2-only pages).

## Step 2 — Sweep each dimension

For each dimension below, grep across the scoped files and read enough
surrounding context to judge, not just pattern-match the string. This list
is a starting point — add a dimension if you notice a new *recurring*
pattern of drift; don't add one-off observations that only occur once.

1. **Dialog reset pattern** — does every dialog use the `wasOpen`
   render-time reset (see `kombo-test/CLAUDE.md`), or does any reset on
   close / use an effect?
2. **Button variants** — is the primary CTA `volt` and Cancel/Back `ghost`
   everywhere, or is some dialog still on `default`/`outline`?
3. **Wizard progress indicators** — numbered-circle + checkmark stepper
   everywhere there's a multi-step flow, or is some dialog still showing
   "Step X of Y" text, or no indicator at all despite being a real wizard?
4. **Toast copy** — "X created" for creation, "X updated" for edits,
   consistently? Any stray "X added"?
5. **Credit-cost copy** — bare "N credits," no verb, everywhere a cost is
   shown?
6. **Empty-state copy** — does every empty/no-results message follow "No
   {things} match your {filters/search}." (filtered) or "No {things}
   yet — {action}." (genuinely empty)? Note: don't flag markup
   differences (some pages use the shared `EmptyState` component, some
   hand-roll) as a Bug — that's a separate, larger Decision if it comes up.
7. **Icon meaning collisions** — anywhere `Sparkles` is used for something
   that isn't AI-powered, or `Database`/`Layers`/`Zap` are used
   inconsistently with their fixed app-wide meanings (see CLAUDE.md).
8. **Color-token consistency** — does the same semantic state (e.g.
   "active," "disqualified," a health/score tier) render in the same
   badge variant/color everywhere it appears, including across sibling
   status enums on the same page?
9. **Shared-component reinvention** — does any page hand-roll its own
   version of `DataTable`+`ColumnManager`, `BulkActionsBar`,
   `RecordActionsMenu`, or `AssigneePicker` instead of reusing/extending
   the shared one? This is historically the single biggest source of
   findings — check it thoroughly.
10. **en/es parity** — any `COPY` object with an `en` key missing its `es`
    sibling, or `es` copy that reads as a stiff literal translation rather
    than natural phrasing?
11. **Irreversible vs. reversible action verbs** — do irreversible actions
    (delete, permanently remove) share a verb with reversible ones
    (unlink, remove-from-view, detach)? They shouldn't.

## Step 3 — Tag every finding

Every finding gets exactly one tag:

- **Bug** — objectively wrong, no judgment call needed (e.g. a dialog with
  no visible Cancel button, a toast that says "added" when every sibling
  says "created").
- **Decision** — the "correct" answer is subjective and someone has to
  pick (e.g. which icon, which of two existing color treatments should
  win, whether to rename a verb).
- **Gap** — a feature/capability parity hole, not a wrongness (e.g. one
  page has bulk-select and a sibling page doesn't).

Cite an exact `file:line` for every finding, taken from the *current* state
of the file, read fresh — not from memory of a prior pass.

## Step 4 — Recount before presenting

Before showing the summary to the user, manually recount the Bug / Decision
/ Gap tallies from the raw finding list. **Do not trust a running counter
you kept while sweeping** — it's easy for a summary tile to drift from the
actual tagged items (this has happened before in this exact project). If
you're producing a rendered artifact with its own summary tiles, recompute
those tiles' numbers from the per-item tags right before finalizing, not
just once at the start.

## Step 5 — Batch the Decisions into AskUserQuestion rounds

Never ask Decisions one at a time, and never silently pick an answer
yourself. Group them into rounds of roughly 3–4 related questions each
(e.g. one round for visual/component conventions, one for copy, one for
scope/behavior gaps). For each question, propose a recommended option and
mark it "(Recommended)" — but let the user override.

Gaps that are really just deferred feature work (not urgent) can be logged
without a question — ask only if it's unclear whether the user wants it in
scope now or later.

## Step 6 — Turn resolved Decisions into a shippable chunk plan

Once every Decision has an explicit answer:

- Group fixes into independent, small chunks — a chunk should be shippable
  on its own via `kombo-ship` without depending on another chunk landing
  first.
- Put anything that touches a **shared component used by 3+ call sites**
  in its own later chunk, separate from purely mechanical/isolated fixes —
  those carry more blast radius and deserve to be reviewed on their own.
- Present the chunk plan and ask which chunks to start with now vs. defer,
  unless the user already told you to "just do all of it."

## Step 7 — Verify before shipping each chunk

Follow `kombo-ship`'s pipeline (lint, build, deploy, PR, merge) per chunk —
don't bundle unrelated chunks into one commit or one PR.
