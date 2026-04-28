# api-core-auth

JWT authentication helpers, password utilities, Express middleware, error classes, and TypeScript types for modern Node.js APIs.

## What Is api-core-auth?

`api-core-auth` is a reusable authentication utility package for JavaScript and TypeScript backend projects. It gives you the core building blocks commonly needed in real-world API authentication:

- Generate and verify JWT access tokens.
- Generate refresh tokens.
- Hash and compare passwords with bcrypt.
- Protect Express routes with authentication middleware.
- Restrict routes by role.
- Safely sanitize user objects before returning them from APIs.
- Use consistent auth errors and strong TypeScript types.

The package is intentionally database-agnostic. It does **not** register users, query users, validate login credentials from a database, or store refresh tokens. Your application controls those responsibilities.

## Why Use It?

Authentication code is repeated in almost every backend project. `api-core-auth` helps you avoid rewriting the same JWT, bcrypt, middleware, and error-handling utilities again and again.

Use it when you want:

- A clean reusable auth foundation for production APIs.
- JavaScript and TypeScript support from one package.
- CommonJS `require()` and ESM `import` compatibility.
- Strong TypeScript types and generated declaration files.
- Express middleware that works with your own database logic.
- Safe error classes that avoid leaking internal details.
- A small package focused only on reusable authentication primitives.
- npm-ready build output with clean package exports.

## Framework Compatibility

`api-core-auth` works with any Node.js backend through its framework-independent JWT, password, utility, error, and TypeScript helpers.

It includes ready-to-use middleware for:

- Express.js
- Express-compatible frameworks
- NestJS projects using the Express adapter

The core helpers can also be used with other backend frameworks by adapting them to that framework's request lifecycle:

- Fastify
- Koa
- Hapi
- Next.js API routes
- Nuxt/Nitro server routes
- AdonisJS
- Native Node.js HTTP servers
- Any custom Node.js backend

For non-Express frameworks, use helpers such as `verifyToken()`, `extractBearerToken()`, `hashPassword()`, and `comparePassword()` inside your own middleware, hook, guard, or request handler.

## Important Design Principles

`api-core-auth` is not a full authentication server. It is a toolkit.

This package does **not**:

- Connect to a database.
- Register users.
- Look up users during login.
- Validate an email and password against stored users.
- Store, rotate, or revoke refresh tokens.
- Decide your app's user model.

Your application is responsible for:

- User registration.
- Login lookup and validation.
- Database queries.
- Refresh-token storage and revocation.
- Session policy.
- Environment variables and secret management.

This separation keeps the package flexible, secure, and useful across many Node.js API projects.

## Features

### JWT Helpers

- `generateAccessToken()`
- `generateRefreshToken()`
- `generateToken()`
- `verifyToken()`
- `decodeToken()`
- `extractBearerToken()`

### Password Helpers

- `hashPassword()`
- `comparePassword()`
- `validatePasswordStrength()`

### Express Middleware

- `authMiddleware()`
- `optionalAuthMiddleware()`
- `roleMiddleware()`

### Utility Helpers

- `sanitizeUser()`
- `createAuthResponse()`
- `getAuthUser()`

### Error Classes

- `AuthError`
- `UnauthorizedError`
- `ForbiddenError`
- `InvalidTokenError`
- `TokenExpiredAuthError`

### TypeScript Types

- `AuthUser`
- `JwtPayload`
- `AuthConfig`
- `TokenPair`
- `AuthMiddlewareOptions`
- `Role`

## Installation

```bash
npm install api-core-auth
```

Install Express if you want to use the middleware:

```bash
npm install express
```

## Environment Variables

Never hardcode JWT secrets in source code.

```env
JWT_SECRET=replace-with-a-long-random-secret
JWT_REFRESH_SECRET=replace-with-another-long-random-secret
```

## JavaScript Usage

```js
const {
  generateAccessToken,
  verifyToken,
  hashPassword,
  comparePassword,
  authMiddleware,
  roleMiddleware
} = require("api-core-auth");
```

## TypeScript Usage

```ts
import {
  generateAccessToken,
  verifyToken,
  hashPassword,
  comparePassword,
  authMiddleware,
  roleMiddleware,
  type AuthUser
} from "api-core-auth";
```

## JWT Helper Examples

```ts
import {
  decodeToken,
  extractBearerToken,
  generateAccessToken,
  generateRefreshToken,
  generateToken,
  verifyToken
} from "api-core-auth";

const accessToken = generateAccessToken(
  {
    id: "1",
    email: "admin@example.com",
    role: "ADMIN"
  },
  process.env.JWT_SECRET!,
  {
    expiresIn: "15m"
  }
);

const refreshToken = generateRefreshToken(
  {
    id: "1"
  },
  process.env.JWT_REFRESH_SECRET!,
  {
    expiresIn: "7d"
  }
);

const customToken = generateToken(
  {
    id: "1",
    purpose: "email-verification"
  },
  process.env.JWT_SECRET!,
  {
    expiresIn: "10m",
    issuer: "my-api"
  }
);

const payload = verifyToken(accessToken, process.env.JWT_SECRET!);
const decoded = decodeToken(accessToken);
const tokenFromHeader = extractBearerToken("Bearer eyJhbGciOi...");
```

Use `verifyToken()` for authentication and authorization decisions. Use `decodeToken()` only when you need to inspect token contents without trusting them.

## Password Helper Examples

```ts
import { comparePassword, hashPassword, validatePasswordStrength } from "api-core-auth";

const strength = validatePasswordStrength("Password123", {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumber: true,
  requireSymbol: false
});

if (!strength.valid) {
  throw new Error(strength.errors.join(", "));
}

const passwordHash = await hashPassword("Password123", 12);
const isValidPassword = await comparePassword("Password123", passwordHash);
```

## Express Login Example

The package does not look up users from your database. Your app fetches the user, validates the password, and then uses `api-core-auth` to create tokens.

```js
const express = require("express");
const {
  comparePassword,
  generateAccessToken,
  generateRefreshToken,
  sanitizeUser
} = require("api-core-auth");

const app = express();

app.use(express.json());

app.post("/login", async (req, res) => {
  const user = {
    id: "1",
    email: "admin@example.com",
    password: "$2b$10$hashedPassword",
    role: "ADMIN"
  };

  const isValidPassword = await comparePassword(req.body.password, user.password);

  if (!isValidPassword) {
    return res.status(401).json({
      success: false,
      message: "Invalid email or password"
    });
  }

  const safeUser = sanitizeUser(user);

  const accessToken = generateAccessToken(safeUser, process.env.JWT_SECRET, {
    expiresIn: "15m"
  });

  const refreshToken = generateRefreshToken({ id: user.id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: "7d"
  });

  return res.json({
    success: true,
    message: "Login successful",
    data: {
      user: safeUser,
      accessToken,
      refreshToken
    }
  });
});
```

## Protected Route Example

```ts
import express from "express";
import { authMiddleware } from "api-core-auth";

const app = express();

app.get(
  "/profile",
  authMiddleware({
    secret: process.env.JWT_SECRET!
  }),
  (req, res) => {
    res.json({
      success: true,
      message: "Profile fetched successfully",
      data: req.user
    });
  }
);
```

## Role Middleware Example

```ts
import { authMiddleware, roleMiddleware } from "api-core-auth";

app.get(
  "/admin",
  authMiddleware({
    secret: process.env.JWT_SECRET!
  }),
  roleMiddleware(["ADMIN"]),
  (_req, res) => {
    res.json({
      success: true,
      message: "Admin route accessed successfully"
    });
  }
);
```

`roleMiddleware()` checks `req.user.role` and `req.user.roles`. Access is allowed when at least one required role matches.

## Optional Auth Middleware Example

Use optional auth for routes that work for both guests and logged-in users.

```ts
import { optionalAuthMiddleware } from "api-core-auth";

app.get(
  "/feed",
  optionalAuthMiddleware({
    secret: process.env.JWT_SECRET!
  }),
  (req, res) => {
    res.json({
      success: true,
      data: {
        authenticated: Boolean(req.user),
        user: req.user || null
      }
    });
  }
);
```

## Refresh Token Example

`api-core-auth` can generate and verify refresh tokens, but your app must store and revoke them.

```ts
import { generateRefreshToken, verifyToken } from "api-core-auth";

const refreshToken = generateRefreshToken(
  {
    id: user.id
  },
  process.env.JWT_REFRESH_SECRET!,
  {
    expiresIn: "7d"
  }
);

// Store the refresh token hash in your database if your app needs revocation.

const payload = verifyToken(refreshToken, process.env.JWT_REFRESH_SECRET!);
```

## Error Handling Example

```ts
import { AuthError } from "api-core-auth";

app.use((err, _req, res, _next) => {
  if (err instanceof AuthError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      code: err.code
    });
  }

  return res.status(500).json({
    success: false,
    message: "Internal server error"
  });
});
```

## Utility Examples

```ts
import { createAuthResponse, getAuthUser, sanitizeUser } from "api-core-auth";

const safeUser = sanitizeUser(user);

const response = createAuthResponse({
  user: safeUser,
  accessToken,
  refreshToken,
  message: "Login successful"
});

const currentUser = getAuthUser(req);
```

## API Reference

### `generateToken(payload, secret, options?)`

Signs a JWT payload using `jsonwebtoken`.

### `generateAccessToken(user, secret, options?)`

Signs an access token. Default expiration is `15m`, and you can override it with `options.expiresIn`.

### `generateRefreshToken(user, secret, options?)`

Signs a refresh token. Default expiration is `7d`, and you can override it with `options.expiresIn`.

### `verifyToken(token, secret, options?)`

Verifies a token and returns the decoded payload. Throws `InvalidTokenError` or `TokenExpiredAuthError` for safe API handling.

### `decodeToken(token, options?)`

Decodes token contents without verification. Do not use decoded-only data for authorization decisions.

### `extractBearerToken(authorizationHeader)`

Returns the token from a valid `Bearer <token>` authorization header. Returns `null` for malformed headers.

### `hashPassword(password, saltRounds?)`

Hashes a password with bcryptjs. Default salt rounds: `10`.

### `comparePassword(password, passwordHash)`

Compares a plain password against a bcrypt hash.

### `validatePasswordStrength(password, options?)`

Checks password strength and returns:

```ts
{
  valid: boolean;
  score: number;
  errors: string[];
}
```

### `authMiddleware(options)`

Requires a valid Bearer token and attaches `req.user` and `req.auth`.

### `optionalAuthMiddleware(options)`

Attempts authentication when a token exists. Continues without failing when the token is missing or invalid.

### `roleMiddleware(roles)`

Requires the authenticated user to have at least one matching role.

### `sanitizeUser(user, sensitiveKeys?)`

Removes sensitive fields such as `password`, `passwordHash`, `hashedPassword`, `salt`, and reset tokens.

### `createAuthResponse(options)`

Creates a consistent authentication success response.

### `getAuthUser(req)`

Returns the authenticated request user or throws `UnauthorizedError`.

## TypeScript Support

The package is written in TypeScript and publishes declaration files.

```ts
import type {
  AuthConfig,
  AuthMiddlewareOptions,
  AuthUser,
  JwtPayload,
  Role,
  TokenPair
} from "api-core-auth";
```

Express request augmentation is included, so `req.user` is available after using the middleware.

## Build Output

The package supports both module systems:

- CommonJS: `require("api-core-auth")`
- ESM: `import { authMiddleware } from "api-core-auth"`
- Types: `dist/index.d.ts`

## Security Notes

- Never hardcode JWT secrets.
- Use long, random secrets from environment variables or a secret manager.
- Prefer separate secrets for access tokens and refresh tokens.
- Always set short expiration for access tokens.
- Store refresh tokens in your own database only if your app needs refresh-token sessions.
- Hash refresh tokens before storing them.
- Do not expose password fields in API responses.
- Return generic login errors such as `Invalid email or password`.
- Use HTTPS in production.
- Use `verifyToken()` before trusting token data.
- Avoid returning raw internal errors to API users.

## Development

```bash
npm install
npm run lint
npm run typecheck
npm test
npm run build
```

## npm Publishing

Before publishing, update the package metadata in `package.json`, then run:

```bash
npm publish
```

The `prepublishOnly` script runs linting, type checking, tests, and build.

## Contributing

Contributions are welcome. Please keep this package focused on reusable authentication helpers, middleware, errors, utilities, and types.

See `CONTRIBUTING.md` for contribution details.

## License

MIT License.

Copyright (c) 2026 Choch Kimhour.
