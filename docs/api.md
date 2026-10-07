# API

Base URL: `http://localhost:8080/api` with docker compose (`http://localhost:5001/api`
when the API runs directly).

## Conventions

- **Authentication** — `POST /auth/login` (or `/auth/register`) sets an
  `httpOnly` `token` cookie that the browser sends automatically. API clients
  can instead send the `token` returned by login as `Authorization: Bearer <token>`.
- **Access levels** used below: *public* (no session), *user* (any logged-in
  account), *self* (the account in the URL, or an admin) and *admin*.
- **Errors** are JSON: `{ "error": "message", "details": { ... } }`. Validation
  errors are `400` with one message per field in `details`; duplicates are
  `409`; a missing or expired session is `401`; insufficient rights or a
  blocked account is `403`; too many login attempts is `429`.
- `POST`/`PUT`/`PATCH`/`DELETE` requests that carry an `Origin` header must
  come from an origin listed in `CORS_ORIGINS` (`403` otherwise).
- Changing the password ends every other session (tokens are tied to it).
- Request bodies are JSON (max 1 MB). Unknown fields are ignored: only the
  fields listed for an endpoint are written, so `role` or `status` cannot be
  set through profile or registration requests.

## Health

| Method | Path | Access | Description |
| --- | --- | --- | --- |
| GET | `/health` | public | `{ status: "ok", sandboxProvider }` once the database answers |

## Authentication — `/auth`

| Method | Path | Access | Body / description |
| --- | --- | --- | --- |
| POST | `/auth/register` | public, rate limited | `username`, `email`, `password`, `full_name?` → `201 { user }` and a session |
| POST | `/auth/login` | public, rate limited | `email` (case-insensitive), `password` → `{ token, user }` |
| POST | `/auth/logout` | public | Clears the session cookie |
| GET | `/auth/profile` | user | `{ user }` |
| PATCH | `/auth/profile` | user | `username?`, `email?`, `full_name?` |
| POST | `/auth/change-password` | user, rate limited | `currentPassword`, `newPassword` |

Usernames are 3–30 characters (`A–Z a–z 0–9 _ . -`); passwords 6–72 characters.

## Trainings — `/trainings`

| Method | Path | Access | Description |
| --- | --- | --- | --- |
| GET | `/trainings` | user | Catalog with `category`, `chapterCount`, `instructionCount`, `isEnrolled`, `isCompleted`, `progress` |
| GET | `/trainings/enrollments` | user | The user's enrollments with progress |
| GET | `/trainings/:id` | user | Training with ordered `chapters[].instructions[]` (markdown `content`, `achievements`, `completed`) and `progress` |
| POST | `/trainings/:id/enroll` | user | Enrolls and starts provisioning the sandbox → `201 { enrollment: { enrollment, sandbox, sandboxError } }` |
| POST | `/trainings/:id/complete` | user | Marks the training complete (`409` while instructions remain) |
| GET | `/trainings/:id/chapters` | user | Ordered chapters |
| GET | `/trainings/:id/chapters/:chapterId` | user | One chapter |
| GET | `/trainings/:id/sandbox` | user | The user's sandbox (see below) |
| POST | `/trainings/:id/sandbox` | user | Create / retry the sandbox; `{ "recreate": true }` replaces a running one → `202` |
| DELETE | `/trainings/:id/sandbox` | user | Delete the sandbox VM |
| GET | `/trainings/:id/enrollments` | admin | Enrollments of a training |
| POST, PUT, DELETE | `/trainings[/:id]` | admin | Same as the `/admin/trainings` routes |

### Sandbox object

```json
{
  "id": 12,
  "trainingId": "database-management-101",
  "provider": "gcp",
  "vmStatus": "running",
  "errorMessage": null,
  "accessUrl": "http://203.0.113.10:9000",
  "accessToken": "…",
  "createdAt": "…",
  "updatedAt": "…"
}
```

`vmStatus` is `creating` → `running`, or `error` (with `errorMessage`), or
`deleted`. While a previous operation on the sandbox is still finishing,
creating it again answers `409`. Removing an enrollment or blocking a user
deletes their sandboxes. Provisioning happens in the background: poll the sandbox until it
leaves `creating`. `accessUrl` and `accessToken` are only set while running and
only returned to the owner. The browser passes the token to the sandbox
service as the Socket.IO `auth.token` and as the `x-sandbox-token` header for
its HTTP endpoints.

## Learning progress

| Method | Path | Access | Description |
| --- | --- | --- | --- |
| POST | `/instructions/:id/complete` | user (enrolled) | Records the completion → `{ completion: { newAchievements, chapterCompleted, trainingCompleted, progress } }`. Idempotent. |
| DELETE | `/instructions/:id/complete` | user (enrolled) | Marks the instruction not completed (earned achievements are kept) |
| POST | `/chapters/:id/complete` | user (enrolled) | Records the chapter (`409` with `details.remaining` while instructions remain) |
| GET | `/users/:id/stats` | self | Totals, per-training progress, achievements, recent activity and a 14-day activity series |
| GET | `/users/:id/achievements` | self | Earned achievements with `earned_at` |
| GET | `/users/:id/enrollments` | self | Enrollments with progress |

The user is always taken from the session; a `userId` in the body is ignored.

## Content (read)

| Method | Path | Access |
| --- | --- | --- |
| GET | `/categories`, `/categories/:id`, `/categories/:id/trainings` | public |
| GET | `/chapters`, `/chapters/:id`, `/chapters/:id/instructions` | public |
| GET | `/chapters/:id/writeups` | user |
| GET | `/instructions`, `/instructions/:id` | public |
| GET | `/achievements`, `/writeups`, `/sandboxes`, `/images` (and `/:id`) | user |
| GET | `/writeups/:id/download` | user |

## Users — `/users`

| Method | Path | Access | Description |
| --- | --- | --- | --- |
| GET | `/users` | admin | All users |
| GET | `/users/:id` | self | |
| PUT | `/users/:id` | self | `username?`, `email?`, `full_name?` (admins may also set `password`) |
| DELETE | `/users/:id` | self | Deletes the account, its progress and its sandbox VMs (admins cannot delete themselves here) |
| POST | `/users/:id/profile-image` | self | `multipart/form-data` with an `image` field (jpg, png, gif, webp; 5 MB) |
| DELETE | `/users/:id/profile-image` | self | Removes the avatar |
| POST | `/users/:id/achievements` | admin | Awards `achievementId` manually |

## User sandboxes — `/user-sandboxes`

All routes act on the logged-in user's sandboxes only.

| Method | Path | Description |
| --- | --- | --- |
| GET | `/user-sandboxes` | All of the user's sandboxes |
| GET | `/user-sandboxes/training?trainingId=` | One sandbox |
| POST | `/user-sandboxes` | `trainingId` → create (enrollment required) |
| DELETE | `/user-sandboxes` | `trainingId` → delete |
| POST | `/user-sandboxes/:id/recreate` | Replace the VM |
| POST | `/user-sandboxes/:id/refresh-ip` | Re-read the VM's external IP |

## Administration — `/admin` (admin only)

| Method | Path | Description |
| --- | --- | --- |
| GET | `/admin/dashboard/stats` | Counts, completion rate, popular trainings, recent enrollments |
| GET | `/admin/users` | Users with enrollment and achievement counts |
| POST | `/admin/users/:userId/block`, `/unblock` | Blocking ends the user's sessions immediately |
| PUT | `/admin/users/:userId/role` | `{ "role": "user" \| "admin" }` (not your own) |
| GET, DELETE | `/admin/enrollments[/:id]` | Enrollments |
| POST, PUT, DELETE | `/admin/categories[/:id]` | `name`, `description` |
| POST, PUT, DELETE | `/admin/trainings[/:id]` | `id`, `name`, `slug`, `description`, `image_file_path`, `category_id`, `level`, `estimated_minutes`, `sandbox_template` |
| POST, PUT, DELETE | `/admin/chapters[/:id]` | `id`, `name`, `description`, `training_id`, `position` (defaults to last) |
| POST, PUT, DELETE | `/admin/instructions[/:id]` | `id`, `name`, `description`, `content`, `chapter_id`, `position` (defaults to last) |
| POST, PUT, DELETE | `/admin/achievements[/:id]` | `id`, `name`, `description`, `instruction_id`, `icon`, `points` |
| POST, PUT, DELETE | `/admin/writeups[/:id]`, `/admin/sandboxes[/:id]` | |
| POST | `/static-images/upload`, `/static-images/upload-multiple` | Image uploads (`image` / `images` fields) → `{ path, url }` |
| GET, DELETE | `/static-images/list`, `/static-images/:filename` | |
| POST | `/machines` | Creates the VM the sandbox image is built from |

The plain content routes (`POST /categories`, `PUT /chapters/:id`, …) are
also admin-only.
