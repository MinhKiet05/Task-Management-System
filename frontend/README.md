# Task Management System frontend

FE-01 provides a JavaScript React/Vite foundation with Tailwind CSS, React Router and Axios. The six pages are placeholders, ready to replace with Google Stitch designs. Authentication forms, route guards, CRUD, dashboard data and Kanban interactions are deferred.

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

Routes: `/login`, `/register`, `/dashboard`, `/projects`, `/tasks`, `/kanban`. `/` redirects to `/dashboard`; unknown paths show 404. Pages are accessible previews and make no API requests. No frontend route authorization is implemented yet; backend authorization remains required for every protected request.

## API and token handling

The live [OpenAPI specification](https://task-management-system-i7xu.onrender.com/v3/api-docs) was inspected on 2026-11-23. It describes 20 operations and the `bearerAuth` HTTP bearer scheme. Register/login return `accessToken`, `tokenType`, `expiresAt` and `user`. Tokens require an active backend session. Logout revokes that session; there is no refresh-token endpoint.

Existing authentication paths are `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/logout` and `GET /api/auth/me`. Task listing is project-scoped at `GET /api/projects/{projectId}/tasks`; `/tasks` and `/kanban` are frontend routes, not new backend endpoints. No endpoint integrations are implemented by FE-01. Consult the actual specification again when adding them.

Future API modules should import `apiClient` from `src/api/client.js` and use relative paths beginning with `/api/`. The client supplies JSON accept headers, a 15-second timeout and the current bearer token. It rejects absolute URLs and base-URL overrides to keep tokens on the configured backend. Errors remain Axios errors, preserving the backend response/status for later form and notification handling. Do not log Axios errors/config objects because they can contain authorization headers.

`useAuth()` exposes `setAccessToken`, `clearAccessToken` and `hasAccessToken`. After a future successful login, call `setAccessToken(response.data.accessToken)`. Token presence is not proof of authentication; `/api/auth/me` must establish the user in the later authentication flow. Never decode an unverified JWT to authorize access.

Tokens remain in memory, with no localStorage/sessionStorage persistence; page reloads clear them. A 401 clears the matching current token; late failures from an older token do not clear a newer session. A 403 or network error preserves the token. There is no automatic redirect, refresh or retry. Clearing local state is not server logout: the future logout flow must call the documented endpoint with the current token before clearing it.

## Checks

```powershell
npm run lint
npm test
npm run build
npm run preview
```

Unit tests use Node's built-in runner and Axios adapters, covering configuration validation, token lifecycle, authorization headers, 401/403 behavior, stale responses and request origin restrictions. They make no network or database requests. `npm run build` produces `dist/`. Use `npm ci` for reproducible installs from the committed lockfile.

## Google Stitch integration

Replace the corresponding `pages/` content and share repeated controls in `components/`. Keep routing in `routes/`, application shells in `layouts/` and HTTP calls in `api/`. Tailwind v4 uses `@tailwindcss/vite` and `@import "tailwindcss"` in `src/index.css`; add design tokens to its `@theme` block. Do not paste CDN scripts, duplicate HTML roots or Stitch-generated token storage into components. Existing styles use system fonts without third-party font requests.

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
