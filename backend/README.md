# Backend foundation

Java 21, Spring Boot 3.5.16, Maven, PostgreSQL, and Flyway.

## Local setup

1. Install JDK 21 and set `JAVA_HOME` to that installation.
2. Copy `.env.example` to `.env` and replace the placeholders locally.
3. Export those values into the process environment, or configure them in your IDE's run configuration. Spring Boot does **not** automatically load `.env` files.
4. From `backend/`, run `./mvnw spring-boot:run` (PowerShell: `.\mvnw.cmd spring-boot:run`).

Required for database startup: `DB_URL`, `DB_USERNAME`, and `DB_PASSWORD`.
Use a JDBC URL such as `jdbc:postgresql://YOUR_SUPABASE_HOST:5432/postgres?sslmode=require`.
Use the host, port, and username from your Supabase connection settings; use a direct connection or session pooler suitable for JDBC and migrations.
Do not put credentials in the URL or source code.

`PORT` defaults to `8080`. `FRONTEND_URL` is one exact frontend origin (scheme, host, and optional port, without a path or trailing slash); it defaults to `http://localhost:3000`.
`JWT_SECRET` is required Base64-encoded random key material (at least 32 decoded bytes). `JWT_EXPIRATION` defaults to `900000` milliseconds and accepts 1 minute to 1 hour. See [authentication](docs/authentication.md) for the full API/session contract and secure configuration.

Missing database variables cause datasource configuration/startup to fail; invalid credentials or an unreachable database cause Flyway startup to fail. The application intentionally has no fallback database or embedded credentials.

## API and security

`GET /api/health` returns `200` with `{"status":"UP"}` without authentication.
This is a basic application liveness endpoint, not a continuous database readiness check.
Registration and login POST routes are public. `/api/auth/me`, `/api/auth/logout`, and the project/task/dashboard endpoints require a signed JWT backed by an active database session. Other business routes remain denied. No generated default user, login page or HTTP Basic is enabled.
HTTP sessions are stateless; bearer credentials are supplied only through Authorization headers. CSRF is disabled for this bearer-only API; cookie authentication is not enabled.
CORS allows the configured frontend origin and Authorization/Content-Type request headers; cookie credentials are disabled.

MVC and security errors use `timestamp`, `status`, `error`, `message`, `path`, and `validationErrors`.
Validation errors contain a field and message without rejected values. Unexpected errors are logged on the server and return a generic message.
Framework CORS rejections use Spring's default response.

## Layers

| Package | Responsibility |
| --- | --- |
| `config` | Security filter chain and CORS configuration |
| `controller` | HTTP endpoints |
| `service` | Authentication, project and task use cases |
| `repository` | Future Spring Data JPA interfaces |
| `entity` | Future JPA entities |
| `dto` | API request/response models |
| `security` | JWT verification, principal, RLS context and password validation |
| `exception` | Global error handling |
| `mapper` | Future entity/DTO conversions |
| `enums` | Future domain enumeration types |

Unused layers are retained using `package-info.java`. Task 2 adds entities, enums and repositories; Task 3 adds authentication. Project and task services enforce ownership within RLS transactions.

## Database changes

Add SQL migrations under `src/main/resources/db/migration`, named `V1__description.sql`, `V2__description.sql`, etc.
V1 creates users, sessions, projects and tasks, native enums, indexes, integrity constraints, triggers and forced ownership policies. Optional development data is a manual script outside Flyway.
V2 adds an exact-email, transaction-local SELECT policy for the trusted backend's password-verification bootstrap. Forced ownership policies remain enabled.
Hibernate uses `ddl-auto=validate`, SQL initialization is disabled, and Flyway clean is disabled.
Use a dedicated application database/schema; do not enable automatic baselining for an existing Supabase schema without inspecting it.

See [Task 2 database design](docs/database-design.md) for schema changes, transaction retry requirements, runtime/migration permissions, future JWT ownership integration, manual seed usage, and isolated PostgreSQL tests. Separate Flyway credentials can be set using `FLYWAY_DB_URL`, `FLYWAY_DB_USERNAME`, and `FLYWAY_DB_PASSWORD`.

## Verification

From `backend/`, run `./mvnw compile test` (PowerShell: `.\mvnw.cmd compile test`).
The context smoke test excludes datasource/JPA/Flyway auto-configuration and mocks persistence/context components so it runs without credentials. Test JWT keys are fixtures only.
Database-independent tests verify health, denied routes, CORS, validation errors, malformed JSON, safe unexpected-error responses and JWT validation.
Database integration tests prefer a disposable Testcontainers PostgreSQL instance when Docker is available. Without Docker or a validated local override they skip; no application database credentials are used. The suite executes Flyway, validates Hibernate mappings and tests constraints, RLS and concurrency. On Windows, run `.\scripts\Test-Postgres.ps1` to create that isolated database and run all tests. See the database design document for details. Supabase production connectivity has not been tested.

Task 6 dashboard statistics are complete. See [project APIs](docs/projects.md), [task APIs](docs/tasks.md), and [dashboard APIs](docs/dashboard.md) for ownership, pagination, statistics and date windows. `DASHBOARD_TIME_ZONE` defaults to UTC. Task 7 adds Swagger UI at `/swagger-ui.html`, generated OpenAPI at `/v3/api-docs`, and automated unit/integration tests. See [API documentation and testing](docs/api-documentation-and-tests.md) for Bearer authorization, examples, test isolation and actual results. Docker deployment and hosting remain deferred.
