# Kombo 2.0 — Web App Prototype

A SaaS web-app UI prototype for **Kombo 2.0**, the AI sales workspace. It
reimagines the functionality of the Kombo Chrome extension (prospecting,
lists, unified inbox, campaigns, call coaching, CRM sync) as a standalone,
full-screen web application with a new UI/UX.

This is a **UI prototype**: all data is mocked/static (`src/lib/mock-data.ts`)
and there is no backend. Auth is simulated — any credentials work, or use
**"Explore the demo workspace"**.

## Stack

- **React 19 + TypeScript + Vite**
- **Tailwind CSS v4** + **shadcn/ui** (new-york style)
- Theme reproduces the shadcn preset `b3RYahmHw`
  (radix base · mauve neutrals · violet primary · Inter · lucide · lime charts)
- **React Router** for routing, **TanStack Query** wired for future data
- **Sonner** for toasts, light/dark theme support

## Getting started

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # type-check + production build
npm run lint
```

## Routes

| Path | Screen |
|---|---|
| `/login`, `/signup` | Auth (mock) |
| `/` | Dashboard — KPIs, top prospects, activity, campaigns |
| `/search` | Prospect Search — filters, selectable table, bulk add-to-list |
| `/prospects/:id` | Prospect profile — enrichment, signals, conversation |
| `/lists`, `/lists/:id` | Lists and list detail |
| `/inbox` | Unified inbox (email + LinkedIn) |
| `/campaigns` | Multi-channel sequences |
| `/coach` | AI call coaching |
| `/integrations` | Integrations directory |
| `/settings` | Profile, appearance, plan & billing |

## shadcn/ui

`components.json` is configured for the project, so the shadcn CLI/MCP can add
more components once the registry (`ui.shadcn.com`) is reachable from your
network. Components currently live in `src/components/ui/`.

## Project layout

```
src/
├── components/
│   ├── ui/            # shadcn/ui primitives
│   ├── layout/        # sidebar, header, page, auth shells
│   ├── prospect/      # add-to-list & compose dialogs
│   ├── common/        # shared prospect bits (avatar, score, status)
│   └── icons/         # brand icons (LinkedIn)
├── lib/
│   ├── types.ts       # domain types
│   ├── mock-data.ts   # fixtures
│   ├── auth.tsx       # mock auth context
│   └── format.ts      # date / initials helpers
└── pages/             # one file per route
```
