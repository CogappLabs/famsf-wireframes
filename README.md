# Wireframe Starter

Interactive wireframe template for stakeholder review. Built with Next.js 16, React 19, TypeScript, and Tailwind CSS 4.

## Quick start

```bash
# Clone and install
git clone https://github.com/CogappLabs/wireframe-starter.git my-wireframes
cd my-wireframes
npm install

# Run locally (no auth required)
npm run dev
```

## Adding a wireframe page

1. Register the page in `src/lib/data.ts`
2. Add scope entries in `src/lib/scope.ts`
3. Create `src/app/(wireframes)/<id>/page.tsx`

The index, top bar, footer, and sitemap all update automatically.

## Features

- **Scope overlay** — toggle MVP/post-MVP annotations with notes and issue tracker links
- **Review status** — WIP, Review, With client, Approved badges per page
- **Variations** — URL-param layout switching for comparing design alternatives
- **String externalisation** — all copy in `strings/en.json`
- **Sitemap** — auto-generated from the navigation tree
- **Password auth** — optional, with IP bypass for office networks
- **Vercel deployment** — zero config

## Components

All exported from `@/components/wireframe`:

| Component | Purpose |
|---|---|
| `Container` | Width-constrained wrapper (xs/sm/md/lg/xl/full) |
| `WireframeSection` | Section wrapper with scope overlay |
| `ScopeMark` | Sub-component scope annotation |
| `ImagePlaceholder` | Grey box placeholder for images |
| `SectionLabel` | Uppercase mono kicker label |
| `LinkCard` | Clickable navigation card |
| `StatCard` | Big number + label |
| `CategoryBadge` | Inline category tag |
| `VariationToggle` | URL-param layout switcher |

## Auth (optional)

Set these environment variables in Vercel:

| Variable | Purpose |
|---|---|
| `WIREFRAME_PASSWORD` | Shared preview password |
| `WIREFRAME_SECRET` | Signs the session cookie |
| `WIREFRAME_ALLOWED_IPS` | Comma-separated IPs that bypass auth |

No env vars = no auth (local dev).

## Commands

```bash
npm run dev        # Start dev server
npm run build      # Production build
npm run lint       # Biome check
npm run lint:fix   # Biome auto-fix
npm run typecheck  # TypeScript type check
```

## Tools

- **Linter:** Biome v2
- **Pre-commit:** Lefthook
- **Deployment:** Vercel
