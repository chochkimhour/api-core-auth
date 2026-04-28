# api-core-auth

[![npm](https://img.shields.io/npm/v/api-core-auth?label=npm&color=cb3837)](https://www.npmjs.com/package/api-core-auth)
[![license: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![node](https://img.shields.io/badge/node-%3E%3D18-brightgreen.svg)](package.json)
[![types: included](https://img.shields.io/badge/types-included-0f8fcf.svg)](package.json)

Reusable JWT authentication helpers, password utilities, Express middleware, error classes, and TypeScript types for production Node.js APIs.

## What Is api-core-auth?

`api-core-auth` is a small authentication toolkit for JavaScript and TypeScript backend projects.

It helps you handle the common authentication tasks that many APIs need:

- Create JWT access tokens.
- Create JWT refresh tokens.
- Verify and decode JWT tokens.
- Extract Bearer tokens from request headers.
- Hash and compare passwords with bcrypt.
- Validate password strength.
- Protect Express routes with authentication middleware.
- Restrict routes by user role.
- Remove password fields before returning user objects.
- Use consistent authentication error classes.
- Use strong TypeScript types in your app.

The package is designed for real-world backend APIs, but it stays flexible. It does not force a database, user model, session model, or application structure.

## Why Use It?

Most backend projects need the same authentication tools. `api-core-auth` keeps those parts clean, reusable, and easy to understand.

Use it when you want:

- A simple auth foundation for Node.js APIs.
- JavaScript and TypeScript support.
- CommonJS `require()` support.
- ES module `import` support.
- Ready-to-use Express middleware.
- Framework-independent JWT and password helpers.
- Safe package error classes.
- TypeScript types included.
- No database lock-in.
- No hidden user-management logic.

## What This Package Does

`api-core-auth` provides reusable authentication helpers only.

It can:

- Generate access tokens.
- Generate refresh tokens.
- Verify tokens.
- Decode tokens.
- Parse Bearer tokens.
- Hash passwords.
- Compare passwords.
- Validate password strength.
- Add authenticated users to Express requests.
- Check roles in Express routes.
- Sanitize user objects.
- Create auth response objects.
- Throw safe authentication errors.

## What This Package Does Not Do

This package intentionally does not own your application logic.

It does **not**:

- Connect to a database.
- Register users.
- Find users by email.
- Validate login credentials from a database.
- Store refresh tokens.
- Rotate refresh tokens.
- Revoke refresh tokens.
- Decide your user schema.
- Manage sessions for you.

Your application is responsible for:

- User registration.
- User lookup.
- Password validation flow.
- Database queries.
- Refresh-token storage.
- Refresh-token revocation.
- Secret management.
- Application-specific authorization rules.

This keeps the package clean, predictable, and useful across many projects.

## Installation

```bash
npm install api-core-auth
```

If you want to use the Express middleware, install Express in your application:

```bash
npm install express
```

## Quick Start

```js
const express = require("express");
const {
  comparePassword,
  generateAccessToken,
  authMiddleware,
  roleMiddleware
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

  const accessToken = generateAccessToken(
    {
      id: user.id,
      email: user.email,
      role: user.role
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "15m"
    }
  );

  return res.json({
    success: true,
    message: "Login successful",
    data: {
      accessToken
    }
  });
});

app.get(
  "/profile",
  authMiddleware({
    secret: process.env.JWT_SECRET
  }),
  (req, res) => {
    res.json({
      success: true,
      data: req.user
    });
  }
);

app.get(
  "/admin",
  authMiddleware({
    secret: process.env.JWT_SECRET
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

## Environment Variables

Keep secrets outside your source code.

```env
JWT_SECRET=replace-with-a-long-random-secret
JWT_REFRESH_SECRET=replace-with-another-long-random-secret
```

Recommended usage:

- Use a long random secret.
- Use different secrets for access tokens and refresh tokens when possible.
- Keep access-token expiration short.
- Store secrets in your environment or secret manager.

## Framework Compatibility

`api-core-auth` works with any Node.js backend through its framework-independent helpers.

Ready-to-use middleware is included for:

- Express.js
- Express-compatible frameworks
- NestJS projects using the Express adapter

The core helpers can be used with:

- Fastify
- Koa
- Hapi
- Next.js API routes
- Nuxt/Nitro server routes
- AdonisJS
- Native Node.js HTTP servers
- Custom Node.js backends

For non-Express frameworks, use helpers such as `verifyToken()`, `extractBearerToken()`, `hashPassword()`, and `comparePassword()` inside your own middleware, hook, guard, or request handler.

## Features

### JWT Helpers

| Function | Purpose |
| --- | --- |
| `generateAccessToken()` | Create a JWT access token. |
| `generateRefreshToken()` | Create a JWT refresh token. |
| `generateToken()` | Create a custom JWT token. |
| `verifyToken()` | Verify a token and return its payload. |
| `decodeToken()` | Decode a token without verifying it. |
| `extractBearerToken()` | Extract a token from a Bearer authorization header. |

### Password Helpers

| Function | Purpose |
| --- | --- |
| `hashPassword()` | Hash a password with bcryptjs. |
| `comparePassword()` | Compare a plain password with a hash. |
| `validatePasswordStrength()` | Validate password strength rules. |

### Express Middleware

| Function | Purpose |
| --- | --- |
| `authMiddleware()` | Require a valid JWT and attach `req.user`. |
| `optionalAuthMiddleware()` | Attach `req.user` when a valid token exists, but allow guests. |
| `roleMiddleware()` | Require one or more allowed roles. |

### Utilities

| Function | Purpose |
| --- | --- |
| `sanitizeUser()` | Remove sensitive fields from a user object. |
| `createAuthResponse()` | Create a consistent auth success response. |
| `getAuthUser()` | Read `req.user` or throw `UnauthorizedError`. |

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

## JWT Examples

### Generate an Access Token

```ts
import { generateAccessToken } from "api-core-auth";

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
```

### Generate a Refresh Token

```ts
import { generateRefreshToken } from "api-core-auth";

const refreshToken = generateRefreshToken(
  {
    id: "1"
  },
  process.env.JWT_REFRESH_SECRET!,
  {
    expiresIn: "7d"
  }
);
```

Your application should store, rotate, and revoke refresh tokens if your auth flow needs refresh-token sessions.

### Verify a Token

```ts
import { verifyToken } from "api-core-auth";

const payload = verifyToken(accessToken, process.env.JWT_SECRET!);
```

### Decode a Token

```ts
import { decodeToken } from "api-core-auth";

const decoded = decodeToken(accessToken);
```

Use `decodeToken()` only for inspection. Do not use decoded-only data for authentication or authorization.

### Extract a Bearer Token

```ts
import { extractBearerToken } from "api-core-auth";

const token = extractBearerToken("Bearer eyJhbGciOi...");
```

## Password Examples

### Hash a Password

```ts
import { hashPassword } from "api-core-auth";

const passwordHash = await hashPassword("Password123", 12);
```

### Compare a Password

```ts
import { comparePassword } from "api-core-auth";

const isValidPassword = await comparePassword("Password123", passwordHash);
```

### Validate Password Strength

```ts
import { validatePasswordStrength } from "api-core-auth";

const result = validatePasswordStrength("Password123", {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumber: true,
  requireSymbol: false
});

if (!result.valid) {
  console.log(result.errors);
}
```

## Express Examples

### Login Route

Your app fetches the user from your database. Then `api-core-auth` helps compare the password and create tokens.

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

### Protected Route

```ts
import { authMiddleware } from "api-core-auth";

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

### Role-Protected Route

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

`roleMiddleware()` checks both `req.user.role` and `req.user.roles`.

### Optional Authentication

Use optional authentication for routes that support both guests and signed-in users.

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

## Utility Examples

### Sanitize a User

```ts
import { sanitizeUser } from "api-core-auth";

const safeUser = sanitizeUser({
  id: "1",
  email: "admin@example.com",
  password: "secret",
  role: "ADMIN"
});
```

### Create an Auth Response

```ts
import { createAuthResponse } from "api-core-auth";

const response = createAuthResponse({
  user: safeUser,
  accessToken,
  refreshToken,
  message: "Login successful"
});
```

### Get the Authenticated User

```ts
import { getAuthUser } from "api-core-auth";

const currentUser = getAuthUser(req);
```

## Error Handling

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

## API Reference

### JWT

| API | Description |
| --- | --- |
| `generateToken(payload, secret, options?)` | Signs a custom JWT payload. |
| `generateAccessToken(user, secret, options?)` | Signs an access token. Default expiration is `15m`. |
| `generateRefreshToken(user, secret, options?)` | Signs a refresh token. Default expiration is `7d`. |
| `verifyToken(token, secret, options?)` | Verifies a token and returns the payload. |
| `decodeToken(token, options?)` | Decodes a token without verifying it. |
| `extractBearerToken(header)` | Returns a token from a valid Bearer header or `null`. |

### Password

| API | Description |
| --- | --- |
| `hashPassword(password, saltRounds?)` | Hashes a password. Default salt rounds: `10`. |
| `comparePassword(password, passwordHash)` | Compares a password with a bcrypt hash. |
| `validatePasswordStrength(password, options?)` | Returns password strength status, score, and errors. |

### Middleware

| API | Description |
| --- | --- |
| `authMiddleware(options)` | Requires a valid token and attaches `req.user`. |
| `optionalAuthMiddleware(options)` | Allows guests and attaches `req.user` when a valid token exists. |
| `roleMiddleware(roles)` | Requires the authenticated user to have an allowed role. |

### Utilities

| API | Description |
| --- | --- |
| `sanitizeUser(user, sensitiveKeys?)` | Removes sensitive fields from user objects. |
| `createAuthResponse(options)` | Creates a consistent auth success response. |
| `getAuthUser(req)` | Returns `req.user` or throws `UnauthorizedError`. |

## TypeScript Support

The package includes TypeScript types for safer application code.

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

## Security Notes

- Never hardcode JWT secrets.
- Use long, random secrets from environment variables or a secret manager.
- Prefer separate secrets for access tokens and refresh tokens.
- Keep access-token expiration short.
- Store refresh tokens in your own database if your app uses refresh-token sessions.
- Hash refresh tokens before storing them.
- Never return password fields in API responses.
- Return generic login errors such as `Invalid email or password`.
- Use HTTPS in production.
- Use `verifyToken()` before trusting token data.
- Do not use `decodeToken()` for authorization.
- Avoid returning raw internal errors to API users.

## Contributing

Contributions are welcome. Please keep this package focused on reusable authentication helpers, middleware, errors, utilities, and types.

See `CONTRIBUTING.md` for contribution details.

## License

MIT License.

Copyright (c) 2026 Choch Kimhour.
