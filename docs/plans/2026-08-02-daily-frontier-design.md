# PaperSwipe Daily Frontier — Product Design

## Goal

Turn PaperSwipe into a consumer research product for AI, technology, and startup builders. The product promise is: **the ten-minute daily briefing for people building the future**. The initial commercial target is 1,000 subscribers at $5 per month.

## Product loop

Users choose three to five interests and receive a finite Daily Drop of seven high-signal papers. Every paper explains what happened, why it matters, the builder angle, and the evidence limitations. Users can dismiss, save, inspect, or share each signal. Finishing the drop produces a concise daily synthesis and updates the next day's recommendations.

The free tier contains three papers per day and seven days of history. Pro contains the complete daily drop, unlimited history, topic tracking, weekly frontier reports, and exports. Upgrade prompts appear after users experience value, not before first use.

## Relevance pipeline

1. Build an interest profile from explicit topics, natural-language intent, positive actions, and negative feedback.
2. Retrieve a broad candidate pool from several expanded queries.
3. Remove duplicates, withdrawn or low-information records, and results that violate language, freshness, or content preferences.
4. Re-rank candidates using semantic relevance, personal affinity, novelty, evidence quality, freshness, and builder value.
5. Learn from saves, deep reads, source opens, shares, skips, and explicit skip reasons.

The UI must explain the score rather than present a magical number. Citation count is age-normalized and kept separate from semantic relevance.

## Visual system

Use premium editorial intelligence rather than a conventional SaaS dashboard: ink-black surfaces, warm paper, electric cyan, and signal orange; distinctive editorial typography; deliberate asymmetry; restrained motion. The memorable object is a Signal Orb that fills as the daily briefing is completed.

Three visualizations support decisions:

- a per-paper signal fingerprint that explains the ranking;
- a topic constellation showing interests and adjacent discoveries;
- a Frontier Map plotting maturity against momentum, with evidence represented independently.

## Architecture

The static GitHub Pages build uses OpenAlex as a resilient public data source and applies deterministic ranking in the client. Production should route requests through a small server or edge worker so the OpenAlex key remains private, results can be cached, and optional AI enrichment can be controlled by budget. Local storage persists the anonymous interest profile and actions until authentication and billing are connected.

## Quality bar

- Precision@10 target: at least 80% on an editorially labelled benchmark.
- A complete daily flow must work with mouse, touch, and keyboard.
- Empty, loading, offline, and API-limit states must preserve a useful experience.
- Responsive layouts must work from a 360px phone through wide desktop screens.
- Reduced-motion, visible focus, semantic controls, and sufficient contrast are required.

