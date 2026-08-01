# PaperSwipe Atlas

PaperSwipe Atlas is a swipe-first academic discovery experience. It combines
live OpenAlex search, fast paper triage, a local research library, reading
plans, trending papers, BibTeX export, and an exploratory knowledge atlas.

## Live site

The GitHub Pages deployment is published automatically from `main`:

<https://simonchenjh98.github.io/paperswipe-atlas/>

## Local development

```bash
npm ci
npm run dev
```

Run the production checks with:

```bash
npm run lint
npm test
npm run build:pages
```

## Deployment

- `.github/workflows/pages.yml` builds and deploys the static GitHub Pages
  edition on every push to `main`.
- The Pages edition calls OpenAlex directly from the browser, so it retains
  live discovery without exposing any server secret.
- The vinext application and `/api/papers` route remain available for a future
  Cloudflare Workers or Node deployment.

Never commit `.env` files or API keys. Add production credentials through the
deployment platform's encrypted secret store.
