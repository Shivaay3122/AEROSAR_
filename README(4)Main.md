<div align="center">

# 🛩️ AEROSAR
### Aircraft Search & Rescue Intelligence

*A mission-control web app that estimates where a missing aircraft could be, and draws the resulting search area on an interactive map.*

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Open-brightgreen?style=for-the-badge)](https://aerosar-aircraft-sea-nqax.bolt.host)
[![CI](https://github.com/<your-username>/<your-repo>/actions/workflows/ci.yml/badge.svg)](https://github.com/<your-username>/<your-repo>/actions/workflows/ci.yml)
![License](https://img.shields.io/badge/license-MIT-blue)
![Status](https://img.shields.io/badge/status-prototype-orange)

</div>

---

## 📌 Table of Contents

- [Overview](#-overview)
- [Screenshots](#-screenshots)
- [Features](#-features)
- [How It Works](#-how-it-works)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [CI/CD](#-cicd)
- [Limitations & Assumptions](#-limitations--assumptions)
- [Roadmap](#-roadmap)
- [Contributing](#-contributing)
- [License](#-license)
- [Author](#-author)

## 🎯 Overview

When an aircraft goes missing, every hour matters. AEROSAR takes the aircraft's last known position, heading, speed, endurance, and the local wind, then calculates a search area and shows it on a map, so operators can see where to look first.

It was built as a hackathon project and is a **prototype for demonstration purposes only**.

**Live demo:** [aerosar-aircraft-sea-nqax.bolt.host](https://aerosar-aircraft-sea-nqax.bolt.host)

## 🖼️ Screenshots

### Mission Control
Enter the last known position, aircraft details, and wind. The search area polygon, nominal track, and position uncertainty are drawn on a satellite map, with live mission intelligence on the right.

<p align="center">
  <img src="https://plain-apac-prod-public.komododecks.com/202610/09/nvhFieuidHqWrABUh4rT/image.png" alt="AEROSAR Mission Control Dashboard" width="100%">
</p>

### Sign In
Operator sign-in and account creation.

![Sign In](./docs/login.png)

### Street Map View
Switch between satellite and street map layers, and zoom out to see the whole region.

![Street Map](./docs/map-street.png)

## ✨ Features

- 🔐 **Operator authentication** with sign in and account creation
- 📍 **Last known position input** by latitude/longitude, or by clicking anywhere on the map
- ✈️ **Aircraft details**: heading, endurance, speed (with unit selection)
- 🌬️ **Environment inputs**: wind direction, wind speed, and unit
- 🎯 **Search area calculation** that outputs a polygon, nominal track, position uncertainty, and wind drift track
- 🗺️ **Interactive Leaflet map** with satellite and street map layers
- 🎛️ **Map controls**: Fly Route, Fit Search Area, Return to LKP, and a toggleable Legend
- 📊 **Mission Intelligence panel** with search area, elapsed time, nominal distance, uncertainty radius, input completeness, and calculation status
- 📝 **Model Assumptions panel** that states exactly how each result was calculated
- 🚀 **Load Demo Mission** and **Reset Mission** for quick demos
- 🧭 **Three workspaces**: Mission Control, Search Analysis, and Mission History
- 🕒 **System status bar** with a live UTC clock
- 🌙 **Dark mission-control UI**

## ⚙️ How It Works

1. **Enter the last known position (LKP)**, the timestamp (UTC), and the position uncertainty in km.
2. **Enter aircraft details**: heading, endurance, and speed.
3. **Enter the wind**: direction, speed, and unit.
4. **Click "Calculate Search Area."** AEROSAR then:
   - projects the nominal track from the LKP along the heading at the given speed, limited by endurance or elapsed time
   - applies a simplified wind drift (a 15% drift factor along the wind direction) to estimate the estimated position
   - draws the search area polygon around the track using the position uncertainty
5. **Review results** in the Mission Intelligence panel and on the map.

> The model assumes a constant heading with no course or altitude changes. See the Model Assumptions panel in the app for the full list.

## 🧰 Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | React, Vite, TypeScript |
| Styling | Tailwind CSS |
| Map | Leaflet |
| Map tiles | Esri World Imagery (satellite), OpenStreetMap (street) |
| Auth & data | Supabase (PostgreSQL) |
| CI/CD | GitHub Actions |
| Built with | Bolt |
| Hosting | Bolt Hosting |

## 🏗️ Architecture

```mermaid
flowchart LR
    U["Operator"] --> A["Auth<br>Sign In / Create Account"]
    A --> F["Frontend<br>React + Vite"]
    F --> C["Search Area Model<br>Track + Wind Drift + Uncertainty"]
    C --> M["Leaflet Map<br>Satellite / Street"]
    F --> DB[("Database<br>Missions | History")]
    DB --> F
```

## 📁 Project Structure

```
aerosar/
├── .github/
│   └── workflows/
│       └── ci.yml
├── docs/                 # Screenshots
│   ├── dashboard.png
│   ├── login.png
│   └── map-street.png
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── lib/
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── index.html
│   ├── package.json
│   └── README.md
├── backend/
│   ├── src/
│   ├── package.json
│   └── README.md
└── README.md
```

## ⚡ Getting Started

### Prerequisites

- Node.js v18 or higher
- npm, yarn, or pnpm
- A Supabase project (or PostgreSQL database) for auth and mission history

### 1. Clone the repository

```bash
git clone https://github.com/<your-username>/<your-repo>.git
cd <your-repo>
```

### 2. Run the backend

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

### 3. Run the frontend

```bash
cd frontend
npm install
npm run dev
```

The app runs at `http://localhost:5173`. See [`frontend/README.md`](./frontend/README.md) and [`backend/README.md`](./backend/README.md) for details.

## 🔐 Environment Variables

**Frontend (`frontend/.env`)**

```bash
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Backend (`backend/.env`)**, only if you run a separate server

```bash
PORT=3001
NODE_ENV=development
DATABASE_URL="postgresql://user:password@localhost:5432/aerosar"
```

> Never commit `.env` files or secret keys.

## 🔄 CI/CD

A GitHub Actions workflow (`.github/workflows/ci.yml`) runs on every push and pull request to `main`:

- **Frontend:** install, lint, type-check, build, and upload the build artifact
- **Backend:** install, lint, build, and test

## ⚠️ Limitations & Assumptions

- **Prototype for demonstration purposes only. Not for real-world search and rescue operations.**
- Assumes constant heading, speed, and altitude; no maneuvering is modeled
- Wind drift is a simplified heuristic (15% drift factor), not an aerodynamic model
- Results are labelled **Simulated** in the app
- Requires internet access for map tiles

## 🗺️ Roadmap

- [ ] Probability-based search areas instead of a single polygon
- [ ] Better drift modelling for sea searches (currents and leeway)
- [ ] Multi-aircraft and multi-asset coordination
- [ ] Real-time weather and sea-state overlays
- [ ] Exportable mission reports
- [ ] Offline-friendly mode for field use

## 🤝 Contributing

Contributions, issues, and feature requests are welcome.

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m "Add your feature"`
4. Push the branch: `git push origin feature/your-feature`
5. Open a pull request

## 📄 License

Distributed under the MIT License. See [`LICENSE`](./LICENSE) for details.

## 👤 Author

**[Your Name]**

[LinkedIn](https://linkedin.com/in/your-profile) · [GitHub](https://github.com/your-username)

---

<div align="center">

*Built during a hackathon with [Bolt](https://bolt.new). Thank you for checking out AEROSAR.*

</div>
