---
name: kombo-ship
description: Ship a webapp change end-to-end — lint, build, deploy, commit, push, PR, merge. Use whenever a change to kombo-test/webapp is ready to go out, or the user says "ship it," "ship this," "deploy and merge," or similar. Handles the routine non-fast-forward push rejection automatically.
---

# kombo-ship

Runs the exact pipeline this repo has used for every shipped change: lint →
build → deploy → commit → push → draft PR → ready → squash-merge. The goal
is that shipping is never a bespoke sequence of ad hoc commands — it's
always this.

Assumes: you're working in `kombo-test`, changes are already made in
`webapp/src` (or elsewhere in the repo), and you know your assigned working
branch for this session (given in your instructions — do not guess it).

## Steps

### 1. Verify from a clean starting point

```bash
cd kombo-test/webapp
git status --short          # know what's changed before touching anything
```

If there are changes you didn't expect (files you didn't touch), stop and
figure out why before proceeding — don't ship someone else's in-flight work
by accident.

### 2. Lint and build

```bash
npm run lint     # must exit 0 errors. ~19 pre-existing warnings is the
                  # accepted baseline (react-refresh/only-export-components
                  # in shadcn/ui + constant-export files) — don't chase that
                  # to 0, but don't let it grow either.
npm run build    # tsc -b && vite build — must exit 0
```

If either fails, fix it before continuing. Do not deploy or commit broken
code "to see if CI catches it" — there is no CI here beyond you.

### 3. Rebuild the GitHub Pages bundle

```bash
cd ..   # repo root
bash scripts/deploy-web.sh
```

This rebuilds with `VITE_ROUTER=hash --base=./` and merges into `app/`. It
**deletes old hashed asset files** beyond the 40 most recent on purpose —
if `git status` shows deleted files under `app/assets/`, that's expected
pruning, not something to investigate or revert.

Skip this step only if nothing under `webapp/src` changed (e.g. a
docs-only or `.claude/`-only change).

### 4. Check whether your branch is behind `origin/main`

```bash
git fetch origin main
git merge-base --is-ancestor origin/main HEAD && echo "up to date" || echo "BEHIND — rebase needed"
```

If behind (near-certain if any PR merged since your branch's base), see
**"Handling the routine non-fast-forward"** below *before* you commit —
it's cleaner to rebase first, but the section also covers doing it after.

### 5. Stage deliberately, not broadly

```bash
git status --short
git add <specific files>    # not `git add -A` / `git add .` reflexively —
                             # look at what's staged and make sure nothing
                             # unrelated snuck in
```

### 6. Commit

One logical change per commit. Message explains *why*, not just *what* (the
diff already shows what). End every commit with:

```
Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: <this session's URL, if you have it>
```

Never mention model identifiers anywhere else (PR title/body, code
comments) — chat/commit-footer only.

### 7. Push

```bash
git push -u origin <your-branch>
```

### Handling the routine non-fast-forward

If step 7 is rejected with "non-fast-forward," this is expected the first
time you push after any prior PR from this branch merged — the remote
branch ref still has the old, now-superseded commit history, or your local
base is behind `origin/main`. It is **not** a real content conflict.

```bash
git status                              # confirm what's uncommitted, if anything
git stash push -u -m "wip"              # if you already committed, skip this
git fetch origin main
git checkout -B <your-branch> origin/main
git stash pop                           # reapply your changes on the fresh base
# re-run lint/build/deploy (base changed, so re-verify)
git add <files> && git commit -m "..."  # if you hadn't committed yet
git push --force-with-lease -u origin <your-branch>
```

`--force-with-lease`, never bare `--force`. The commits being replaced are
already merged into `main`, so nothing real is lost — but `--with-lease`
still protects you if someone else pushed to the branch in the meantime.

### 8. Check for an existing open PR before creating one

Use the GitHub PR-list tool filtered to `head: <owner>:<your-branch>`,
`state: open`. If one exists, you're done after the push — don't open a
duplicate. If the only PR for this branch is already merged or closed,
treat this as fresh work and open a new one.

### 9. Open a draft PR

Look for a PR template (`.github/pull_request_template.md` or similar)
first; if one exists, follow its structure. Otherwise write:

- **Summary** — a real bullet list of what changed, grouped if it's a
  batch of small fixes. Never "misc fixes."
- **Test plan** — a checklist of what you actually ran (lint, build,
  deploy, any manual/Playwright verification), checked off.

Create with `draft: true`.

### 10. Mark ready and merge

Per the standing authorization in `kombo-test/CLAUDE.md`: mark the PR ready
for review and squash-merge it **without asking** — this repo has an
explicit, standing "don't ask, just merge" instruction. This does not
extend to anything else (force-pushing over someone else's commits,
deleting branches, closing other people's PRs) — those still need a real
reason and, if destructive, a check-in.

```
update_pull_request(draft: false)
merge_pull_request(merge_method: "squash")
```

### 11. Clean up

Delete any temporary backup branches you created during a rebase. Leave
the PR's own branch alone (GitHub can auto-delete on merge, or leave it —
either is fine).

## When NOT to auto-merge

- The repo's CLAUDE.md doesn't contain the standing merge authorization (if
  it's ever removed or scoped down, ask before merging).
- Lint or build is failing and you can't find the root cause quickly —
  don't force it through.
- The change is large/architecturally significant enough that Kevin would
  reasonably want to look before it merges (use judgment; when in doubt on
  this specific point, ask once).
