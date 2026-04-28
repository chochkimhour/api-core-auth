# api-core-auth

![npm version](https://img.shields.io/npm/v/api-core-auth?style=flat-square)
![license](https://img.shields.io/npm/l/api-core-auth?style=flat-square)
![npm downloads](https://img.shields.io/npm/dm/api-core-auth?style=flat-square)
![dependencies](https://img.shields.io/badge/dependencies-bcryptjs-brightgreen?style=flat-square)
![types](https://img.shields.io/badge/types-TypeScript-blue?style=flat-square)
![node](https://img.shields.io/badge/node-%3E%3D18-brightgreen?style=flat-square)
[![source](https://img.shields.io/badge/source-GitHub-black?style=flat-square)](https://github.com/chochkimhour/api-core-auth)

Secure opaque-token authentication helpers, password utilities, Express middleware, error classes, and TypeScript types for production Node.js APIs.

`api-core-auth` is a small authentication toolkit for JavaScript and TypeScript backend projects.

It uses **opaque tokens** instead of readable token payloads. An opaque token is a secure random string. It does not contain user data, roles, emails, or private information inside the token.

That makes the package simple and safe:

- Users cannot decode the token and read hidden data.
- Your server stays in control of token validation.
- Tokens can be revoked by removing or disabling the stored token hash.
- Only token hashes need to be stored in your database.
- The package does not connect to your database or force a user model.

## Why Opaque Tokens?

Opaque tokens are a strong default for applications that want users and teams to feel safe.

Use opaque tokens for:

- Login sessions
- API authentication
- Refresh tokens
- Password reset links
- Email verification links
- Invitation links
- API keys

The token sent to the client is random and unreadable. The server stores a hash of that token and compares it when the token is used again.

```txt
Client receives raw token
Server stores token hash
Client sends raw token in Authorization header
Server hashes and compares it with stored hash
```

## What This Package Does

`api-core-auth` provides reusable authentication helpers:

- Generate secure opaque tokens.
- Hash opaque tokens before storage.
- Compare opaque tokens with stored hashes.
- Extract Bearer tokens from request headers.
- Hash passwords with bcrypt.
- Compare passwords with bcrypt.
- Validate password strength.
- Protect Express routes.
- Support optional authentication.
- Restrict routes by role.
- Sanitize user objects.
- Create consistent auth responses.
- Provide safe authentication error classes.
- Provide TypeScript types.

## What This Package Does Not Do

This package intentionally does not own your application logic.

It does **not**:

- Connect to a database.
- Register users.
- Find users by email.
- Validate login credentials from a database.
- Store tokens for you.
- Revoke tokens for you.
- Decide your user schema.
- Manage sessions for you.

Your application is responsible for:

- Creating the first admin user.
- User registration.
- User lookup.
- Database queries.
- Storing token hashes.
- Token expiration policy.
- Token revocation.
- Application-specific authorization rules.

This keeps the package secure, flexible, and easy to use in different backend projects.

## Recommended Application Flow

`api-core-auth` should be used inside your application auth flow. It should not run by itself, create users, or create a default admin account.

The recommended flow is:

```txt
1. Create or seed a user in your application
2. Hash the user's password with hashPassword()
3. Store the user and password hash in your database
4. On login, find the user from your database
5. Compare the submitted password with comparePassword()
6. Create an opaque token with createOpaqueToken()
7. Store only tokenHash in your database
8. Send token to the client
9. Protect routes with authMiddleware()
10. Revoke access by deleting or disabling the stored token hash
```

### Admin User Flow

For production apps, create the first admin user in your own application.

Good options:

- Database seed script
- Secure setup command
- Private admin invite flow
- Manual admin creation from an internal tool

Avoid auto-creating an admin user inside an npm package. A reusable package should not secretly create users, choose default credentials, or control your database.

Example admin setup flow:

```txt
First app setup
→ your app creates admin@example.com
→ your app stores the hashed password
→ admin logs in
→ api-core-auth creates an opaque token
→ your app stores the token hash
→ admin uses the raw token to access protected routes
```

### Register Flow

```ts
import { hashPassword, sanitizeUser } from "api-core-auth";

const passwordHash = await hashPassword(req.body.password, 12);

const user = await db.users.create({
  data: {
    email: req.body.email,
    password: passwordHash,
    role: "USER"
  }
});

return res.status(201).json({
  success: true,
  message: "User registered successfully",
  data: {
    user: sanitizeUser(user)
  }
});
```

### Login Flow

```ts
import { comparePassword, createOpaqueToken, sanitizeUser } from "api-core-auth";

const user = await db.users.findUnique({
  where: {
    email: req.body.email
  }
});

if (!user) {
  return res.status(401).json({
    success: false,
    message: "Invalid email or password"
  });
}

const isValidPassword = await comparePassword(req.body.password, user.password);

if (!isValidPassword) {
  return res.status(401).json({
    success: false,
    message: "Invalid email or password"
  });
}

const authToken = createOpaqueToken({
  pepper: process.env.OPAQUE_TOKEN
});

await db.sessions.create({
  data: {
    userId: user.id,
    tokenHash: authToken.tokenHash,
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7)
  }
});

return res.json({
  success: true,
  message: "Login successful",
  data: {
    user: sanitizeUser(user),
    token: authToken.token
  }
});
```

### Protected Route Flow

```ts
import { authMiddleware, hashOpaqueToken } from "api-core-auth";

app.get(
  "/profile",
  authMiddleware({
    verifyToken: async (token) => {
      const tokenHash = hashOpaqueToken(token, process.env.OPAQUE_TOKEN);

      const session = await db.sessions.findUnique({
        where: {
          tokenHash
        },
        include: {
          user: true
        }
      });

      if (!session || session.expiresAt < new Date()) {
        return null;
      }

      return session.user;
    }
  }),
  (req, res) => {
    res.json({
      success: true,
      data: req.user
    });
  }
);
```

### Logout Flow

```ts
import { hashOpaqueToken } from "api-core-auth";

const tokenHash = hashOpaqueToken(tokenFromRequest, process.env.OPAQUE_TOKEN);

await db.sessions.delete({
  where: {
    tokenHash
  }
});

return res.json({
  success: true,
  message: "Logged out successfully"
});
```

## Installation

```bash
npm install api-core-auth
```

If you want to use the Express middleware, install Express in your application:

```bash
npm install express
```

## Environment Variables

Use a server-side pepper when hashing opaque tokens. Keep it secret.

```env
OPAQUE_TOKEN=replace-with-a-long-random-server-side-secret
```

The pepper is optional, but recommended. It adds an extra server-side secret to token hashing.

## Quick Start

This example uses an in-memory `Map` to keep the example simple. In a real application, store token hashes in your database.

```js
const express = require("express");
const {
  authMiddleware,
  compareOpaqueToken,
  comparePassword,
  createOpaqueToken,
  roleMiddleware,
  sanitizeUser
} = require("api-core-auth");

const app = express();
const opaqueTokenSecret = process.env.OPAQUE_TOKEN;
const tokenStore = new Map();

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
  const authToken = createOpaqueToken({
    pepper: opaqueTokenSecret
  });

  tokenStore.set(user.id, {
    tokenHash: authToken.tokenHash,
    user: safeUser
  });

  return res.json({
    success: true,
    message: "Login successful",
    data: {
      user: safeUser,
      token: authToken.token
    }
  });
});

const verifyStoredToken = (token) => {
  for (const session of tokenStore.values()) {
    if (compareOpaqueToken(token, session.tokenHash, opaqueTokenSecret)) {
      return session.user;
    }
  }

  return null;
};

app.get(
  "/profile",
  authMiddleware({
    verifyToken: verifyStoredToken
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
    verifyToken: verifyStoredToken
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

## Example Login Response

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "1",
      "email": "admin@example.com",
      "role": "ADMIN"
    },
    "token": "N03tY5gO9B4oPz0V6xJhO3dYb-4QmYQ9u0zV2S3xZ3M"
  }
}
```

The response sends the raw token once. Store only the token hash on the server.

## JavaScript Usage

```js
const {
  createOpaqueToken,
  compareOpaqueToken,
  hashPassword,
  comparePassword,
  authMiddleware,
  roleMiddleware
} = require("api-core-auth");
```

## TypeScript Usage

```ts
import {
  createOpaqueToken,
  compareOpaqueToken,
  hashPassword,
  comparePassword,
  authMiddleware,
  roleMiddleware,
  type AuthUser
} from "api-core-auth";
```

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

For non-Express frameworks, use `extractBearerToken()`, `compareOpaqueToken()`, `hashPassword()`, and `comparePassword()` inside your own middleware, hook, guard, or request handler.

## Features

### Opaque Token Helpers

| Function | Purpose |
| --- | --- |
| `generateOpaqueToken()` | Create a secure random token with no readable payload. |
| `hashOpaqueToken()` | Hash an opaque token before storing it. |
| `compareOpaqueToken()` | Compare a raw opaque token with a stored hash. |
| `createOpaqueToken()` | Create a raw opaque token and storage-safe hash together. |
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
| `authMiddleware()` | Require a valid opaque token and attach `req.user`. |
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
- `TokenPair`
- `AuthMiddlewareOptions`
- `Role`

## Opaque Token Examples

### Create a Token

```ts
import { createOpaqueToken } from "api-core-auth";

const authToken = createOpaqueToken({
  byteLength: 32,
  pepper: process.env.OPAQUE_TOKEN
});

// Send authToken.token to the client.
// Store authToken.tokenHash in your database.
```

### Verify a Token

```ts
import { compareOpaqueToken } from "api-core-auth";

const isValidToken = compareOpaqueToken(
  tokenFromRequest,
  storedTokenHash,
  process.env.OPAQUE_TOKEN
);
```

### Extract a Bearer Token

```ts
import { extractBearerToken } from "api-core-auth";

const token = extractBearerToken(req.headers.authorization);
```

### Password Reset Token

```ts
import { createOpaqueToken } from "api-core-auth";

const resetToken = createOpaqueToken({
  byteLength: 32,
  pepper: process.env.OPAQUE_TOKEN
});

// Email resetToken.token to the user.
// Store resetToken.tokenHash with an expiration date in your database.
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

## Express Middleware

### Required Auth

`authMiddleware()` requires a valid token. Your application provides `verifyToken`, which checks the raw token against your stored token hash and returns the authenticated user.

```ts
import { authMiddleware, hashOpaqueToken } from "api-core-auth";

app.get(
  "/profile",
  authMiddleware({
    verifyToken: async (token) => {
      const tokenHash = hashOpaqueToken(token, process.env.OPAQUE_TOKEN);
      const session = await db.sessions.findUnique({
        where: {
          tokenHash
        },
        include: {
          user: true
        }
      });

      if (!session) {
        return null;
      }

      return session.user;
    }
  }),
  (req, res) => {
    res.json({
      success: true,
      data: req.user
    });
  }
);
```

### Optional Auth

Use optional authentication for routes that support both guests and signed-in users.

```ts
import { optionalAuthMiddleware } from "api-core-auth";

app.get(
  "/feed",
  optionalAuthMiddleware({
    verifyToken: verifyStoredToken
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

### Role-Protected Route

```ts
import { authMiddleware, roleMiddleware } from "api-core-auth";

app.get(
  "/admin",
  authMiddleware({
    verifyToken: verifyStoredToken
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
  token: authToken.token,
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

### Opaque Tokens

| API | Description |
| --- | --- |
| `generateOpaqueToken(options?)` | Creates a secure random token with no readable payload. |
| `hashOpaqueToken(token, pepper?)` | Creates a SHA-256 hash for database storage. |
| `compareOpaqueToken(token, tokenHash, pepper?)` | Compares a raw token with a stored hash using constant-time comparison. |
| `createOpaqueToken(options?)` | Returns `{ token, tokenHash }` for send-and-store flows. |
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
import type { AuthMiddlewareOptions, AuthUser, Role, TokenPair } from "api-core-auth";
```

Express request augmentation is included, so `req.user` is available after using the middleware.

## Security Notes

- Opaque tokens do not contain readable user data.
- Store only token hashes in your database.
- Send the raw token to the client only once.
- Use a server-side pepper when possible.
- Add expiration dates to stored tokens.
- Revoke tokens by deleting or disabling their stored hash.
- Never return password fields in API responses.
- Return generic login errors such as `Invalid email or password`.
- Use HTTPS in production.
- Avoid returning raw internal errors to API users.
- Keep database lookup and token storage inside your application.

## Contributing

Contributions are welcome. Please keep this package focused on reusable authentication helpers, middleware, errors, utilities, and types.

See `CONTRIBUTING.md` for contribution details.

## License

MIT License.

Copyright (c) 2026 Choch Kimhour.
