# Task Management System

A Java 21/Spring Boot backend for managing a user's projects and tasks. It provides session-backed JWT authentication, owner-isolated REST APIs, dashboard statistics, versioned PostgreSQL migrations, and interactive OpenAPI documentation.

Deployment target: **React on Vercel ? Spring Boot on Render ? Supabase PostgreSQL Session Pooler**. The backend is implemented; the React frontend and live deployment are not. The original internship brief is preserved in [docs/assignment.md](docs/assignment.md).

## Technology stack

Java 21 ? Spring Boot 3.5.16 ? Maven ? Spring Web/Validation ? Spring Data JPA/Hibernate ? Spring Security/BCrypt ? signed HS256 JWTs ? PostgreSQL/Supabase ? Flyway ? Lombok ? springdoc-openapi 2.10.1 ? JUnit 5/Mockito ? Testcontainers PostgreSQL ? multi-stage Docker.

## Implemented features

- Normalized-email registration/login, BCrypt passwords, current-user endpoint and session-specific logout/revocation. Only hashed session tokens are persisted.
- Owned project CRUD and archive; task CRUD/status changes/moves, case-insensitive title search, status/priority filters, bounded pagination and validated sorting.
- Database-managed completion/update timestamps, integrity constraints, cascading task deletion and archived-project task-write protection.
- Dashboard status totals/completion percentage, upcoming/overdue task pages and optional owned-project filtering.
- Backend ownership predicates plus forced RLS with transaction-scoped identity. Foreign resources return 404; unauthenticated requests return 401.
- Shared error DTOs, environment-configured CORS, Swagger UI, unit/integration tests, Java 21 Docker packaging and deployment instructions.

## Not implemented

React/Vercel frontend and Kanban UI, refresh tokens (login is required after access-token expiry), password reset/email verification, team sharing/roles, background notifications, bulk task operations, production rate-limit infrastructure, CI/CD automation, or live Render/Supabase/Vercel deployment. Docker/Testcontainers execution requires Docker and has not been verified on this workstation because its daemon is unavailable.

## Local setup

1. Install JDK 21 and set JAVA_HOME. Maven Wrapper is included; Docker is optional for container tests.
2. Copy `backend/.env.example` to a private local environment file and replace placeholders.
3. Export those variables into the launching process or use your IDE's environment configuration. Spring Boot **does not automatically load .env files**. Never commit them.
4. Provide a disposable/local PostgreSQL database or a separately authorized development Supabase database. Migrations need DDL permissions; use the separate migration procedure for production.
5. From `backend/`, run:

```bash
./mvnw spring-boot:run
```

PowerShell: `.\mvnw.cmd spring-boot:run`. Verify `http://localhost:8080/api/health` (adjust for PORT).

Missing DB variables, an unreachable database or invalid credentials prevent startup. Invalid JWT key/lifetime settings also fail startup. There is no fallback database or embedded production credential.

Generate a new Base64 key locally, for example:

```bash
openssl rand -base64 32
```

Store its output privately as JWT_SECRET; do not reuse any test signing key. Password/token values should never be placed in URLs or logs.

## Environment variables

| Variable | Purpose/default |
| --- | --- |
| `PORT` | HTTP port; local default 8080, use Render's supplied value in deployment. Bound on 0.0.0.0. |
| `DB_URL` | Required JDBC URL, e.g. `jdbc:postgresql://YOUR_SESSION_POOLER_HOST:5432/postgres?sslmode=require`. No credentials in URL. |
| `DB_USERNAME`, `DB_PASSWORD` | Required runtime database role credentials. On the Supabase pooler use the role/project-ref username shown by Connect. |
| `DB_POOL_SIZE` | Maximum connections per instance; default 5, minimum idle 1. Budget against Supabase limits. |
| `FRONTEND_URL` | One exact CORS origin; default http://localhost:3000. Example file uses React/Vite localhost:5173. Production: the actual Vercel/custom-domain origin, no trailing slash. |
| `JWT_SECRET` | Required Base64 random key, at least 32 decoded bytes. |
| `JWT_EXPIRATION` | Milliseconds, default 900000; allowed 60000?3600000. |
| `FLYWAY_ENABLED` | Local startup migrations default true. Set false on production web instances after separate migration. |
| `FLYWAY_DB_URL`, `FLYWAY_DB_USERNAME`, `FLYWAY_DB_PASSWORD` | Separate migration role. The migration-only command requires all three; local startup Flyway falls back to DB variables if absent. |
| `DASHBOARD_TIME_ZONE` | Calendar-date boundary zone; default UTC, e.g. Asia/Ho_Chi_Minh. |
| `API_DOCS_ENABLED` | Enables OpenAPI/Swagger UI; default true. Can disable publicly in production. |
| `JAVA_TOOL_OPTIONS` | Optional JVM tuning; Docker defaults to MaxRAMPercentage=65.0. Keep secrets out of JVM arguments. |

SSL: use Session Pooler **5432**, not transaction pooler 6543. `sslmode=require` encrypts the connection; `verify-full` with the Supabase CA verifies the server/hostname. See [deployment instructions](backend/docs/deployment.md) for exact connection and certificate setup.

## Database migrations and ownership

Migrations live in `backend/src/main/resources/db/migration`:

- V1: users, sessions, projects and tasks, UUIDs, native enums, constraints/indexes, timestamp/completion triggers, forced ownership RLS.
- V2: transaction-local, exact-email SELECT policy for the trusted backend's password-verification bootstrap.

Hibernate stays `ddl-auto=validate`; SQL auto-initialization and Flyway clean are disabled. No demo accounts/seed data run at startup. The optional local seed script requires an existing development user and is outside Flyway locations.

Never edit applied migrations or enable automatic baselining for an existing Supabase schema. Inspect existing objects first. Forced RLS does not protect against superuser/BYPASSRLS roles or a backend that sets unverified identity; the runtime must be a dedicated nonowner role with only needed DML grants. Services derive identity from the verified JWT inside each transaction.

For production, migrate before starting the web release using the dedicated migration role, then grant runtime access and set FLYWAY_ENABLED=false. The image's migration-only command is:

```text
java -Dloader.main=backend.config.DatabaseMigration -cp /app/app.jar org.springframework.boot.loader.launch.PropertiesLauncher
```

Full permissions, first-run grants and adoption restrictions: [database design](backend/docs/database-design.md) and [deployment procedure](backend/docs/deployment.md).

## API documentation

- Health: `GET /api/health` is public liveness (not a continuous database readiness probe).
- Swagger UI: `/swagger-ui.html`; OpenAPI JSON: `/v3/api-docs` when enabled.
- Register/login are public POSTs; `/api/auth/me`, logout and business APIs require an active session-backed Bearer JWT.
- Use Swagger Authorize with the accessToken only. Logout invalidates that session's JWT; other sessions remain active. No refresh endpoint is implemented.
- CORS accepts the configured origin and explicit bearer headers; cookies, HTTP Basic and form login are not authentication mechanisms.

Contracts: [authentication](backend/docs/authentication.md), [projects](backend/docs/projects.md), [tasks](backend/docs/tasks.md), [dashboard](backend/docs/dashboard.md), [OpenAPI/testing](backend/docs/api-documentation-and-tests.md).

## Testing and build

From `backend/`:

```bash
./mvnw clean verify
```

This compiles, tests and packages the executable JAR in `target/`. Database tests prefer a new Testcontainers PostgreSQL instance when Docker is available. If Docker and an isolated local override are both unavailable, integration tests skip; a successful Maven exit alone does not mean those tests executed.

Windows fallback using installed local PostgreSQL binaries:

```powershell
.\scripts\Test-Postgres.ps1
```

It creates/stops a disposable loopback cluster and runs all tests without production DB variables or .env files. Only the exact loopback task2_test URL is accepted as an explicit test override. Fixtures truncate disposable data; do not redirect/tunnel tests to production. Tests cover auth/session revocation, ownership/RLS, validation/errors, CRUD/search/filters, date boundaries/query counts, OpenAPI and V1?V2 data-preserving upgrade. See [test setup/results](backend/docs/api-documentation-and-tests.md).

Docker build from repository root:

```bash
docker build -t task-management-backend ./backend
docker run --rm --env-file backend/.env -p 8080:8080 task-management-backend
```

Unlike Spring Boot itself, Docker's --env-file explicitly loads the file. Use PORT=8080 for this mapping, and a database reachable from inside the container (localhost refers to the container). Tests run separately; image builds contain only main sources and do not connect to any database. The runtime is a nonroot Java 21 JRE. `.dockerignore` excludes environment files, Git data, tests, build outputs and key files.

## Render / Supabase / Vercel deployment

1. Review and commit/push changes yourself; no deployment is performed by this task.
2. Provision Supabase roles and use its Session Pooler with TLS. Apply migrations in a separately authorized release job, or a Render pre-deploy command where supported, then grant runtime access.
3. Create a Render Docker Web Service: Root Directory `backend`, Dockerfile `./Dockerfile`, build context `.`, image CMD unchanged, health path `/api/health`. Set Auto-Deploy Off for the first controlled deployment.
4. Add runtime DB variables, JWT_SECRET, JWT_EXPIRATION, FRONTEND_URL and FLYWAY_ENABLED=false in Render's secret/environment settings. Keep migration credentials in the release job where possible. Use Render's PORT and inspect startup/schema validation before routing traffic.
5. For a future React/Vite frontend on Vercel, set only a public API URL such as VITE_API_BASE_URL to the Render HTTPS origin; rebuild after changing it. Never ship DB/JWT secrets to client variables. Set Render FRONTEND_URL to the actual frontend origin.
6. After explicit deployment authorization, verify health, unauthenticated 401s, auth/logout, owned CRUD/dashboard and CORS from the frontend.

See [detailed deployment instructions](backend/docs/deployment.md) for paid-plan pre-deploy limitations, migration-only invocation, SSL/CA handling, runtime privileges, rollback considerations and troubleshooting.

## Source layout

`backend/src/main/java/backend` contains config, controller, service, repository, entity, dto, security, exception, mapper and enums layers. Supporting resources/migrations are under src/main/resources; tests use src/test. The original assignment is retained separately; implementation documentation is under backend/docs.

## Delivery status

Tasks 1?8 are implemented and documented. Build/test results and deployment limitations are recorded in the backend deployment documentation. No production Supabase connection, Git push or deployment has been performed. Docker image execution remains to be verified on a Docker-enabled machine.
