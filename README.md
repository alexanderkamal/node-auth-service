# Node Auth Service

This project is just for learning purposes 

A small, self-contained REST API for user authentication, built as a hands-on learning project to practice backend architecture patterns that are hard to internalize from tutorials alone — layered design, centralized error handling, and structured logging.

This isn't a tutorial clone. It's a sandbox where I deliberately built (and rebuilt) pieces of a "real" backend to understand *why* production code is structured the way it is, not just *how* to make endpoints work.

## Features

- **User registration & login** with hashed passwords (bcrypt)
- **JWT-based auth** — short-lived access tokens + longer-lived refresh tokens, with a `/refresh` endpoint to rotate them
- **Centralized error handling** via a custom `AppError` class, distinguishing operational errors (e.g. "user already exists") from unexpected programmer errors
- **Structured JSON logging** through a singleton `Logger`, with every request tagged by a correlation ID for traceability
- **Correlation ID middleware** — every request gets a UUID, returned in the `X-Correlation-ID` response header, so a single request can be traced across logs
- **Prisma ORM + PostgreSQL** for the data layer, replacing an earlier in-memory array store

## Architecture

The project follows a layered structure to keep concerns separated and code testable in isolation:

```
Request → Router → Controller → Service → Repository → Database
                        ↓
                  Error Handler (centralized)
```

- **Routes** (`routes.js`) — map HTTP verbs/paths to controllers, nothing else
- **Controllers** (`controllers/`) — parse the request, call the service, shape the HTTP response, forward errors via `next(error)`
- **Services** (`services/`) — business logic (hashing, token creation, validation rules) with no knowledge of HTTP
- **Repositories** (`repositories/`) — the only layer that talks to the database (via Prisma)
- **Common** (`common/`) — cross-cutting concerns shared across features: error types, the error-handling middleware, the logger, and the correlation ID middleware

```
src/
├── app/
│   └── user/
│       ├── controllers/    # HTTP layer
│       ├── services/       # business logic
│       ├── repositories/   # data access (Prisma)
│       ├── utils/          # jwt.js, hash.js
│       ├── errors.js       # domain-specific error instances
│       └── routes.js
├── common/
│   ├── error/               # AppError class + global error handler
│   ├── logger/               # structured JSON logger (singleton)
│   ├── correlation/          # correlation ID middleware
│   └── db/                   # Prisma client instance
└── server.js
```

## What I learned building this

- **Why layering matters in practice, not just in theory.** Keeping controllers "dumb" (HTTP in, HTTP out) and pushing logic into services made it obvious when I was accidentally mixing concerns — e.g. an early version had password comparison logic inside the controller.
- **Operational vs. programmer errors.** Wrapping expected failures (like "email already registered") in a custom `AppError` with a status code, versus letting truly unexpected errors fall through to a generic 500, forced me to think about what a client should ever see versus what should only ever hit the logs.
- **Correlation IDs are cheap and powerful.** Tagging every request with a UUID and threading it through every log line makes it trivial to reconstruct what happened during a single request — even with nothing more than `console.log`, this starts to feel like real observability.
- **The value (and friction) of an ORM.** Moving from a plain in-memory array to Prisma made me appreciate schema migrations and type-safe queries, but also taught me to be deliberate about what the generated client outputs (it's large — see note below) and why `.env`-based connection strings shouldn't be committed.
- **Refresh token flows are easy to get subtly wrong.** Implementing separate secrets and expiry windows for access vs. refresh tokens made the security trade-offs (short-lived vs. long-lived credentials) concrete instead of abstract.

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express 5
- **ORM / DB:** Prisma + PostgreSQL
- **Auth:** jsonwebtoken, bcrypt
- **Other:** uuid (correlation IDs), dotenv

## Getting Started

### Prerequisites
- Node.js
- A PostgreSQL database (connection string for `DATABASE_URL`)

### Setup

```bash
git clone <repo-url>
cd node-auth-service
npm install
```

Create a `.env` file in the root:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"
ACCESS_SECRET="your-access-token-secret"
REFRESH_SECRET="your-refresh-token-secret"
```

Run migrations and generate the Prisma client:

```bash
npx prisma migrate dev
npx prisma generate
```

Start the server:

```bash
node src/server.js
```

The server runs on `http://localhost:8000`.

### API Endpoints

| Method | Endpoint         | Description                          |
|--------|------------------|---------------------------------------|
| POST   | `/users/register`| Register a new user                  |
| POST   | `/users/login`    | Log in, receive access + refresh tokens |
| GET    | `/users/me`       | Get current user (requires access token) |
| POST   | `/users/refresh`  | Exchange a refresh token for a new access token |

## Notes

- This is a learning project, not a production system — there's no input validation library, no rate limiting, and no tests yet. Those are natural next steps.
- `src/generated/prisma` is excluded from version control and regenerated locally via `npx prisma generate`.

## Possible Next Steps

- Add request validation (e.g. Zod or Joi)
- Add automated tests (unit tests for services, integration tests for endpoints)
- Add rate limiting on `/login` and `/register`
- Dockerize the app for easier local setup
