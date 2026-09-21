# Contributing

Thanks for helping make research discovery more inspectable and useful.

## Before you start

- Search existing issues and discussions.
- Open an issue before a large feature or architecture change.
- Keep pull requests focused and include tests for behavior changes.
- Never add private papers, user data, credentials, or copied publisher content.

## Development setup

```bash
npm ci
npm run dev
```

Before opening a pull request, run:

```bash
npm run lint
npm test
npm run build:pages
```

## Pull request checklist

- Explain the user problem and the chosen trade-off.
- Add or update tests.
- Verify mouse, keyboard, and mobile behavior for UI changes.
- Document new environment variables without committing their values.
- Disclose material AI assistance and describe how the result was reviewed.

Small fixes can go directly to a pull request. For changes to ranking semantics,
privacy, data retention, or generated claims, open an issue first so the
evaluation criteria can be agreed before implementation.
