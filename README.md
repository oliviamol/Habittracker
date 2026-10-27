# Habit Tracker API

A simple backend API built with Node.js, Express, and SQLite for tracking habits.

## Features

- **Authentication:** Every request needs a valid token in the `Authorization` header. If it's missing or invalid, the API returns a `401 Unauthorized` error.
- **Data Isolation:** Users can only see and manage their own habits. Everything is  strictly filtered by `user_id`.
- **Safe Retries (Idempotency):** The `POST /habits` route is safe against duplicate requests. 
  - **How repeats are recognized:** When you send a request, you must include an `idempotencyKey`. The server checks if that key already exists for your user. If you send the same request twice (for example,  if your connection dropped and you retried), it won't create a duplicate—it just returns the original result with a `200 OK`.
- **Validation:** If you miss required fields (like `name` or `frequency`), it returns a clear `400 Bad Request` error message.

## Test Accounts

You can use these tokens to test the API :

- **Alice:** `secret-token-alice`
- **Bob:** `secret-token-bob`

## API Endpoints

### 1. Get habits
- **GET** `/habits`
- **Header:** `Authorization: secret-token-alice`
- **Returns:** A list of habits belonging only to that user.

### 2. Create a habit
- **POST** `/habits`
- **Headers:** 
  - `Authorization: secret-token-alice`
  - `Content-Type: application/json`
- **Body:**
  ```json
  {
    "name": "Drink water",
    "frequency": "daily",
    "idempotencyKey": "some-unique-string-123"
  }
