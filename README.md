# 🌌 Orbit — Reimagine Social

**Live demo:** https://orbit-social-eight.vercel.app/
**Repo:** https://github.com/25it104-sreevarsha/orbit-social

> Stop scrolling. Start orbiting.

Orbit is a social experience built for the **Frontend Odyssey Hackathon — "Reimagine Social"** challenge. It does not clone Instagram, Snapchat, Reddit, or X. It removes the three mechanics that define almost every modern platform — the infinite feed, the follower count, and the like button — and replaces them with a single new idea: **gravity**.

## The Idea

Every existing social platform answers "who matters to you?" with a number you accumulate once and keep forever — a follower count, a like tally. That number doesn't decay, doesn't reflect whether you actually still talk to that person, and rewards volume over genuine attention.

Orbit answers that question differently: **closeness is live, not stored.**

- There is no feed. There is a **Galaxy** — a map of ideas ("Sparks") currently pulling real attention.
- There is no follow button. You **drift into orbit** with people currently engaged in the same idea as you.
- There is no like button. Engagement is shown as **gravity** — literal visual closeness between people on a map.
- Connection isn't permanent. If two people stop interacting, their nodes **visibly drift apart** in "Your Sky" — an honest, living record of who you actually engage with right now, not who you followed two years ago and forgot about.

## Core Screens

| Screen | Replaces | What it does |
|---|---|---|
| **Galaxy View** | The feed | A pannable, zoomable map of live Sparks, sized by real-time attention density, not an algorithm's ranking |
| **Orbit Room** | Comment section | Concentric rings show who's engaged, how closely, in real time — reply by "adding your gravity," visualized as a live connecting thread |
| **Your Sky** | Profile grid | Your personal constellation of real relationships, positioned by closeness — including a "Fading" zone for connections going quiet |
| **Launch a Spark** | New post | Minimal composer; posting animates your idea launching directly into the galaxy |
| **Discover** | Explore/algorithm feed | A live "gravity leaderboard" of what has genuine attention right now, not what's engineered to go viral |


### Navigation & User Flow

Orbit provides a consistent navigation experience across its core screens:

* **Galaxy** — central live constellation experience
* **Discover** — explore Sparks receiving attention
* **Launch** — create and launch a new Spark
* **Your Sky** — view personal relationship gravity
* **How Orbit Works** — understand the gravity-based interaction model

The persistent TopBar provides quick access to the main Orbit experiences, while the Galaxy also provides a direct Launch action. The application uses React Router for client-side navigation and deep-linked routes.


## Why This Isn't Just a Reskin

Every core interaction model was rebuilt around the gravity concept, not visually restyled from an existing pattern:
- No follower/following counts exist anywhere in the app — not hidden, genuinely absent from the data model.
- Replies are spatial (positioned by ring/closeness), not a flat chronological list.
- The connection-forming moment is animated live — you *see* the gravity form, not just a static counter afterward.
- Fading connections are a first-class UI state, not an edge case — the app is honest about attention decaying.

## Tech Stack

- **React 18 + TypeScript** — component structure, full type safety
- **Vite** — build tooling
- **Tailwind CSS** — styling, custom gradient design tokens
- **Framer Motion** — all interaction and ambient animation, with full `prefers-reduced-motion` support throughout
- **React Router** — screen navigation with deep-linking (e.g. Discover → filtered Galaxy view)
- **Vitest** — unit tests for core geometry/utility logic
- Frontend-only, as required by the challenge — all data is realistic mock data (`src/data/mockData.ts`), no backend

## Notable Engineering Details

- **Collision-aware ring geometry**: avatars orbiting a Spark are placed using a custom `getRadiusClearingRect` function that measures the actual rendered size of the center card (via `ResizeObserver`) and mathematically guarantees no avatar overlaps it — this holds true regardless of how long the Spark's text is, not just for the demo data.
- **Fully reactive responsive breakpoints**: mobile/desktop layout switches use `matchMedia`-backed hooks, not one-time `window.innerWidth` reads, so resizing or rotating a device updates the layout live.
- **Accessibility**: keyboard navigation across all interactive nodes, `aria-label`s describing live state ("Spark: music, 42 people orbiting"), WCAG AA-checked text contrast, and animations that fully respect `prefers-reduced-motion`.
- **PWA-ready**: installable via `manifest.json`.

## Running Locally

```bash
npm install
npm run dev
```

Build for production:
```bash
npm run build
```

Run tests:
```bash
npm run test
```

## Challenge Requirements Checklist

- ✅ Original social interaction model (gravity/orbit, not follow/like/feed)
- ✅ Distinctive visual language (constellation/space motif, not a card-grid feed)
- ✅ Meaningful, working interactions (launching sparks, joining orbits, live gravity threads)
- ✅ Responsive across breakpoints
- ✅ Accessible (keyboard nav, ARIA labels, reduced-motion support, contrast-checked)
- ✅ Clean, typed, tested frontend implementation
- ✅ Frontend-only with realistic mock data, no backend required
