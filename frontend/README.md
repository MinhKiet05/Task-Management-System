# Task Management System frontend

FE-01 provides a JavaScript React/Vite foundation with Tailwind CSS, React Router and Axios. Login/register use centered Vietnamese TaskFlow forms. FE-03 adds a protected, responsive application shell with current-user identity and session logout. FE-04 adds a real-API dashboard and read-only task details. FE-05 adds project listing, creation, editing, archiving, deletion and a read-only project task list. General task management and Kanban interactions remain placeholders.

## Local setup

Use Node 22.17.0 (`.nvmrc`), or a version satisfying `package.json` engines, and npm. From the repository root in Windows PowerShell:

```powershell
Set-Location frontend
Copy-Item .env.example .env.local
npm install
npm run dev
```

Open http://localhost:5173. The fixed port helps keep the backend's exact-origin CORS configuration predictable. Restart Vite after changing environment files.

```text
VITE_API_BASE_URL=https://task-management-system-i7xu.onrender.com
```

This is the backend origin, without `/api` or a trailing path. HTTPS is required except on loopback HTTP origins for local backend development. Invalid/missing configuration fails dev startup and production builds. All `VITE_*` values are public build-time values: never add database credentials, JWT signing secrets or access tokens to them. Local environment files are ignored by Git.

## Structure

```text
src/
  api/          Axios client, environment validation, in-memory token store
  assets/       Shared brand mark and future design assets
  components/   Shared presentation and error boundary
  contexts/     Authentication state provider
  hooks/        Authentication access and document titles
  layouts/      Workspace and authentication shells
  pages/        Route-level placeholders and 404
  routes/       Route definitions
```

Routes: `/login`, `/register`, `/dashboard`, `/projects`, `/tasks`, `/tasks/:taskId`, `/kanban`. `/` redirects to `/dashboard`; unknown paths show 404 inside the protected shell. Workspace routes require an authenticated user and redirect to `/login` otherwise. The dashboard reads real summary/deadline/project data and task links open a read-only detail page. Backend authorization remains required for every protected API request. See [FE-03 application layout](docs/application-layout.md) and [FE-04 dashboard](docs/dashboard.md).

Project cards now open `/projects/:projectId/tasks`. Project search/status filtering/date sorting apply only to the loaded API page and are explicitly labeled. Project CRUD/archiving use real API endpoints with full PUT payloads and confirmation dialogs. See [FE-05 project management](docs/projects.md) for supported behavior, limitations and verification.

## API and token handling

The live [OpenAPI specification](https://task-management-system-i7xu.onrender.com/v3/api-docs) was inspected on 2026-11-23. It describes 20 operations and the `bearerAuth` HTTP bearer scheme. Register/login return `accessToken`, `tokenType`, `expiresAt` and `user`. Tokens require an active backend session. Logout revokes that session; there is no refresh-token endpoint.

Existing authentication paths are `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/logout` and `GET /api/auth/me`. The frontend uses all four for the authentication lifecycle. Task listing is project-scoped at `GET /api/projects/{projectId}/tasks`; `/tasks` and `/kanban` are frontend routes, not new backend endpoints. Consult the actual specification again when adding further integrations.

Future API modules should import `apiClient` from `src/api/client.js` and use relative paths beginning with `/api/`. The client supplies JSON accept headers, a 15-second timeout and the current bearer token. It rejects absolute URLs and base-URL overrides to keep tokens on the configured backend. Errors remain Axios errors, preserving the backend response/status for later form and notification handling. Do not log Axios errors/config objects because they can contain authorization headers.

`useAuth()` exposes current `user`, lifecycle `status`, `completeAuthentication`, `logout`, `retryUser` and the existing token helpers. Successful registration/login stores the returned access token and user, then navigates to `/dashboard`. A token without user data triggers one deduplicated `/api/auth/me` request. Token presence alone does not expose protected content. Never decode an unverified JWT to authorize access.

Tokens remain in memory, with no localStorage/sessionStorage persistence; page reloads return to login. A 401 clears the matching current token and user; late failures from an older token do not clear a newer session. Backend-returned access-token expiry also clears the session. A 403 or network error preserves the token. There is no automatic refresh. Logout sends the current bearer token to the backend before clearing local state and redirecting. Failed revocation stays visible and retryable rather than claiming server logout succeeded.

## Checks

```powershell
npm run lint
npm test
npm run build
npm run preview
```

Unit tests use Node's built-in runner and Axios adapters, covering configuration validation, token lifecycle, authorization headers, 401/403 behavior, stale responses and request origin restrictions. They make no network or database requests. `npm run build` produces `dist/`. Use `npm ci` for reproducible installs from the committed lockfile.

## Google Stitch integration

Replace the corresponding `pages/` content and share repeated controls in `components/`. Keep routing in `routes/`, application shells in `layouts/` and HTTP calls in `api/`. Tailwind v4 uses `@tailwindcss/vite` and `@import "tailwindcss"` in `src/index.css`; add design tokens to its `@theme` block. Do not paste CDN scripts, duplicate HTML roots or Stitch-generated token storage into components. Authentication styles are scoped in `components/auth/auth.css` and use self-hosted Inter with its OFL license in `assets/fonts/`; other pages retain their existing styles. No runtime font service is used.

## Vercel configuration

When deployment is separately authorized:

1. Set the Vercel Root Directory to `frontend` and framework to Vite.
2. Set `VITE_API_BASE_URL` to the public backend HTTPS origin for the intended environment.
3. Use `npm run build` and output directory `dist` (`vercel.json` supplies these).
4. The SPA rewrite serves `index.html` for direct route visits and refreshes. Vercel serves existing static assets before its filesystem fallback rewrite.
5. Configure Render's `FRONTEND_URL` to the exact Vercel origin, without a trailing slash. Local API development needs the local origin allowed instead; the backend currently supports one configured origin. Preview domains are not automatically allowed.
6. Environment values are baked into the frontend build; rebuild after changing them.

The backend's CORS configuration was not modified. No deployment, production write or authentication request is part of this setup. Verify real-browser CORS and authenticated flows when API integration is implemented.

## FE-01 verification

Executed locally on Windows with Node 22.17.0:

- Dependency installation completed with no reported vulnerabilities.
- ESLint passed and all 19 unit tests passed.
- The Vite production build succeeded.
- A temporary Playwright/headless Edge smoke check against the production preview passed for all six placeholder routes, the root redirect and 404 at 1440px and 375px widths. Navigation, direct visits, reloads, page titles and horizontal overflow were checked; no browser errors or external API requests occurred. Browser tooling is not a project dependency.

The Vercel rewrite is configured but has not been verified on a live deployment. Login, backend CORS and authenticated API flows remain outside FE-01.

## Centered TaskFlow authentication redesign

Login/register share a single-column, 440px maximum-width layout with indigo actions, a lavender gradient, Vietnamese text and minimal branding/footer. No statistics, company information, compliance claims, SSO labels, remember-me control or empty second column is included.

Shared fields provide password visibility toggles, accessible labels/errors, validation, pending states and disabled duplicate submissions. Registration confirms passwords locally and sends only `name`, `email` and `password`. Password rules match the actual backend: at least 12 Unicode code points for registration, at most 72 UTF-8 bytes, nonblank and no NUL characters. No uppercase, digit or special-character rule is invented. Existing shorter passwords can still be used for login. Email is trimmed/lowercased; passwords are never trimmed. API errors are translated into Vietnamese without displaying raw server diagnostics. Navigating away aborts an in-flight submission.

Verification performed after this redesign: lint passed, all 27 unit tests passed and the production build succeeded. Headless Edge checked both routes at 375/768/1024/1440px, centered positioning, absence of overflow/promotional panels, short-screen scrolling, visibility toggles, loading, confirmation validation, normalized request payloads, navigation and mocked 200/201/400/401/409 responses. No React errors occurred. All authentication requests in verification were intercepted locally; no production login or account creation was performed. Live backend CORS and real credential flows still require a separately authorized check.

Changed source files: `layouts/AuthLayout.jsx`, `pages/LoginPage.jsx`, `pages/RegisterPage.jsx`, `hooks/usePageTitle.js`; new `hooks/useAuthForm.js`, `api/auth.js`, shared `components/auth/` files, Inter font/license and `tests/authValidation.test.js`. Routes, shared token storage, backend code and migrations were not changed.
