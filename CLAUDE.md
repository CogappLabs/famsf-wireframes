# Wireframe Starter

Interactive wireframe template for stakeholder review. Built with Next.js 16, React 19, TypeScript, and Tailwind CSS 4.

## Architecture

### Adding a new wireframe page

1. Add an entry to `src/lib/data.ts` (id, title, description, status)
2. Add scope entries to `src/lib/scope.ts` (mvp flag, notes, issue URLs)
3. Create `src/app/(wireframes)/<id>/page.tsx`

That's it. The index, top bar badges, footer links, and scope overlay all derive from these files.

### Key directories

- `src/app/page.tsx` — wireframe index (auto-generated from page registry)
- `src/app/(wireframes)/layout.tsx` — wireframe chrome: top bar, scope toggle, footer
- `src/app/(wireframes)/*/page.tsx` — individual wireframe pages
- `src/lib/data.ts` — central data layer: page registry, nav tree, footer groups, review statuses
- `src/lib/scope.ts` — scope annotations: MVP status, notes, issue tracker URLs
- `src/lib/strings/en.json` — all copy, externalised for easy editing
- `src/components/wireframe/` — reusable wireframe primitives
- `src/providers/ScopeProvider.tsx` — scope toggle state + page context

### Wireframe components

All components are exported from `@/components/wireframe`:

- `<Container size="xl">` — width-constrained wrapper (xs/sm/md/lg/xl/full)
- `<WireframeSection label="...">` — wraps full sections, shows scope overlay
- `<ScopeMark label="...">` — wraps sub-components within a section
- `<ImagePlaceholder aspect="16/9" label="...">` — grey box with label text
- `<SectionLabel>` — uppercase mono kicker label
- `<LinkCard href="..." title="..." description="...">` — clickable navigation card
- `<StatCard value="24" label="Pages">` — big number + label
- `<CategoryBadge>Tag</CategoryBadge>` — inline category/tag pill
- `<Breadcrumb items={[{label, href?}]}>` — slash-separated breadcrumb trail
- `<IssueIcon>` — issue tracker logomark (default: Linear)
- `usePageVariations(variations)` — registers variations in the top bar and returns the active key

### Variations

Pages can offer alternative layouts via URL search params (e.g. `?variation=list`). This lets stakeholders compare design options with shareable links. The toggle renders automatically in the layout top bar.

Usage:
1. Define variations: `const VARIATIONS = [{ key: "grid", label: "Grid" }, { key: "list", label: "List" }] as const`
2. Call `usePageVariations` in your page component — it registers the toggle in the top bar and returns the active key: `const variation = usePageVariations(VARIATIONS)`
3. Conditionally render: `{variation === "list" ? <ListView /> : <GridView />}`
4. Wrap the page in `<Suspense>` since `useSearchParams` requires it

The first variation is the default. The `?variation` param is omitted for the default, keeping URLs clean. The toggle disappears when navigating to pages without variations.

### Scope system

The scope toggle (top bar) overlays MVP/post-MVP annotations on sections:
- Green border + badge = MVP
- Grey overlay + badge = post-MVP
- Notes and issue tracker links shown inline
- ScopeMark uses a left-edge colour bar for sub-component annotations

### Data layer

`src/lib/data.ts` is the single source of truth for:
- `pages` — the page registry (id, title, description, review status)
- `navigation` — nav tree with `NavNode` type for mega navs
- `footerGroups` — structured footer link groups (auto-derived from pages)
- `ReviewStatus` type and display constants

### Strings

All display copy lives in `src/lib/strings/en.json`. Use `t("key")` to reference strings. This keeps wireframe content separate from component structure.

### Auth

Password protection with IP bypass, configured via environment variables:

- `WIREFRAME_PASSWORD` — shared preview password
- `WIREFRAME_SECRET` — signs the session cookie (generate with `openssl rand -base64 32`)
- `WIREFRAME_ALLOWED_IPS` — comma-separated IPs that bypass auth entirely

When no env vars are set (local dev), auth is disabled entirely. On Vercel, set all three in the project's environment variables.

The login page is at `/login`. Authenticated sessions last 30 days via an HMAC-signed cookie.

## Commands

- `npm run dev` — start dev server
- `npm run build` — production build
- `npm run lint` — Biome check
- `npm run lint:fix` — Biome auto-fix
- `npm run typecheck` — TypeScript type check

## Tools

- **Linter/formatter:** Biome v2 (not ESLint)
- **Pre-commit:** Lefthook
- **Deployment:** Vercel (zero config)

## Skills

The `wireframe-designer` skill from `cogapp-plugins` is pre-approved. Use `/wireframe-designer` to get guidance on creating new wireframe pages.
