# UWSD (delhack)

Monorepo for an AI-assisted campus security workflow: live recognition alerts, a web dashboard, a FastAPI backend with visitor QR flows, email notifications on critical events, and an Expo mobile app for guards (dashboard, outpass-style approvals, QR scanning).

## Repository layout

| Path | Role |
|------|------|
| `app/` | FastAPI application (`uvicorn app.main:app`) |
| `dashboard/` | Next.js monitoring UI |
| `realtime/` | Socket.IO server; relays `alert` events to clients |
| `mobile/` | Expo (React Native) guard app |
| `camera_stream.py` | Vision / camera loop (see run guide) |
| `stream_server.py` | Optional streaming helper |

## Prerequisites

- **Python 3** with `pip` (project often uses a conda env named `delhack`)
- **Node.js** and npm (for dashboard and realtime)
- **PostgreSQL** with pgvector (schema used by visitors/users; see `app/db/`)
- **Expo Go** on a phone (optional, for mobile)

## Configuration and secrets

Create a **`.env` file in the repository root** (it is gitignored). Never commit real credentials.

```bash
# Email alerts (RED incidents) — use an app password for Gmail, not your login password
SMTP_EMAIL=your-alert-address@gmail.com
SMTP_PASSWORD=your-app-specific-password

# Optional — wire in app/db if you move off defaults
# DATABASE_URL=postgresql+asyncpg://user:pass@localhost/uwsd
```

The backend loads this file via `python-dotenv` in `app/main.py`. `SMTP_PASSWORD` and related values must stay out of version control; the root `.gitignore` ignores `.env` and `.env.*` (with an optional committed `.env.example` template if you add one later).

## Quick start

For the full multi-process demo sequence, see **[RUN_GUIDE.md](./RUN_GUIDE.md)**. In short:

1. **Realtime** — `cd realtime && npm install && node server.js` (port **4000**)
2. **Dashboard** — `cd dashboard && npm install && npm run dev` (port **3000**)
3. **API** — install `requirements.txt`, then `uvicorn app.main:app --reload` (port **8000**)
4. **Mobile** — `cd mobile && npm install && npx expo start`  
   Set your machine’s LAN IP in the mobile app where `BACKEND_IP` / API URLs are defined (e.g. in `mobile/app/(tabs)/index.tsx` and `mobile/app/scanner.tsx`) so the phone can reach the API and socket server.
5. **Camera** — `python camera_stream.py` (with the same Python env as the API)

## API overview

- REST under `/api` (visitors, recognition, stats, etc.)
- Alert device registration under `/api/alerts/`
- CORS is permissive in development; tighten for production

## Security notes

- Treat **`.env`** like production secrets: restrict file permissions and rotate **SMTP** credentials if they were ever committed or leaked.
- Prefer **app passwords** (or OAuth) for SMTP, not your primary account password.
- Replace hardcoded LAN IPs in the mobile app with build-time env or a small config module before shipping.

## License

Add a license file if you intend to open-source or distribute this project.
