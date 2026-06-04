# UrbanFix — Frontend

A modern home-services marketplace built with **Next.js 16**, **Tailwind CSS v4**, and **Zustand**. Homeowners can discover verified professionals, browse services, and contact providers — while providers manage their listings and track reviews from a dedicated dashboard.

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router) |
| Styling | Tailwind CSS v4 + `tw-animate-css` |
| UI Primitives | Base UI + shadcn/ui |
| State / Auth | Zustand (persisted to localStorage) |
| Icons | Lucide React |
| Theme | `next-themes` (light / dark / system) |
| Package Manager | pnpm |

---

## Project Structure

```
urbanfix-frontend/
├── app/
│   ├── layout.tsx               # Root layout — fonts, ThemeProvider, Navbar
│   ├── page.tsx                 # Homepage — hero, categories, how-it-works, top providers
│   ├── login/page.tsx           # Login with demo account quick-select
│   ├── register/page.tsx        # Registration with user / provider role picker
│   ├── services/page.tsx        # Provider discovery with search & filters
│   ├── providers/[id]/page.tsx  # Full provider profile — services, gallery, reviews
│   ├── admin/page.tsx           # Admin panel — providers, users, categories tables
│   └── provider/
│       ├── setup/page.tsx       # Two-step provider onboarding wizard
│       └── dashboard/page.tsx   # Provider dashboard — overview, services, profile
├── components/
│   ├── common/
│   │   ├── navbar.tsx                   # Sticky nav with auth dropdown and mobile menu
│   │   ├── home-footer.tsx              # Footer with provider CTA (guests only)
│   │   ├── category-card.tsx            # Standard and compact category tile
│   │   ├── provider-card.tsx            # Provider summary card for grid layouts
│   │   ├── star-rating.tsx              # Partial-star rating display
│   │   ├── contact-button.tsx           # Role-aware contact / edit-profile button
│   │   ├── provider-profile-actions.tsx # Sidebar CTA buttons
│   │   ├── manage-services-button.tsx   # Visible to profile owner only
│   │   └── auth-sync.tsx                # Syncs Zustand JWT → cookie for Edge middleware
│   ├── ui/button.tsx            # CVA-powered Button with variant + size props
│   └── theme-provider.tsx       # next-themes wrapper + "D" key shortcut
├── lib/
│   ├── api.ts                   # Client-side API (reads JWT from localStorage)
│   ├── server-api.ts            # Server-side API for Next.js Server Components
│   ├── mappers.ts               # Raw API response → frontend type transformations
│   ├── mock-data.ts             # Static mock data for dev / prototyping
│   └── utils.ts                 # cn() — Tailwind class merger
├── store/
│   └── auth-store.ts            # Zustand auth store (user, token, login, logout)
└── types/
    ├── index.ts                 # Frontend domain types (User, Provider, Review…)
    └── api.ts                   # Raw API response shapes from the NestJS backend
```

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 20
- **pnpm** ≥ 9
- Backend API running at `http://localhost:4000` (see [urbanfix-backend](../urbanfix-backend))

### 1. Install dependencies

```bash
pnpm install
```

### 2. Configure environment

Create a `.env.local` in the project root:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

> If the backend is not running the app falls back gracefully — pages render with empty data instead of crashing.

### 3. Run the dev server

```bash
pnpm dev
```

Open [http://localhost:3001](http://localhost:3001) in your browser.

---

## Demo Accounts

The backend seed script creates these accounts. Any password works with the demo backend.

| Role | Email | What you can do |
|---|---|---|
| User | `user@demo.com` | Browse providers, view profiles |
| Provider | `provider@demo.com` | Dashboard, manage services, edit profile |
| Admin | `admin@demo.com` | Verify providers, manage users and categories |

These are pre-filled by the quick-select buttons on the login page.

---

## Features

### Homeowners
- Search and filter providers by name, category, location, rating, and verified status
- View full provider profiles with services & pricing, work gallery, and customer reviews
- Contact providers directly via phone or email

### Providers
- Two-step onboarding wizard — business info then services
- Dashboard with stats, service management (add / remove), and profile editing
- Verified badge shown to homeowners; granted by admins

### Admins
- Provider table with searchable list and one-click verify / unverify
- User table with role badges
- Category management (add, edit, delete)

---

## Authentication

1. Register or login → API returns a JWT
2. JWT stored in Zustand, persisted in `localStorage` under `urbanfix-auth`
3. `AuthSync` mirrors the token to a `urbanfix-token` cookie on every change
4. Next.js Edge Middleware (`proxy.ts`) reads the cookie to guard protected routes server-side
5. `lib/api.ts` reads the token from localStorage and attaches it as `Authorization: Bearer …`

---

## Theme

Defaults to system preference. Press **D** anywhere (outside a text input) to toggle dark/light mode. Powered by `next-themes`.

---

## Scripts

```bash
pnpm dev         # Start dev server with Turbopack
pnpm build       # Production build
pnpm start       # Serve the production build
pnpm lint        # ESLint
pnpm typecheck   # TypeScript check (no emit)
pnpm format      # Prettier — formats all .ts/.tsx files
```

---

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `http://localhost:4000/api` | Backend API base URL |

---

## Related

- [urbanfix-backend](../urbanfix-backend) — NestJS REST API with MongoDB
