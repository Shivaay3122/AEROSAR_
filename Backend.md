# AEROSAR — Backend

The API and data layer behind **AEROSAR — Aircraft Search & Rescue Intelligence**.

## Responsibilities

- Store and serve mission data (aircraft, last-known positions, search zones)
- Provide the endpoints the frontend uses for the map and dashboard
- Handle alerts and status updates for active missions

> Edit to match what your backend actually does. If your app uses Supabase (the default for Bolt projects), the "backend" is the database, auth, and edge functions, so describe those here.

## Tech Stack

| Layer    | Technology                          |
| -------- | ----------------------------------- |
| Runtime  | Node.js / Supabase Edge (confirm)   |
| Database | PostgreSQL / Supabase (confirm)     |
| Auth     | Supabase Auth / none (confirm)      |

## Getting Started

### Prerequisites

- Node.js v18+
- A running database (PostgreSQL or Supabase project)

### Install and run

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

The API runs at `http://localhost:3001` by default.

### Environment variables

```bash
PORT=3001
NODE_ENV=development

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/aerosar"

# CORS
FRONTEND_URL="http://localhost:5173"
```

For Supabase, use instead:

```bash
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

> Never commit `.env` files or service keys.

## API Reference

> Replace with your real endpoints.

| Method | Endpoint             | Description                  |
| ------ | -------------------- | ---------------------------- |
| GET    | `/api/missions`      | List missions                |
| POST   | `/api/missions`      | Create a mission             |
| GET    | `/api/missions/:id`  | Get mission details          |
| PATCH  | `/api/missions/:id`  | Update mission status        |
| GET    | `/api/health`        | Health check                 |

## Data Model

| Table / Entity | Purpose                              |
| -------------- | ------------------------------------ |
| `missions`     | Active and past search operations    |
| `aircraft`     | Aircraft details and last position   |
| `search_zones` | Planned search areas per mission     |
| `alerts`       | Mission events and notifications     |

> Rename to match your schema.

## Folder Structure

```
backend/
├── src/
│   ├── routes/
│   ├── services/
│   ├── db/
│   └── index.ts
├── .env.example
└── package.json
```

## Deployment

Deploy to any Node host (Railway, Render, Fly.io) or as Supabase Edge Functions. Set the environment variables above on your host.

## Related

- Frontend: see [`../frontend/README.md`](../frontend/README.md)

---

Made by **[Your Name]** · [LinkedIn](https://linkedin.com/in/your-profile) · [GitHub](https://github.com/your-username)
