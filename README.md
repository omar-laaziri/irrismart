# IrriSmart MVP

IrriSmart is a UI-first smart irrigation advisory demo for Moroccan farming context.
It answers one core question:

**"Should I irrigate today, and for how long?"**

## Tech Stack

- Frontend: React + TypeScript + Vite + Recharts + Lucide icons
- Backend: Node.js + Express (mock/simulated data API)
- Runtime model: single user, single farm, no auth

## Project Structure

```text
.
├── AGENTS.md
├── backend
│   ├── package.json
│   └── src
│       ├── mockData.js
│       └── server.js
├── frontend
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   ├── tsconfig.node.json
│   ├── vite.config.ts
│   └── src
│       ├── api.ts
│       ├── App.tsx
│       ├── context
│       │   └── LanguageContext.tsx
│       ├── i18n.ts
│       ├── main.tsx
│       ├── plotSession.ts
│       ├── pages
│       │   ├── AlertsPage.tsx
│       │   ├── DashboardPage.tsx
│       │   ├── ReportsPage.tsx
│       │   └── SensorsPage.tsx
│       ├── components
│       │   ├── Layout.tsx
│       │   ├── RecommendationCard.tsx
│       │   ├── SectionTitle.tsx
│       │   └── SnapshotCard.tsx
│       ├── styles.css
│       ├── types.ts
│       └── vite-env.d.ts
├── package.json
└── .gitignore
```

## API Endpoints

- `GET /api/health`
- `GET /api/plots`
- `GET /api/dashboard?plotId=<plot_id>`
- `GET /api/sensors/history?days=14&plotId=<plot_id>`
- `GET /api/recommendations?plotId=<plot_id>`
- `GET /api/alerts?plotId=<plot_id>`
- `GET /api/simulations?plotId=<plot_id>`
- `GET /api/reports?plotId=<plot_id>`

## AI Logic (Explainable Rules)

IrriSmart uses deterministic heuristic logic (no ML model) for demo explainability:

- Recommendation decision combines:
  - crop-specific moisture thresholds
  - current soil moisture
  - 5-day forecast rain probability
  - short-term heat stress pressure
- Recommendation confidence is a rule score derived from threshold distance and forecast consistency.
- \"Main factors\" shown in UI map directly to API fields:
  - `moisture_level`
  - `rain_probability`
  - `heat_forecast`
- Soil Health score (`0-100`) is computed from:
  - moisture stability (variance + distance from target)
  - irrigation balance (days out of recommended range)
  - temperature stress frequency
- What-if simulation compares deterministic 24h outcomes for:
  - `irrigate_today`
  - `wait_24h`
  on soil moisture and soil health deltas.

## Run Locally

1. Install dependencies:

```bash
npm install
```

2. Start frontend + backend together:

```bash
npm run dev
```

3. Open:

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:4000/api/health`

## Deploy (Free) On Render

This repository now includes `/Users/omarlaaziri/Documents/New project/render.yaml` so Render can deploy it as a single free web service:

- frontend is built with Vite
- backend serves `/api/*`
- backend also serves the built frontend for all non-API routes

### Steps

1. Push this repo to GitHub.
2. In Render, create a new **Blueprint** and select this repo.
3. Render will detect `render.yaml` and create one free `Web Service`.
4. Wait for deploy; then verify:
   - `https://<your-render-service>.onrender.com/api/health`
   - `https://<your-render-service>.onrender.com/`

### Use an `irrismart` URL (no custom domain)

The Render service name controls the default URL.

- Current config uses service name: `irrismart-mvp-demo`
- Default URL pattern: `https://<service-name>.onrender.com`
- Example expected URL: `https://irrismart-mvp-demo.onrender.com`

If the name is already taken, Render will ask for another unique name.
Keep `irrismart` in the name, for example:

- `irrismart-demo-ma`
- `irrismart-farm-mvp`

## Notes

- Data is mocked/simulated for MVP demo.
- Forecast, soil health, and what-if outputs are simulated but use realistic API contracts.
- Language toggle supports French (`FR`) and Arabic (`AR`) with RTL mode.
- No authentication included by design.
