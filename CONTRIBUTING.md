# Contributing

Thanks for helping improve `api-core-auth`.

## Local Development

```bash
npm install
npm run lint
npm run typecheck
npm test
npm run build
```

## Guidelines

- Keep the package database-agnostic.
- Do not add user registration, login lookup, or refresh-token storage logic.
- Keep errors safe for API responses.
- Add or update tests for behavior changes.
- Keep public APIs documented in `README.md`.

## Release Checklist

1. Update `CHANGELOG.md`.
2. Run `npm run lint && npm run typecheck && npm test && npm run build`.
3. Confirm `package.json` metadata and exports.
4. Publish with `npm publish`.
