# Habit Tracker API & Web Interface

A full-stack habit tracking application built with Node.js (Express), SQLite, and a clean HTML/JS frontend. It features secure token-based authentication, user data isolation, and strict idempotency handling to prevent duplicate submissions on network retries.

---

## 1. Prerequisites

Ensure you have the following installed on your local machine before starting:
* **Node.js**: v18.x or v20.x (LTS recommended)
* **npm**: v9.x or newer (comes packaged with Node.js)
* **Git**: For cloning the repository

---

## 2. Environment Variables

This service can run locally without any configuration files. 

| Variable | Source / Where it comes from | Required? | Default Value (if missing) |
| :--- | :--- | :--- | :--- |
| `PORT` | Automatically set by hosting platforms (like Render) or custom-defined | **No** | `3000` |
| `NODE_ENV` | Environment mode (`development` or `production`) | **No** | `development` |

*Note: The application falls back gracefully to port `3000` if no environment variables are provided.*

---

## 3. Local Setup & Running (Under 20 Minutes)

Follow these steps in your terminal to clone, run, and test an endpoint:

1. **Clone the repository:**
   ```bash
   git clone https://github.com/YOUR_USERNAME/habittracker.git
   cd habittracker
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the backend server:**
   ```bash
   node server.js
   ```
   *You should see the console output:* `Server running on port 3000`

4. **Test an endpoint using cURL:**
   Open a separate terminal window and run the following command to fetch habits for the test user `alice`:
   ```bash
   curl -X GET http://localhost:3000/habits \
     -H "Authorization: Bearer secret-token-alice"
   ```
   *Expected Response (`200 OK`):*
   ```json
   {
     "habits": []
   }
   ```

---

## 4. API Endpoints Reference

All protected endpoints require a valid authorization header: `Authorization: Bearer <token>`.

### 1. Get All Habits
* **Path:** `GET /habits`
* **Auth:** Required (Bearer Token)
* **Request Body:** None
* **Possible Status Codes:**
  * `200 OK`: Returns the list of habits belonging to the authenticated user.
  * `401 Unauthorized`: Missing authorization header or invalid token.
  * `500 Internal Server Error`: Unexpected database or server failure.

### 2. Create a Habit (Idempotent)
* **Path:** `POST /habits`
* **Auth:** Required (Bearer Token)
* **Request Body (JSON):**
  ```json
  {
    "name": "Morning Run",
    "frequency": "daily",
    "idempotencyKey": "unique-key-abc-123"
  }
  ```
* **Possible Status Codes:**
  * `201 Created`: Habit successfully created.
  * `200 OK`: Duplicate request detected (same `idempotencyKey` reused). Returns the original result safely.
  * `400 Bad Request`: Validation failed (missing fields or incorrect data types).
  * `401 Unauthorized`: Invalid or missing token.
  * `500 Internal Server Error`: Server-side error.

---

## 5. Data Model Architecture

The database is managed locally via SQLite (`node:sqlite`). The schema consists of two core tables:

* **`users`**:
  * `id` (INTEGER, PK, Auto-increment)
  * `username` (TEXT, UNIQUE)
  * `token` (TEXT, UNIQUE)
* **`habits`**:
  * `id` (INTEGER, PK, Auto-increment)
  * `user_id` (INTEGER, FK referencing `users.id`)
  * `name` (TEXT)
  * `frequency` (TEXT)
  * `idempotency_key` (TEXT, UNIQUE)

---

## 6. What It Does Not Do & Known Limitations

* **No Password Recovery / Registration Flow**: The system uses pre-seeded static tokens (`secret-token-alice`, `secret-token-bob`) for testing purposes. There is no automated user sign-up or email password reset workflow.
* **No Multi-Instance Horizontal Scaling**: Because the database uses a local file (`habits.db` via SQLite), the application cannot run concurrently across multiple cloud containers (e.g., scaled instances on Render) without migrating to an external relational database like PostgreSQL.
* **No Pagination on `GET /habits`**: If a user creates thousands of items, the entire list is returned in a single JSON payload, which may impact performance at extreme scale.