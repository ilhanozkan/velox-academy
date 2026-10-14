# Velox Academy — frontend

Next.js 14 (App Router) application with Mantine UI. It talks to the API in
`backend/app` and connects directly to the learner's sandbox (`vm-image`) for
files, runs and the terminal.

## Getting started

```bash
cd frontend/app
yarn install
yarn dev            # http://localhost:3000
```

or with Docker: `make dev` from `frontend/`.

The API URLs come from `.env.development` (committed defaults) and can be
overridden in `.env.local`:

| Variable | Default | |
| --- | --- | --- |
| `NEXT_PUBLIC_BASE_URL` | `http://localhost:8080/api` | API base URL |
| `NEXT_PUBLIC_IMAGE_SERVER` | `http://localhost:8080/static` | Course images and avatars |

`yarn dev` and `yarn build` first run `scripts/copy-monaco.js`, which copies
the Monaco editor into `public/monaco` (git-ignored) so it is not loaded from
a CDN.

```bash
yarn lint     # ESLint (next/core-web-vitals)
yarn build    # production build, also run in CI
```

## Structure

| Path | |
| --- | --- |
| `src/app/(auth)` | `/giris-yap`, `/kayit-ol` — only for signed-out users |
| `src/app/(dashboard)` | Sidebar layout: `/egitimler`, `/istatistikler`, `/ayarlar`, `/yonetim/*` (admins) |
| `src/app/(workspace)` | `/egitimler/[trainingId]` — full-screen training workspace |
| `src/components/Workspace` | Sandbox lifecycle, editor, file tree, results, terminal, instructions |
| `src/components/Admin` | Admin dashboard, users and curriculum editor |
| `src/lib/api.js` | Axios client (cookie session, error helpers) |
| `src/lib/features/auth` | Redux auth state (profile, login, register, logout) |

The session is an `httpOnly` cookie set by the API; the app never reads the
token. `RequireAuth` / `GuestOnly` (`src/components/Auth/AuthGuard.js`)
redirect based on the profile request made when the app loads.

## UI conventions

- Colors come from `src/app/theme/theme.js`: `primary` (brand indigo, shade 6
  for buttons and links) and `navy` (the workspace's dark surfaces). Its CSS
  variables resolver darkens Mantine's teal, green, red, gray, … where the
  defaults fail WCAG AA contrast, so plain color names (`color="teal"`) are
  safe to use.
- Shared building blocks: `PageHeader`, `EmptyState`, `ErrorState`,
  `FullPageLoader`.
- Workspace shortcuts: `Ctrl/⌘ + Enter` saves and runs, `Ctrl/⌘ + S` saves.
  Pane sizes are kept in `localStorage` (`velox.workspace.*`) through
  `src/hooks/useStoredState.js`.
- Below the `sm` breakpoint the workspace shows one pane at a time with a
  bottom navigation, and the file list opens in a drawer.
