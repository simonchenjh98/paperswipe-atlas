# PaperSwipe

PaperSwipe is the ten-minute daily research briefing for people building the
future. It turns a broad academic index into a finite Daily Drop of high-signal
papers, explains the builder angle, and learns from every save, skip, deep read,
and share.

## Live product

- Product: <https://simonchenjh98.github.io/paperswipe-atlas/>
- Story and pricing: <https://simonchenjh98.github.io/paperswipe-atlas/about/>

The current founder plan is designed around a simple $5/month subscription.
Checkout is intentionally not connected until authentication, billing, and the
production privacy policy are ready.

## What is implemented

- A finite seven-signal Daily Drop with swipe, keyboard, and button controls
- Live OpenAlex discovery with a curated offline fallback
- Multi-signal re-ranking across topic fit, personal affinity, novelty,
  age-normalized evidence, momentum, and practical builder value
- Transparent Signal Fingerprints and per-paper match explanations
- Explicit negative feedback that updates the local interest profile
- Saved-signal library and BibTeX export
- Interest constellation and momentum-versus-maturity Frontier Map
- Responsive product and conversion pages for desktop and mobile
- A $5 Pro upgrade experience ready for a future secure checkout

The ranking design and quality criteria are documented in
[`docs/plans/2026-08-02-daily-frontier-design.md`](docs/plans/2026-08-02-daily-frontier-design.md).

## Local development

```bash
npm ci
npm run dev
```

Run the complete production checks with:

```bash
npm run lint
npm test
npm run build:pages
```

## Architecture and deployment

GitHub Actions deploys the static Pages edition after every push to `main`.
The static build can call OpenAlex directly and falls back to a curated brief
when the public API is unavailable.

Before taking subscriptions, route discovery through the included server API
or a small edge worker. That layer should keep the OpenAlex key private, cache
candidate pools, enforce quotas, and optionally run budget-controlled AI
enrichment. Never place a production API key in browser code or commit `.env`
files; use encrypted deployment secrets.
