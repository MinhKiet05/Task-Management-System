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
`JWT_SECRET` and `JWT_EXPIRATION` are reserved configuration for the later authentication task. Expiration defaults to `3600000` milliseconds. They are not consumed by authentication yet.

Missing database variables cause datasource configuration/startup to fail; invalid credentials or an unreachable database cause Flyway startup to fail. The application intentionally has no fallback database or embedded credentials.

## API and security

`GET /api/health` returns `200` with `{"status":"UP"}` without authentication.
This is a basic application liveness endpoint, not a continuous database readiness check.
All other routes are denied until authentication is implemented. No generated default user, login page, HTTP Basic, or JWT implementation is enabled.
Security filters and CSRF protection remain enabled; sessions are stateless.
CORS allows the configured frontend origin and Authorization/Content-Type request headers; cookie credentials are disabled.

MVC and security errors use `timestamp`, `status`, `error`, `message`, `path`, and `validationErrors`.
Validation errors contain a field and message without rejected values. Unexpected errors are logged on the server and return a generic message.
Framework CORS rejections use Spring's default response.

## Layers

| Package | Responsibility |
| --- | --- |
| `config` | Security filter chain and CORS configuration |
| `controller` | HTTP endpoints |
| `service` | Future application use cases |
| `repository` | Future Spring Data JPA interfaces |
| `entity` | Future JPA entities |
| `dto` | API request/response models |
| `security` | Future JWT components |
| `exception` | Global error handling |
| `mapper` | Future entity/DTO conversions |
| `enums` | Future domain enumeration types |

Empty layers are retained using `package-info.java`, without placeholder business classes.

## Database changes

Add SQL migrations under `src/main/resources/db/migration`, named `V1__description.sql`, `V2__description.sql`, etc.
No business tables or seed data are defined in this task. Flyway is enabled and may create its schema history table at startup.
Hibernate uses `ddl-auto=validate`, SQL initialization is disabled, and Flyway clean is disabled.
Use a dedicated application database/schema; do not enable automatic baselining for an existing Supabase schema without inspecting it.

## Verification

From `backend/`, run `./mvnw compile test` (PowerShell: `.\mvnw.cmd compile test`).
The context smoke test excludes datasource/JPA/Flyway auto-configuration so it runs without credentials.
MVC tests verify public health access, denied routes, CSRF, CORS, validation errors, malformed JSON, and safe unexpected-error responses.
These tests do not validate a real Supabase connection or execute database migrations. Run the application against your configured PostgreSQL database to verify those integrations.

Business features, authentication, OpenAPI, Docker, and deployment are deferred.
