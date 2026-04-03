# Notely

Notely is a collaborative note app with rich‑text editing, shared notes, pins (per user), and fast search.

**Monorepo layout**
- `apps/` – React + Vite frontend
- `api/` – Node/Express + MongoDB backend

---

## Features
- Create normal notes or todo lists
- Full‑screen rich‑text editor
- Share notes and collaborate
- Per‑user pinning
- Search + filters + pagination

---

## Quick Start

### 1) Backend (API)
```bash
cd api
npm install
```

Create a `.env` file in `api/`:
```bash
PORT=4000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:5173
```

Run the API:
```bash
npm start
```

### 2) Frontend (App)
```bash
cd apps
npm install
```

Create a `.env` file in `apps/`:
```bash
VITE_API_URL=http://localhost:4000
```

Run the app:
```bash
npm run dev
```

Open `http://localhost:5173`

---

## Scripts

**API**
- `npm start` – start server

**App**
- `npm run dev` – start Vite dev server
- `npm run build` – build for production
- `npm run preview` – preview production build

---

## Notes
- The app stores rich‑text as HTML. Inline editing uses plain text; full‑screen uses a rich‑text editor.
- Pins are per‑user, not global.

---



