# Overview

https://github.com/user-attachments/assets/f06f87ed-5144-4b04-b7b1-9c8910569902

# Velox Academy

Velox Academy is a comprehensive online learning platform designed for technical training with hands-on sandbox environments. The platform provides interactive coding experiences with real-time virtual machines, making it ideal for cybersecurity, web development, data science, and database management courses.

## 🏗️ Architecture

The project consists of three main components:

- **Backend**: Node.js/Express API server with PostgreSQL database
- **Frontend**: Next.js React application with Mantine UI
- **VM Image**: Virtual machine service for sandbox environments

## 🚀 Features

- **Interactive Learning**: Step-by-step instructions with hands-on coding exercises
- **Sandbox Environments**: Real-time virtual machines powered by Google Cloud Platform
- **Course Management**: Organized categories, trainings, chapters, and achievements
- **User Management**: Authentication, progress tracking, and user sandboxes
- **Admin Dashboard**: Platform statistics, user management (roles, blocking) and a curriculum editor with markdown preview
- **Real-time Terminal**: In-browser terminal access to virtual environments

## 📁 Project Structure

```
velox-academy/
├── backend/           # Express.js API server
│   ├── app/          # Main application code
│   │   ├── controllers/  # Route handlers
│   │   ├── models/       # Database models (Objection.js)
│   │   ├── routes/       # API routes
│   │   ├── services/     # Business logic
│   │   └── utils/        # Utility functions
│   └── umlDiagram.puml  # System architecture diagram
├── frontend/         # Next.js React application
│   └── app/          # Next.js app directory
│       └── src/
│           ├── app/          # Routes: (auth) login/register, (dashboard) catalog,
│           │                 # statistics, settings, admin; (workspace) training
│           ├── components/   # UI components (Workspace, Admin, Catalog, ...)
│           └── lib/          # API client, Redux store, helpers
└── vm-image/         # Virtual machine service
    ├── database/     # VM database setup
    └── user/         # User environment files
```

## 🛠️ Technology Stack

### Backend

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Objection.js with Knex.js
- **Authentication**: JWT with bcrypt
- **Cloud Services**: Google Cloud Platform (Compute Engine, Storage)
- **File Upload**: Multer
- **Containerization**: Docker

### Frontend

- **Framework**: Next.js 14
- **UI Library**: Mantine
- **State Management**: Redux Toolkit
- **Code Editor**: Monaco Editor
- **Terminal**: XTerm.js
- **HTTP Client**: Axios
- **Styling**: CSS Modules with PostCSS

### VM Service

- **Runtime**: Node.js
- **Framework**: Express.js
- **Real-time Communication**: Socket.io
- **Process Management**: node-pty
- **Database**: MySQL2
- **File Watching**: Chokidar

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- Docker and Docker Compose
- PostgreSQL
- Google Cloud Platform account (for VM services)

### Installation

**Clone the repository**

```bash
git clone <repository-url>
cd velox-academy
```

### Running with Docker

1. **Create Docker network**

   ```bash
   docker network create velox-network
   ```

2. **Start Backend Services**

   ```bash
   cd backend/app
   docker compose up -d
   ```

3. **Start Frontend**

   ```bash
   cd frontend
   make dev
   ```

4. **Start the sandbox service** (the code learners run in, with the sample MySQL database)
   ```bash
   cd vm-image/.docker.dev
   docker compose up -d
   ```

   In development the API uses the `local` sandbox provider: every learner is
   connected to this service on `http://localhost:9000`, so no Google Cloud
   account is needed. This compose file sets `ALLOW_NO_TOKEN=true`; to require
   a token instead, start both compose projects with the same `SANDBOX_TOKEN`
   environment variable.

### Running Locally

1. **Start PostgreSQL database** and point the API at it (see [docs/database.md](docs/database.md#configuration)):

   ```bash
   export DB_HOST=localhost DB_NAME=velox DB_USER=postgres DB_PASSWORD=postgres
   ```

2. **Start Backend** (migrations and seeds run automatically on startup)

   ```bash
   cd backend/app
   cp .env.example .env   # optional, every variable has a development default
   npm install
   npm run dev
   ```

3. **Start Frontend**

   ```bash
   cd frontend/app
   npm run dev
   ```

4. **Start VM Service** (needs MySQL with `vm-image/database/sample.sql` loaded)
   ```bash
   cd vm-image
   ALLOW_NO_TOKEN=true npm run dev   # or SANDBOX_TOKEN=... matching the API's LOCAL_SANDBOX_TOKEN
   ```

   Without a token (from `SANDBOX_TOKEN` or the VM's metadata) the service
   refuses every connection unless `ALLOW_NO_TOKEN=true`.

### Running the tests

The backend tests run against a real PostgreSQL database (`velox_test`, created
and reset automatically):

```bash
cd backend/app
DB_HOST=localhost npm test
```

CI (`.github/workflows/ci.yml`) runs them on every pull request, together with
the migration checks.

## 🔧 Configuration

### Environment Variables

Create `.env` files in the respective directories:

**Backend (`backend/app/.env`)** — copy `backend/app/.env.example`, which
documents every variable. The important ones:

```env
# Required in production (generate with `openssl rand -hex 32`)
JWT_SECRET=your-jwt-secret
# Origins allowed to call the API with cookies
CORS_ORIGINS=http://localhost:3000
# gcp | local | disabled (default: local in development, gcp in production)
SANDBOX_PROVIDER=local
LOCAL_SANDBOX_URL=http://localhost:9000
```

`.env` is not committed: the previously committed `JWT_SECRET` must be
considered public, so set a new one in every deployed environment.

**Frontend** — development defaults are committed in
`frontend/app/.env.development`; override them in `frontend/app/.env.local`
(not committed, see `frontend/app/.env.example`):

```env
NEXT_PUBLIC_BASE_URL=http://localhost:8080/api
NEXT_PUBLIC_IMAGE_SERVER=http://localhost:8080/static
```

The code editor (Monaco) is served by the app itself from `public/monaco`,
copied from `node_modules` before `dev` and `build`, so it also works on
networks that block public CDNs.

### Google Cloud Setup

Only needed for `SANDBOX_PROVIDER=gcp`, which creates one Compute Engine VM per
learner and training from an instance template.

1. Create a Google Cloud Project
2. Enable Compute Engine API
3. Create a service account with appropriate permissions
4. Download credentials JSON file
5. Place credentials in `backend/app/application_default_credentials.json`
6. Build the sandbox image from `vm-image/` and create an instance template
   from it; set `GCP_PROJECT_ID`, `GCP_ZONE` and `GCP_INSTANCE_TEMPLATE`
   (a training can override the template with its `sandbox_template` column).

Each VM receives a random access token through the `velox-sandbox-token`
instance metadata key, and the sandbox service refuses connections without it.
Rebuild the image from the current `vm-image/` code to enable this check (and
do not set `ALLOW_NO_TOKEN` on VMs).

## 📊 Database Schema

The platform uses PostgreSQL with the following main entities (full ER diagram,
deletion rules and commands in [docs/database.md](docs/database.md)):

- **Users**: Accounts with a `user` or `admin` role and an `active`/`blocked` status
- **Categories**: Course categories (e.g., Cybersecurity, Web Dev)
- **Trainings**: Individual courses within categories, with level and duration
- **Chapters**: Ordered course sections
- **Instructions**: Ordered, markdown-based learning steps
- **Sandboxes / User Sandboxes**: Sandbox configuration and each learner's VM
- **WriteUps**: Chapter write-ups and their files
- **Achievements**: Badges awarded for completing instructions
- **Enrollments & progress**: Enrollments, completed instructions/chapters and earned achievements

Migrations run when the API starts; you can also manage the database from `backend/app`:

```bash
npm run db:migrate    # apply pending migrations
npm run db:seed       # demo catalog + admin user (idempotent)
npm run db:status     # applied / pending migrations
npm run db:reset      # rollback everything, migrate and seed
```

In development the seeded admin account is `contact.ilhanozkan@gmail.com` /
`1234` (override with `ADMIN_EMAIL` / `ADMIN_PASSWORD` before the first start).
Existing installations keep this account: change its password after upgrading.

## 🔗 API Endpoints

The backend provides RESTful APIs for the following areas; see
[docs/api.md](docs/api.md) for every route, its access level and payloads.

- `/api/auth` - Registration, login, logout, profile and password
- `/api/trainings` - Catalog, curriculum with progress, enrollment and sandboxes
- `/api/instructions`, `/api/chapters` - Content and completion tracking
- `/api/users` - Accounts, statistics, achievements and avatars
- `/api/user-sandboxes` - The learner's sandbox VMs
- `/api/categories`, `/api/achievements`, `/api/writeups`, `/api/sandboxes`, `/api/images` - Content
- `/api/admin` - Dashboard statistics, user management and content management
- `/api/health` - Health check

### Security

- Sessions use an `httpOnly`, `SameSite=Lax` cookie (`Secure` in production);
  `Authorization: Bearer` is accepted for API clients.
- Every write to course content and every `/api/admin` route requires the
  `admin` role; users can only read and change their own account.
- Blocking a user or changing a role takes effect on the next request.
- Login, registration and password changes are rate limited per IP.
- Uploads are restricted to images with random file names; file names in
  requests cannot escape the images directory.
- Sandbox VMs require a per-sandbox access token and refuse all connections
  when they have none.
- Changing a password ends the account's other sessions; state-changing
  requests from origins outside `CORS_ORIGINS` are rejected.

## 🎯 Key Features

### Learning Management

- Structured courses with categories and chapters
- Progressive learning with step-by-step instructions
- Achievement system for motivation
- Progress tracking and a personal statistics page

### Sandbox Environments

- On-demand virtual machine creation
- Real-time terminal access in browser
- File system management
- Database environments for practice

### User Experience

- Modern, responsive UI with Mantine components
- Code editor with syntax highlighting, autosave and open-file tabs
- Query results as tables, readable program and SQL errors

---

Built with ❤️ for interactive technical education
