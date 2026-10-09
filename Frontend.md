# AEROSAR — Frontend

The mission-control web interface for **AEROSAR — Aircraft Search & Rescue Intelligence**.

**Live demo:** [aerosar-aircraft-sea-nqax.bolt.host](https://aerosar-aircraft-sea-nqax.bolt.host)

<!-- ![AEROSAR dashboard](./docs/screenshot.png) -->

## What it does

- Interactive map of the search area with last-known position and search zones
- Mission dashboard with live status of the active operation
- Alerts and status indicators for mission-critical events
- Responsive dark mission-control UI built for quick reading under pressure

> Edit this list to match what your build actually includes.

## Tech Stack

| Layer     | Technology                     |
| --------- | ------------------------------ |
| Framework | React + Vite (confirm)         |
| Language  | TypeScript (confirm)           |
| Styling   | Tailwind CSS / CSS (confirm)   |
| Map       | Leaflet / Mapbox (confirm)     |
| Hosting   | Bolt Hosting                   |

## Getting Started

### Prerequisites

- Node.js v18+
- npm, yarn, or pnpm

### Install and run

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`.

### Environment variables

Create a `.env` file in `frontend/`:

```bash
# Backend / API base URL
VITE_API_URL=http://localhost:3001

# Map provider key, if required
VITE_MAP_API_KEY=your_map_api_key
```

### Build for production

```bash
npm run build
npm run preview
```

## Folder Structure

```
frontend/
├── public/
├── src/
│   ├── components/   # Map, dashboard, panels, shared UI
│   ├── hooks/        # Reusable React hooks
│   ├── lib/          # API client and helpers
│   ├── App.tsx
│   └── main.tsx
├── index.html
└── package.json
```

> Adjust to match your real layout.

## Scripts

| Command           | Description                  |
| ----------------- | ---------------------------- |
| `npm run dev`     | Start the dev server         |
| `npm run build`   | Create a production build    |
| `npm run preview` | Preview the production build |
| `npm run lint`    | Lint the codebase            |

## Related

- Backend: see [`../backend/README.md`](../backend/README.md)

---

Made by **[Your Name]** · [LinkedIn](https://linkedin.com/in/your-profile) · [GitHub](https://github.com/your-username)
