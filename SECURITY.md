# Security policy

## Reporting a vulnerability

Please do not open a public issue for a vulnerability involving credentials,
private documents, user data, or remote code execution. Use GitHub's private
vulnerability reporting for this repository. If that channel is unavailable,
open a discussion that asks for a private contact without including exploit
details.

## Deployment guidance

- Do not place provider keys in browser code.
- Keep production keys in encrypted deployment secrets.
- Treat imported papers and metadata as untrusted input.
- Sanitize rendered HTML and validate external URLs.
- Do not upload private collections to the public demo.

Only the latest commit on the default branch is currently supported.
