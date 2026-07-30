# Third-party skills

The skills below were pulled in from https://recent.design/skills (per Kevin's
request) — each is vendored from its own upstream repo, unmodified. Keep this
list in sync if any are added or removed so provenance stays traceable.

| Skill | Source | License |
|---|---|---|
| `canvas-design` | github.com/anthropics/skills | see `LICENSE.txt` in folder |
| `frontend-design` | github.com/anthropics/skills | see `LICENSE.txt` in folder |
| `impeccable` | github.com/pbakaus/impeccable | see upstream repo |
| `web-design-guidelines` | github.com/vercel-labs/agent-skills | see upstream repo |
| `vercel-react-best-practices` | github.com/vercel-labs/agent-skills (`react-best-practices`) | see upstream repo |
| `vercel-react-native-skills` | github.com/vercel-labs/agent-skills (`react-native-skills`) | see upstream repo |
| `vercel-composition-patterns` | github.com/vercel-labs/agent-skills (`composition-patterns`) | see upstream repo |
| `prototype` | github.com/emilkowalski/skills | see upstream repo |
| `apple-design` | github.com/emilkowalski/skills | see upstream repo |
| `animation-vocabulary` | github.com/emilkowalski/skills | see upstream repo |
| `emil-design-eng` | github.com/emilkowalski/skills | see upstream repo |
| `review-animations` | github.com/emilkowalski/skills | see upstream repo |
| `ui-skills-root` | github.com/ibelick/ui-skills | see upstream repo |
| `make-interfaces-feel-better` | github.com/jakubkrehel/make-interfaces-feel-better | see upstream repo |
| `userinterface-wiki` | github.com/raphaelsalaja/userinterface-wiki | see upstream repo |
| `oklch-skill` | github.com/jakubkrehel/oklch-skill | see upstream repo |
| `extract-design-system` | github.com/arvindrk/extract-design-system | see upstream repo |
| `grill-me` | github.com/mattpocock/skills (`skills/productivity/grill-me`) | see upstream repo |
| `agent-browser` | github.com/vercel-labs/agent-browser | see upstream repo |
| `shadcn` | github.com/shadcn/ui (`skills/shadcn`) | see upstream repo |
| `tailwind-design-system` | github.com/wshobson/agents (`plugins/frontend-mobile-development/skills/tailwind-design-system`) | see upstream repo |
| `typescript-advanced-types` | github.com/wshobson/agents (`plugins/javascript-typescript/skills/typescript-advanced-types`) | see upstream repo |

Note: the recent.design listing showed 4 separate entries for
`pbakaus/impeccable` (`quieter`, `distill`, `critique`, `polish`) and 2 more
for `emilkowalski/skill` (`emil-design-eng`, `review-animations`, a repo
identical in content to `emilkowalski/skills`) — those aren't separate
packages upstream. `impeccable` ships as one unified skill with
quieter/distill/critique/polish as reference docs/subcommands within it, and
`emilkowalski/skill` mirrors `emilkowalski/skills`, so each was installed
once rather than duplicated.
