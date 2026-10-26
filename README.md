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
README.md
```

## Installation

From the repository root:

```sh
npm ci --prefix client
npm ci --prefix server
```

## Environment configuration

The assessment requires working environment files. **`client/.env` and `server/.env` are intentionally eligible for version control and use dedicated assessment-only configuration.** The owner confirmed these resources were created solely for the exam. Other local environment variants remain ignored. Do not substitute personal or production credentials.

| File | Variable | Purpose |
|---|---|---|
| `client/.env` | `VITE_API_URL` | Backend origin, without an `/api` suffix |
| `server/.env` | `PORT` | Backend HTTP port |
| `server/.env` | `MONGO_URI` | Atlas connection URI including the intended database |
| `server/.env` | `CLIENT_URL` | Allowed frontend origin for CORS |

Use the included `.env` files for evaluation; do not overwrite them with the examples. The `.env.example` files are credential-free templates for configuring a separate environment. If using the templates, copy them to `.env` only when a local `.env` is missing, then fill in the required configuration.

For a separate Atlas setup, choose your own project/cluster, create a database user with access to the intended database, allow your current IP under **Network Access**, and obtain a URI from **Connect → Drivers**. Select the database explicitly and URL-encode special characters in credentials before setting `MONGO_URI` locally. An evaluator connecting from another network may need their IP allowed in Atlas.

Keep `VITE_API_URL` aligned with the backend port and `CLIENT_URL` aligned with the Vite origin. Restart the corresponding server after environment changes. All `VITE_` variables are public browser configuration and must not contain database credentials.

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
| GET | `/api/health` | HTTP 200 and server-health JSON |
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

Both should return HTTP 200. The health response is `{"status":"ok","message":"Server is healthy."}`. This endpoint checks HTTP availability; the backend startup success message confirms the initial Atlas connection.

In the browser, create a clearly named test event, confirm it appears on the dashboard, edit its details, test cancellation of deletion, and then confirm deletion. Verify the layout on desktop and mobile. Build output, dependencies, and logs are excluded from Git.
