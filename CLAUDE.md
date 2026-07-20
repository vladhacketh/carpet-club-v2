# CLAUDE.md

This file provides working guidance for coding agents and developers in this repository.

## Commands

```bash
npm run dev        # dev server, http://localhost:4321 (auto-bumps to 4322+ if 4321 is held)
npm run build      # production build via @astrojs/vercel adapter; outputs static + serverless function
npm run preview    # serve the built dist/ locally
npx astro check    # type-check Astro + TS, expected 0/0/0
```

There is no test runner. Verification = `npm run build` + manual checks.

Env vars live in `.env` (gitignored, sample in `.env.example`). The dev server only reads `.env` at startup — restart after changing it. Vars prefixed `PUBLIC_` are exposed to the client; others (e.g. `META_CAPI_ACCESS_TOKEN`) are server-only.

## Architecture

### Output mode

Astro 5 with `output: 'static'` + `@astrojs/vercel` adapter (pinned to `^8`, **not** the latest v10 which requires Astro 6). Every page is prerendered at build except [src/pages/api/track-event.ts](src/pages/api/track-event.ts), which opts out with `export const prerender = false` and ships as a Vercel serverless function. Don't add pages that need runtime data without the same opt-out.

### Content collections

Schemas live in [src/content/config.ts](src/content/config.ts). Two collections:

- **`artists`** — markdown body is the bio; frontmatter has `name`, `role`, `image`, optional `mix` (SoundCloud track URL **or** YouTube URL — the artist detail page detects and embeds appropriately), and `socials.{instagram,soundcloud,bandcamp,ra}`.
- **`events`** — `date` (`z.coerce.date()`), `title`, `venue`, `status: 'upcoming' | 'past'`, `lineup[]`, optional `shotgun` URL.

Files are loaded in filesystem order; `getCollection('artists')` listed without `.sort()` returns alphabetical-by-slug, which happens to match alphabetical-by-name. On `/artists` the sort is explicit.

### "Upcoming" semantics (important)

[src/pages/index.astro](src/pages/index.astro) renders every event marked `upcoming`; a client-side date filter shows the next two non-past events on every visit. Keep `status` accurate because it controls which records are included in the built page.

[src/pages/events/room.astro](src/pages/events/room.astro) selects the month containing the next dated event and derives the month heading automatically. If no future event exists, it retains the latest event month. Adding the next month's content and deploying is enough to advance the schedule.

### Tuesday badge logic

Non-Wednesday events get a pink "TUESDAY"/"Heads up — TUESDAY" badge automatically via `e.data.date.getDay() !== 3` in both pages. Works for any weekday — no per-event flag needed.

### Centralized site config

[src/lib/site.ts](src/lib/site.ts) is the source of truth for the production URL, booking email, address, and social destinations. New pages should import these values instead of duplicating them.

### Meta Pixel + Conversions API

Two-path tracking with deduplication:

- **Browser**: Pixel snippet inlined in [src/layouts/BaseLayout.astro](src/layouts/BaseLayout.astro) (`<script is:inline>`, do not refactor — Astro must not transform it). Fires `PageView` automatically.
- **Server**: [src/pages/api/track-event.ts](src/pages/api/track-event.ts) hashes email (SHA-256), derives IP + UA from headers, posts to Graph API v22.0.
- **Glue**: [src/scripts/tracking.ts](src/scripts/tracking.ts) generates one UUID per event, fires `fbq(..., {eventID})` and POSTs the same `event_id` to `/api/track-event` via `navigator.sendBeacon`. Meta dedupes by `event_name + event_id`.
- **Events**: `PageView`, `Lead` (newsletter submit success), `OutboundShotgun`, `OutboundResidentAdvisor` (global capturing click delegate on `<a>` tags).
- The CAPI route silently 204s when `META_CAPI_ACCESS_TOKEN` is unset (safe default for local dev).
- **No GDPR consent gate.** Pixel fires immediately. Adding consent is a known TODO.

### Reusable interactive bits

- [src/components/MailChooser.astro](src/components/MailChooser.astro) — modal with 4 send options (Gmail / Outlook / default mail / copy). Triggered by any element with `data-book-trigger` on the page. **One instance per page** (uses static `book-modal` id); the script grabs the first trigger only.
- [src/components/EventsTabs.astro](src/components/EventsTabs.astro) — Room / Carpet Club sub-nav, takes `active` prop.
- [src/components/Marquee.astro](src/components/Marquee.astro) — generic scrolling banner (different from the bespoke artist marquee in [src/pages/artists/index.astro](src/pages/artists/index.astro), which is JS-driven and supports auto-scroll + drag + wheel + trackpad with seamless wrap).
- Visual effects ([Cursor.astro](src/components/Cursor.astro), [DripFilter.astro](src/components/DripFilter.astro), [PixelCanvas.astro](src/components/PixelCanvas.astro)) all respect `prefers-reduced-motion`.

### Routing quirks

- `/events` redirects to `/events/room` via `redirects` in [astro.config.mjs](astro.config.mjs). The sitemap filter in the same file excludes the redirect page.
- Artist detail pages use `[slug].astro` with `getStaticPaths()` over the artists collection.

## Conventions

- Scoped `<style>` blocks with `theme('colors.x')` and `theme('fontFamily.y')` are the dominant pattern; Tailwind utility classes are used sparingly. Stay consistent within a file.
- Images: `.jpeg` + `.webp` companion (generated with `cwebp -q 75 -m 6`). The artist card derives the webp path from the jpeg name.
- Markdown frontmatter strings with special characters should use double quotes (e.g. `name: "Pedro Goya"`).

## Deployment

GitHub `main` → Vercel auto-deploys. The `META_CAPI_ACCESS_TOKEN` and `PUBLIC_WEB3FORMS_KEY` env vars live in the Vercel dashboard, not in repo. After changing an env var in Vercel, trigger a redeploy with **Use existing Build Cache** unchecked.

## Project documentation in `docs/`

`docs/IMPLEMENTATION.md`, `docs/CONTENT-GUIDE.md`, and `docs/PRODUCTION-CHECKLIST.md` are historical/reference documents and may lag behind current code. Trust this file and the code when they conflict.
