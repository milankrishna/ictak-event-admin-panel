# EventDesk — Event Registration Admin Panel

ICTAK MERN assessment application for creating, viewing, updating, and deleting events and viewing registration totals.

## Features

- Responsive black-and-white dashboard with Event ID, Event Name, Event Date, Venue, and Total Registrations.
- Dashboard and Add Event navbar tabs with client-side routing.
- Reusable Add/Edit form with inline validation, loading states, and duplicate-submit protection.
- Date entry in **DD/MM/YYYY**; dates are sent to the API as **YYYY-MM-DD** and displayed consistently using UTC.
- Confirmed deletion with immediate dashboard updates and success/error feedback.
- Registration totals default to zero and cannot be edited in the form.
- MongoDB Atlas persistence, REST APIs, and centralized JSON error responses.

## Technology stack

React, Vite, React Router, Axios, Node.js, Express, MongoDB Atlas, Mongoose, dotenv, and cors. JavaScript with ES modules throughout; no login or registration workflow is required.

Use **Node.js 24 LTS** (or a compatible current release) and npm. Vite requires Node.js 20.19+ or 22.12+; Node.js 24 LTS is recommended.

## Project structure

`client/` is the frontend and `server/` is the backend.

```text
client/
  src/
    components/EventForm.jsx
    components/Navbar.jsx
    pages/Home.jsx
    pages/AddEvent.jsx
    pages/EditEvent.jsx
    services/api.js
    App.jsx
    main.jsx
    index.css
  .env
  .env.example
  index.html
  vite.config.js
  package.json
  package-lock.json
server/
  src/
    config/db.js
    models/Event.js
    controllers/eventController.js
    routes/eventRoutes.js
    middleware/errorHandler.js
    app.js
    server.js
  .env
  .env.example
  package.json
  package-lock.json
.gitignore
.vercelignore
api/handler.js
package.json
vercel.json
README.md
```

## Installation

From the repository root:

```sh
npm ci --prefix client
npm ci --prefix server
```

## Environment configuration

The assessment requires working environment files. **`client/.env` and `server/.env` are included in the repository and use dedicated assessment-only configuration.** These resources were created solely for the exam. Other local environment variants remain ignored. Do not substitute personal or production credentials.

| File | Variable | Purpose |
|---|---|---|
| `client/.env` | `VITE_API_URL` | Local development backend origin, without an `/api` suffix; production uses same-origin requests |
| `server/.env` | `PORT` | Backend HTTP port |
| `server/.env` | `MONGO_URI` | Atlas connection URI including the intended database |
| `server/.env` | `CLIENT_URL` | Allowed frontend origin for CORS |

Use the included `.env` files for evaluation; do not overwrite them with the examples. The `.env.example` files are credential-free templates for configuring a separate environment. If using the templates, copy them to `.env` only when a local `.env` is missing, then fill in the required configuration.

For a separate Atlas setup, choose your own project/cluster, create a database user with access to the intended database, allow your current IP under **Network Access**, and obtain a URI from **Connect → Drivers**. Select the database explicitly and URL-encode special characters in credentials before setting `MONGO_URI` locally. An evaluator connecting from another network may need their IP allowed in Atlas.

For local development, keep `VITE_API_URL` aligned with the backend port and `CLIENT_URL` aligned with the Vite origin. Restart the corresponding server after environment changes. All `VITE_` variables are public browser configuration and must not contain database credentials. Production builds always use `/` as the Axios base URL, so the tracked local API origin cannot accidentally be embedded as the production backend target.

## Run locally

From the repository root, in two terminals:

```sh
# Terminal 1: backend, with automatic restart on source changes
npm run dev --prefix server
```

```sh
# Terminal 2: frontend
npm run dev --prefix client
```

Open the local URL printed by Vite. The backend connects to MongoDB before it begins listening; look for `MongoDB connected successfully.` followed by the startup message. Missing or invalid MongoDB configuration stops startup with a safe error message.

Backend production startup:

```sh
npm start --prefix server
```

Frontend production build:

```sh
npm run build --prefix client
```

To preview the frontend build locally, run `npm run preview --prefix client` and use a preview origin allowed by `CLIENT_URL` (or pass Vite's `--port` option to use the configured frontend port). The backend must also be running.

## Pages and API endpoints

Pages: `/` (dashboard), `/add-event` (create), `/edit-event/:id` (update).

| Method | Endpoint | Result |
|---|---|---|
| GET | `/api/health` | HTTP 200 after MongoDB connection middleware succeeds; HTTP 503 if the connection cannot be established |
| GET | `/api/events` | Events sorted by event date |
| GET | `/api/events/:id` | One event, or HTTP 404 |
| POST | `/api/events` | Create an event; HTTP 201 |
| PUT | `/api/events/:id` | Update the four editable fields |
| DELETE | `/api/events/:id` | Delete an event |

POST and PUT accept JSON with `eventName`, `eventDescription`, `eventDate`, and `venue`. All four are required. Maximum lengths are 120, 2000, and 200 characters for name, description, and venue respectively. API dates must be valid `YYYY-MM-DD` strings. `_id` is the generated Event ID; `totalRegistrations` starts at zero and is server-managed.

Invalid input or IDs return HTTP 400; missing events and unknown API routes return HTTP 404. Unexpected server errors return a generic HTTP 500 response.

## Verify the application

With the backend running, replace `BACKEND_PORT` below with its configured port:

```sh
curl -i "http://localhost:BACKEND_PORT/api/health"
curl -i "http://localhost:BACKEND_PORT/api/events"
```

Both should return HTTP 200 when MongoDB is available. The health response is `{"status":"ok","message":"Server is healthy."}`. MongoDB connection middleware runs before `/api/health`, so it also depends on database connectivity. If the connection helper fails, the middleware returns HTTP 503 with `{"message":"Database unavailable. Please try again shortly."}`. The helper reuses an established connection; the health endpoint does not perform a separate database ping.

In the browser, create a clearly named test event, confirm it appears on the dashboard, edit its details, test cancellation of deletion, and then confirm deletion. Verify the layout on desktop and mobile. Build output, dependencies, and logs are excluded from Git.

## Vercel deployment: one project

The implemented application is committed to [GitHub](https://github.com/milankrishna/ictak-event-admin-panel) and deployed at [EventDesk](https://ictak-event-admin-panel.vercel.app). The root configuration builds the frontend and serves all Express routes through one Node.js function. The frontend and API share one HTTPS origin.

### Local commands

From the repository root:

```sh
npm run install:apps
npm run build
# In separate terminals:
npm run dev:server
npm run dev:client
```

Local development still uses Vite on port 5173 and Express on port 5001, with the existing local environment files. The root package targets Node.js 24.x to match Vercel. The install script uses the existing client/server lockfiles; no additional application dependencies are needed.

### Vercel settings

The single Vercel project is connected to `milankrishna/ictak-event-admin-panel` with the following configuration:

| Setting | Value |
|---|---|
| Production branch | `master` |
| Root Directory | Repository root (leave blank / `.`), not `client` or `server` |
| Framework Preset | Other |
| Node.js | 24.x |
| Install Command | `npm run install:apps` |
| Build Command | `npm run build` |
| Output Directory | `client/dist` |

The root `vercel.json` specifies the install/build/output settings and function routing. `api/handler.js` exports the existing ES-module Express app without starting a listener. It reuses the existing connection helper and REST API implementation.

### Vercel environment variables

- **`MONGO_URI`**: required; enter the existing Atlas URI privately in Vercel Settings → Environment Variables.
- **`CLIENT_URL`**: set to the deployed application's HTTPS origin without a trailing slash. It continues to control CORS; normal deployed requests are same-origin.
- **`VITE_API_URL`**: not required for production. Production builds use `/` explicitly; local development still reads the existing variable. Do not set this to `/api`, because callers already use `/api/events` and other full API paths.
- **`PORT`**: not required by Vercel; only used for local startup.

Set runtime variables for Production and also Preview if previews need database access. The deployment does not rely on the tracked local `.env` files: `.vercelignore` excludes them from uploads, and the function config excludes them from its bundle. Do not prefix the database variable with `VITE_`.

Confirm Atlas Network Access allows Vercel outbound traffic, not only your laptop's IP. Default Vercel deployments do not guarantee a fixed outbound IP. Use an appropriate Atlas access rule or static egress configuration; for an exam-only database, an allow-from-anywhere rule is an option if permitted by your assessment.

### Routing and verification

1. `/api/*` is forwarded to the Express function, preserving the original API path.
2. Real built assets are served from `client/dist`; missing assets do not fall back to HTML.
3. Frontend routes such as `/add-event` and `/edit-event/:id` fall back to `index.html` for React Router.
4. Verify `/api/health` and `/api/events` return HTTP 200. Unknown API routes must return JSON HTTP 404, not the React page.
5. Refresh direct Add/Edit URLs and confirm JavaScript/CSS assets load.

The function returns safe HTTP 503 responses if Atlas is unavailable. Warm instances reuse connections and concurrent cold-start requests share one connection attempt. Local startup remains separate in `server/src/server.js`.
