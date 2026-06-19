# FLCut

A link shortener built for Finite Loop Club's Round 1 challenge — built by Prasoon Rao.

Paste a long URL, get back a short one. Visit the short link, get redirected to the original. That's the core loop, and right now that's mostly what's built.

**Live:** https://flcut-eta.vercel.app
**Repo:** https://github.com/prasoonrao/flcut

## What's actually working

- Paste a URL → generates a random 6-character short code → saves it to Postgres (Neon) via Prisma
- Visit `flcut-eta.vercel.app/<code>` → looks up the code → redirects to the original URL
- Deployed and live on Vercel

## What's NOT built yet (being upfront about this)

- No dashboard listing created links yet — this was a required basic feature and I didn't get to it. It's the next thing I'd build.
- No custom aliases. Codes are random only, no way to pick your own slug.
- No scheduled/expiring links.
- No analytics (clicks, referrers, devices) at all.
- No collision handling on short code generation — there's a unique constraint at the database level so a collision would fail loudly rather than silently overwrite, but I don't catch that error and retry yet.
- The short link shown on the homepage after creation is currently hardcoded to `localhost:3000` instead of using the actual deployed domain — a real bug from testing locally and not fixing it before deploy.
- No input validation on the pasted URL — it'll happily store anything you type, valid URL or not.

## Data model, and why

One table, `Link`:

```
id           Int      (auto-increment, primary key)
originalUrl  String
shortCode    String   (unique)
createdAt    DateTime (default now)
```

I kept this as small as possible on purpose. I didn't build accounts, analytics events, or scheduling, so there was no reason to add tables or columns for features that don't exist yet. The `shortCode` unique constraint is doing double duty — it's both the lookup key for redirects and the only real protection against two links colliding.

If I add analytics later, that'd be a separate `Click` table referencing `Link` by id, rather than cramming click data onto the `Link` row itself, since click volume grows much faster than link count and I'd rather keep that data separate.

## If I'd had 4 hours, what I'd build first vs. cut

This is basically what happened in practice. First 4 hours went into: get Next.js + Prisma + Neon talking to each other, get one URL stored, get one redirect working, get it deployed. That ate more time than I expected — most of it was fighting tooling (see tradeoffs below), not writing actual feature code.

If I had to cut something on purpose, knowing what I cut, it'd be in this order: analytics first (most build effort for least core value at this stage), then scheduling/expiry, then custom aliases. I'd build the dashboard before any of those three, since it's required and genuinely small to add.

## One tradeoff I made

I generate short codes with `Math.random().toString(36).substring(2,8)` instead of something like nanoid. It's simple, no extra dependency, and works fine at the scale this currently runs at. The tradeoff is that it's not cryptographically random and has a real, if small, collision probability as the table grows — I'm relying entirely on the database's unique constraint to catch that, not on the generation logic itself being collision-resistant.

## What I assumed because the PRD didn't say

- No login/accounts needed for this version — anyone can shorten a link, nothing is tied to a user. The PRD left this open ("your call"), and given the timeline I assumed open access was the simpler, more testable default.
- Short codes don't need to be human-readable or memorable unless someone explicitly picks a custom alias (a feature I didn't get to) — random is fine as the default.
- A broken/missing link should fail loud and simple ("Link not found") rather than redirect somewhere generic, since silently redirecting felt worse than a clear error for a tool meant for event links people are actively relying on.

## Real problems I hit while building this

**Prisma config mismatch.** I had a `prisma.config.ts` written against a newer Prisma version's config API (`import { defineConfig } from "prisma/config"`), but the project has Prisma 5 installed, so that import didn't exist. Removed the mismatched config, used the standard `schema.prisma`-only setup that matches the installed version.

**Stale Prisma client on Vercel.** First deploy failed because Vercel caches `node_modules` between builds, so it reused an old generated Prisma client instead of regenerating it. Fixed by changing the build script to `prisma generate && next build`, so the client always regenerates fresh on deploy.

## Stack

Next.js (App Router) + TypeScript, Prisma as the ORM, PostgreSQL hosted on Neon, deployed on Vercel.

## Running locally

```bash
npm install
npm run dev
```

Needs a `DATABASE_URL` environment variable pointing at a Postgres database (I used Neon).