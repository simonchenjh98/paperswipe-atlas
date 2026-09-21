# PaperSwipe Atlas

[![Deploy PaperSwipe to GitHub Pages](https://github.com/simonchenjh98/paperswipe-atlas/actions/workflows/pages.yml/badge.svg)](https://github.com/simonchenjh98/paperswipe-atlas/actions/workflows/pages.yml)
[![MIT License](https://img.shields.io/badge/license-MIT-83f7d0.svg)](LICENSE)
[![OpenAlex](https://img.shields.io/badge/data-OpenAlex-68d9ff.svg)](https://openalex.org/)

An open-source research radar that turns the global paper graph into a finite,
explainable daily brief. PaperSwipe Atlas retrieves papers from OpenAlex,
re-ranks them around what you are building, learns from explicit feedback, and
shows why each recommendation matched.

**[Try the live demo](https://simonchenjh98.github.io/paperswipe-atlas/)**

![PaperSwipe Atlas social preview](public/og.png)

## Why PaperSwipe Atlas?

Most research feeds optimize for popularity or volume. PaperSwipe Atlas is
designed for decision-making:

- a finite seven-paper Daily Drop instead of an endless feed;
- independent topic-fit, personal, novelty, evidence, momentum, and practical-value signals;
- visible explanations for every ranking decision;
- explicit negative feedback, not only likes and saves;
- live OpenAlex discovery with a useful offline fallback;
- a saved-paper library, BibTeX export, and personal frontier map;
- a local browser profile with no account required for the public demo.

## Quick start

Requirements: Node.js 24 or newer.

```bash
git clone https://github.com/simonchenjh98/paperswipe-atlas.git
cd paperswipe-atlas
npm ci
npm run dev
```

Open the local URL printed by the development server. The application can call
OpenAlex directly and falls back to a curated brief when the public API is
unavailable.

## Quality checks

```bash
npm run lint
npm test
npm run build:pages
```

The test suite covers the ranking contract, explicit negative feedback,
rendered product structure, and the static GitHub Pages build.

## Project status

PaperSwipe Atlas is a public beta. The current release is strongest as an
explainable discovery and triage interface. The next milestone brings in the
deeper PaperAtlas work: local PDF import, evidence-backed contribution cards,
and a navigable graph of concepts, methods, datasets, and paper relationships.

Current limits are documented openly:

- ranking is deterministic and heuristic, not a claim of scientific importance;
- the public demo stores preferences in the browser;
- the static build does not include private PDF ingestion or hosted accounts;
- users should inspect original papers before relying on generated summaries or scores.

See [ROADMAP.md](ROADMAP.md) for the one-month release plan.

## Architecture

- `app/`: Next-compatible application and API route
- `github-pages/`: static entry points used by the public demo
- `lib/openalex.ts`: OpenAlex retrieval and normalization
- `lib/relevance.ts`: explainable multi-signal ranking and feedback updates
- `worker/`: optional edge-worker entry point for cached production retrieval
- `tests/`: behavior, rendering, and visual-contract tests

GitHub Actions runs linting, the production build, tests, and the static Pages
build before deployment.

## Contributing

Bug reports, design critiques, data-source adapters, ranking evaluations, and
accessibility improvements are welcome. Start with
[CONTRIBUTING.md](CONTRIBUTING.md), then open an issue before a large change.

## Privacy and security

Do not commit API keys or private paper collections. The static demo does not
need a secret. Production deployments should keep provider keys in an edge or
server environment and follow [SECURITY.md](SECURITY.md).

## License

MIT. See [LICENSE](LICENSE).
