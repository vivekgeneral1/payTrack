<div align="center">

# 💸 PayTrack

**Track payments. Manage subscriptions. Never miss a renewal again.**

A full-stack, multi-user app for personal payment tracking, subscription lifecycle management, invoice storage, and bill reminders — with Razorpay checkout, Google Calendar sync, and a dashboard that actually looks good.

[![Java](https://img.shields.io/badge/Java-21-ED8B00?logo=openjdk&logoColor=white)](https://openjdk.org/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.3-6DB33F?logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-7-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

</div>

---

## ✨ What's inside

| | |
|---|---|
| 🔐 **Auth** | Email/password signup & login, JWT access + rotating refresh tokens |
| 💳 **Payments** | Create, edit, mark-paid, filter by status/category/date range |
| 🔁 **Subscriptions** | Full lifecycle — active, paused, cancelled, expired — with cancellation history |
| 🧾 **Invoices** | Upload/download PDF invoices via S3-compatible object storage with presigned URLs |
| 🔔 **Notifications** | In-app bell + email, with a dedup'd daily reminder scheduler (7/3/1-day offsets) |
| 📅 **Google Calendar** | One-click OAuth connect, auto-synced renewal/due-date events |
| 💰 **Razorpay** | In-app checkout *and* webhook-verified payment reconciliation |
| 📊 **Dashboard** | Animated stat tiles, spending trends, category breakdown, upcoming renewals |
| 🎨 **Frontend polish** | Glassmorphism UI, dark/light themes, `⌘K` command palette, confetti on success |

---

## 🧱 Tech stack

**Backend** — Java 21 · Spring Boot 3.3 · Spring Security (JWT) · Spring Data JPA · Flyway · PostgreSQL 16 · AWS SDK v2 (S3) · Razorpay Java SDK · Google Calendar API

**Frontend** — React 19 · Vite 8 · TypeScript · Tailwind CSS v4 · TanStack Query · Zustand · Framer Motion · Recharts · React Hook Form + Zod

**Infra (local dev)** — Docker Compose: PostgreSQL · LocalStack (S3-compatible storage) · MailHog (SMTP sandbox)

---

## 📋 Prerequisites

Make sure you have these installed before you start:

- **Java 21** ([Temurin](https://adoptium.net/) recommended)
- **Maven 3.9+** (or use the included `./mvnw` wrapper if present)
- **Node.js 20.19+** and npm
- **Docker** & **Docker Compose**
- **Git**

> 💡 Razorpay and Google Calendar integrations are optional for local exploration — the app runs fine without real credentials for those; only checkout and calendar sync will be inactive.

---

## 🚀 Quick start

### 1. Clone the repo

```bash
git clone https://github.com/vivekgeneral1/payTrack.git
cd payTrack
```

### 2. Configure environment variables

```bash
cp .env.example .env
```

Open `.env` and at minimum change `JWT_SECRET` and `TOKEN_ENCRYPTION_KEY` to your own random strings. Everything else has sane local defaults. See the [Environment variables](#-environment-variables) section below for what each one does.

### 3. Start the infrastructure (Postgres, object storage, mail sandbox)

```bash
docker compose up -d
```

This brings up:

| Service | Purpose | Port |
|---|---|---|
| `postgres` | Primary database | `5434` → `5432` |
| `object-storage` | S3-compatible storage for invoice PDFs (LocalStack) | `4566` |
| `mailhog` | Catches outgoing emails locally — view them at [localhost:8025](http://localhost:8025) | `1025` (SMTP), `8025` (Web UI) |

Check everything is healthy:

```bash
docker compose ps
```

### 4. Run the backend

```bash
cd backend
mvn spring-boot:run
```

Flyway migrates the schema automatically on startup. The API comes up at **http://localhost:8080**, with Swagger UI at **http://localhost:8080/swagger-ui.html**.

Verify it's alive:

```bash
curl http://localhost:8080/actuator/health
```

### 5. Run the frontend

In a new terminal:

```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173** in your browser. 🎉

### 6. (Optional) Load demo data

Want to see the dashboard with real-looking data instead of an empty state? Run the seeder — it signs up a demo user through the live API and fills in subscriptions, payments, and an invoice:

```bash
python3 scripts/seed_demo_data.py
```

Then log in with:

```
email:    demo@paytrack.app
password: Demo@12345
```

> ⚠️ The seeder isn't idempotent — running it more than once will create duplicate records for the same demo user.

---

## 🔑 Environment variables

All variables live in `.env` (copied from `.env.example`). The backend reads them via Spring's `${VAR:default}` placeholders, so nothing here is hardcoded.

<details>
<summary><strong>Database</strong></summary>

| Variable | Description | Local default |
|---|---|---|
| `POSTGRES_DB` | Database name | `paytrack` |
| `POSTGRES_USER` | Database user | `paytrack` |
| `POSTGRES_PASSWORD` | Database password | `paytrack` |

</details>

<details>
<summary><strong>Object storage (invoice PDFs)</strong></summary>

| Variable | Description | Local default |
|---|---|---|
| `MINIO_ROOT_USER` / `MINIO_ROOT_PASSWORD` | Access key / secret for the S3-compatible store | `paytrack` / `paytrack123` |
| `MINIO_ENDPOINT` | S3 API endpoint | `http://localhost:4566` |
| `MINIO_BUCKET` | Bucket for uploaded invoices | `paytrack-invoices` |

Local dev uses [LocalStack](https://www.localstack.cloud/)'s S3 service as a drop-in MinIO/AWS S3 substitute — same API, zero backend code differences. Point these at real MinIO or AWS S3 in any environment where that's available.

</details>

<details>
<summary><strong>Auth & security</strong></summary>

| Variable | Description |
|---|---|
| `JWT_SECRET` | Signing secret for access/refresh tokens — **change this** |
| `JWT_ACCESS_TTL_MINUTES` | Access token lifetime (default `15`) |
| `JWT_REFRESH_TTL_DAYS` | Refresh token lifetime (default `14`) |
| `TOKEN_ENCRYPTION_KEY` | AES-256-GCM key used to encrypt stored Google OAuth tokens — **change this** |

</details>

<details>
<summary><strong>Email (MailHog locally)</strong></summary>

| Variable | Description |
|---|---|
| `SMTP_HOST` / `SMTP_PORT` | SMTP server — defaults to local MailHog |
| `SMTP_USERNAME` / `SMTP_PASSWORD` | Leave blank for MailHog; set for a real SMTP provider |
| `MAIL_FROM` | From address on outgoing emails |

</details>

<details>
<summary><strong>Razorpay (optional)</strong></summary>

Get test keys from your [Razorpay Dashboard](https://dashboard.razorpay.com/) → Settings → API Keys.

| Variable | Description |
|---|---|
| `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` | Test-mode API credentials |
| `RAZORPAY_WEBHOOK_SECRET` | Webhook signing secret (set when you configure a webhook URL in the dashboard) |
| `VITE_RAZORPAY_KEY_ID` | Public key id, exposed to the frontend for Checkout.js |

To test webhooks locally, tunnel your backend with [ngrok](https://ngrok.com/) or a Cloudflare Tunnel and point Razorpay's webhook config at the tunnel URL.

</details>

<details>
<summary><strong>Google Calendar (optional)</strong></summary>

Create OAuth credentials in [Google Cloud Console](https://console.cloud.google.com/) (enable the Calendar API, add `http://localhost:8080/api/integrations/google/callback` as an authorized redirect URI).

| Variable | Description |
|---|---|
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | OAuth client credentials |
| `GOOGLE_REDIRECT_URI` | Must match the URI registered in Google Cloud Console |

</details>

<details>
<summary><strong>Frontend</strong></summary>

| Variable | Description |
|---|---|
| `VITE_API_BASE_URL` | Backend API base URL (default `http://localhost:8080/api`) |
| `VITE_RAZORPAY_KEY_ID` | Same public Razorpay key as above |

</details>

---

## 📁 Project structure

```
payTrack/
├── docker-compose.yml       # Postgres, object storage, MailHog
├── .env.example             # All configuration, documented
├── scripts/
│   └── seed_demo_data.py    # Populates a demo user with sample data
├── backend/                 # Spring Boot API
│   └── src/main/java/com/paytrack/
│       ├── auth/            # Signup, login, JWT refresh
│       ├── payment/         # Payment CRUD + mark-paid
│       ├── subscription/    # Subscription lifecycle + cancellation history
│       ├── invoice/         # PDF upload/download via object storage
│       ├── notification/    # In-app + email notifications
│       ├── scheduler/       # Daily reminder job
│       ├── dashboard/       # Analytics endpoints
│       └── integration/     # Razorpay, Google Calendar, email, storage
└── frontend/                # React + Vite SPA
    └── src/
        ├── features/        # One folder per domain (payments, subscriptions, ...)
        ├── components/      # Shared UI (GlassCard, StatTile, modals, charts)
        ├── store/            # Zustand stores (auth, theme, UI)
        └── lib/              # API client, query client, utilities
```

---

## 🛠️ Useful commands

```bash
# Backend
cd backend
mvn spring-boot:run          # run the API
mvn test                     # run backend tests
mvn -q compile                # quick compile check

# Frontend
cd frontend
npm run dev                  # start dev server
npm run build                # type-check + production build
npm run lint                 # lint

# Infra
docker compose up -d         # start Postgres / storage / mail sandbox
docker compose down          # stop everything
docker compose down -v       # stop and wipe all data volumes
```

---

## 🩺 Troubleshooting

- **Port 5434 already in use** — PayTrack maps Postgres to `5434` (not the default `5432`) specifically to avoid clashing with a locally installed Postgres. If something else is already on `5434`, change the mapping in `docker-compose.yml` and update `application.yml` / `.env` to match.
- **Backend can't reach the database** — make sure `docker compose ps` shows `postgres` as `healthy` before starting the backend.
- **Invoice upload/download fails** — check that the `object-storage` container is healthy; the backend auto-creates its bucket on startup.
- **Emails never arrive** — that's expected locally; they land in MailHog instead. Check [http://localhost:8025](http://localhost:8025).

---

<div align="center">

Built with ☕, 🫶, and an unreasonable amount of glassmorphism.

</div>
