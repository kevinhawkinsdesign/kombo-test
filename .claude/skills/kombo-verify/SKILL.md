---
name: kombo-verify
description: Spin up the webapp dev server and drive it with Playwright to click through a flow and confirm it actually works, before shipping. Use before any kombo-ship for a change that touches interactive behavior — dialogs, selection, menus, multi-step flows — not for pure copy/color/lint-only changes.
---

# kombo-verify

Lint and `tsc` catch type errors, not broken UX. This repo has no unit
test suite in `webapp/` — the only way to know an interactive change
actually works is to click through it. This skill runs that check the same
way every time, including the one gotcha that has caused false failures
before.

Skip this skill for changes that are purely copy, color-token, or icon
swaps with no new interactive logic — `npm run lint && npm run build` is
sufficient verification there.

## Step 1 — Start the dev server in the background

```bash
cd kombo-test/webapp
nohup npm run dev -- --port 5183 --strictPort > /path/to/scratchpad/dev-server.log 2>&1 &
disown
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:5183/
```

Confirm the curl prints `200` before moving on. Use the session's
scratchpad directory for the log file, not `/tmp`.

## Step 2 — Write the Playwright script to the scratchpad, not inline

Use the pre-installed Chromium — do not run `playwright install`:

```js
const { chromium } = require("/opt/node22/lib/node_modules/playwright");

(async () => {
  const browser = await chromium.launch({
    executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome",
    args: ["--no-sandbox"],
  });
  const page = await browser.newPage();
  await page.goto("http://localhost:5183/");

  // Handle the sign-in gate if the app lands there first.
  const signIn = page.getByRole("button", { name: /sign in/i });
  if (await signIn.isVisible().catch(() => false)) {
    await signIn.click();
  }

  // ... drive the actual flow under test here ...

  await browser.close();
})();
```

Run it with the repo's Node: `node /path/to/scratchpad/verify.js`.

## The one gotcha: the dev server is NOT hash-routed

Only the deployed `app/` GitHub Pages build uses `VITE_ROUTER=hash`. The
local dev server uses normal path-based routing. This means:

- **Do not** navigate between steps with repeated
  `page.goto(base + "/#/some/path")` calls expecting a hash-route change to
  force a reload — against the dev server this is frequently a no-op
  (same-document, nothing reloads), and it silently leaves whatever dialog
  was open from the previous step still open. The next click then times
  out with something like "subtree intercepts pointer events," which looks
  like a bug in the app but is actually a bug in the test script.
- **Do** navigate by clicking through the actual UI — open menus, click
  links, press Escape to close a dialog, click the next entry point — the
  same way a real user would, and the same way the app will actually be
  used once deployed with hash routing.
- If you do need to jump straight to a route, use `page.goto("http://
  localhost:5183/some/path")` (no `#`) — that's a real path-based
  navigation the dev server will honor.

## Step 3 — Assert on real state, not just "did it not crash"

For each step of the flow, check something concrete: text visible on the
page (`getByText`, `getByRole`), a dialog closed/open, a toast appeared, a
row count changed. Take a screenshot at the key moment(s) — `page.
screenshot({ path: "..." })` into the scratchpad — so you can visually
confirm rather than assume from a lack of thrown errors.

## Step 4 — Report and clean up

Summarize what was clicked through and what was confirmed, referencing any
screenshots. Then:

```bash
kill %1   # or find the dev-server PID and kill it — don't leave it running
```

If the flow reveals a real bug, fix it, then re-run this same script from
Step 1 rather than assuming the fix worked.
