<<<<<<< HEAD
# MediFlow – Appointment Booking System (Full Stack)

MediFlow is a full-stack appointment booking platform that lets **customers** book
appointments with **service providers** based on availability, with a full
**administrator** back office. It implements role-based access control, JWT
authentication, appointment scheduling with conflict detection, notifications, and
slot recommendations.

---

## 1. Architecture

```
frontend/        React 19 + Vite single-page app (the UI)
CORESERVICES_/   Spring Boot 3 / Java 21 REST API  ← primary backend
gateway/         FastAPI reverse-proxy (used for the hosted deployment)
taskservices/    Node.js helper service (auxiliary)
```

The React app talks directly to the **Spring Boot core service** when running
locally. `frontend/src/lib.js` automatically rewrites API calls to
`http://localhost:8001` (and maps `/authservice/*` → `/user/*`) when the host is
`localhost`, so **you only need the frontend + core service + PostgreSQL to run the
full application locally.** The `gateway` and `taskservices` directories are part of
the cloud deployment topology and are optional for local development.

### Tech stack

| Layer     | Technology |
|-----------|------------|
| Frontend  | React.js, Vite, React Router, JavaScript, HTML5, CSS3 |
| Backend   | Spring Boot 3, Java 21, Spring Data JPA, JJWT (JWT) |
| Database  | PostgreSQL |
| Auth      | JWT (HS256), role-based access control |

---

## 2. Prerequisites

- **Java 21+** (the core service targets Java 21)
- **PostgreSQL 14+**
- **Node.js 18+** and npm
- Maven is **not** required globally — the project ships the Maven Wrapper (`mvnw`).

---

## 3. Database setup

Create a database named `mth` (the default in
`CORESERVICES_/src/main/resources/application.properties`):

```bash
createdb mth
```

The application creates all tables automatically on first start
(`spring.jpa.hibernate.ddl-auto=update`) and seeds roles, menus, role mappings and
sample accounts via `DatabaseSeeder`.

> **Manual setup (optional):** reference SQL is provided in
> `CORESERVICES_/src/main/resources/schema.sql` (DDL) and `data.sql` (sample data).
> These are **not** auto-run for PostgreSQL; use them only if you prefer to manage
> the schema by hand:
> ```bash
> psql -d mth -f CORESERVICES_/src/main/resources/schema.sql
> psql -d mth -f CORESERVICES_/src/main/resources/data.sql
> ```

Update the datasource credentials in
`CORESERVICES_/src/main/resources/application.properties` to match your local
PostgreSQL user/password:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/mth
spring.datasource.username=postgres
spring.datasource.password=YOUR_PASSWORD
server.port=8001
```

---

## 4. Run the backend (Spring Boot core service)

```bash
cd CORESERVICES_
./mvnw spring-boot:run        # Windows: mvnw.cmd spring-boot:run
```

The API starts on **http://localhost:8001**. On first boot you'll see
`DATABASE SEEDING SUCCESSFUL` in the logs.

Swagger / OpenAPI UI is available at **http://localhost:8001/swagger-ui.html**.

To build a deployable WAR/JAR instead:

```bash
./mvnw clean package
```

---

## 5. Run the frontend (React + Vite)

```bash
cd frontend
npm install
npm run dev
```

Vite serves the app on **http://localhost:5173**. Open it in a browser and log in
with one of the sample accounts below. Because the host is `localhost`, the app
automatically targets the local Spring Boot service on port 8001.

Production build:

```bash
npm run build      # outputs to frontend/dist
npm run preview    # preview the production build locally
```

---

## 6. Sample login accounts

After first startup, the following accounts are available:

| Role     | Email                  | Password |
|----------|------------------------|----------|
| Customer | `mohith@example.com`   | `1`      |
| Provider | `premsai@example.com`  | `12`     |
| Admin    | `rakesh@example.com`   | `123`    |

Additional demo accounts (all password `password`):
`customer@booking.com`, `provider1@booking.com`, `provider2@booking.com`,
`admin@booking.com`.

---

## 7. User roles & features

**Customer** – register, log in, browse/search providers, view availability, book /
reschedule / cancel appointments, view appointment history, receive notifications,
and get slot recommendations.

**Service Provider** – manage profile and specialization, edit weekly availability,
view appointments, accept/reject/complete bookings, and see ratings.

**Administrator** – dashboard with totals, user management, provider management,
appointment oversight, and analytics. Menus are role-driven via the
`roles` / `menus` / `rolesmapping` tables (RBAC).

---

## 8. REST API overview

All endpoints are served by the core service. Authenticated requests pass the JWT in
a `Token` request header.

**Auth** (`/user`)
- `POST /user/signup` – register
- `POST /user/signin` – login (returns `jwt`)
- `POST /user/forgot-password` – reset password
- `GET  /user/rbac` – menus + display name for the logged-in role
- `GET  /user/profile` – current user profile
- `GET  /user/getallusers/{page}/{size}` – paginated users (admin)
- `POST /user/saveuser`, `PUT /user/updateuser/{id}`, `DELETE /user/deleteuser/{id}`, `GET /user/searchuser/{key}`

**Providers** (`/api/providers`)
- `GET /api/providers`, `GET /api/providers/{id}`, `GET /api/providers/profile`
- `POST /api/providers`, `PUT /api/providers/{id}`, `GET /api/providers/search/{key}`

**Appointments** (`/api/appointments`)
- `GET /api/appointments` (role-scoped), `POST /api/appointments` (book)
- `PUT /api/appointments/{id}` (reschedule), `PUT /api/appointments/{id}/status`
- `DELETE /api/appointments/{id}`, `GET /api/appointments/search/{key}`

**Notifications** (`/api/notifications`)
- `GET /api/notifications`, `PUT /api/notifications/{id}/read`

**Recommendations** (`/api/recommendations`)
- `GET /api/recommendations/{userId}`

> The frontend calls auth endpoints through the `/authservice/*` path; `lib.js`
> rewrites these to the core service's `/user/*` paths when running locally.

---

## 9. Deployment

**Database (PostgreSQL)** – provision a managed PostgreSQL instance (e.g. Render,
Supabase, Neon, RDS). Note its host, port, database name, username and password.

**Backend (Render or any container host)**
1. A `Dockerfile` is provided in `CORESERVICES_/`.
2. Set the production datasource via environment-aware properties (uncomment and edit
   the production `spring.datasource.url` / username / password lines in
   `application.properties`, or override them with `SPRING_DATASOURCE_*` environment
   variables).
3. Build with `./mvnw clean package` and run the resulting artifact, or deploy the
   Docker image. Expose the configured `server.port` (8001).

**Frontend (Vercel or Netlify)**
1. Set the project root to `frontend/`.
2. Build command: `npm run build`; output directory: `dist`.
3. Point the app at the deployed backend by editing `apibaseurl` in
   `frontend/src/lib.js` (it already defaults to the hosted gateway URL — change it
   to your backend's public URL).

**Gateway / task services (optional)** – `gateway/` (FastAPI) and `taskservices/`
(Node) each ship a `Dockerfile` for the hosted topology and can be deployed the same
way if you use the gateway-fronted architecture.

---

## 10. Project layout

```
Final/
├── README.md                     ← this file
├── frontend/                     React + Vite SPA
│   ├── src/
│   │   ├── App.jsx               auth screens (sign in / up / forgot)
│   │   ├── main.jsx              router
│   │   ├── lib.js                API helper + local/prod URL switching
│   │   └── components/           dashboards & feature views
│   └── package.json
├── CORESERVICES_/                Spring Boot core API
│   ├── src/main/java/mth/
│   │   ├── models/               JPA entities
│   │   ├── repository/           Spring Data repositories
│   │   ├── services/             business logic (incl. JWT + seeder)
│   │   └── controllers/          REST controllers
│   ├── src/main/resources/
│   │   ├── application.properties
│   │   ├── schema.sql            reference DDL
│   │   └── data.sql              reference sample data
│   └── pom.xml
├── gateway/                      FastAPI reverse proxy (deployment)
└── taskservices/                 Node helper service (deployment)
```
=======
# Appointment-booking-
>>>>>>> 1062d120778324c1c173ae10eb6e2d356e1cd87b
