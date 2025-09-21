## Run Gamesdom Locally (Frontend + Backend)

This project is plain HTML/CSS/JS for the frontend and a Node.js/Express API for the backend.

1) Prerequisites

Node.js ≥ 20

npm (bundled with Node)

Optional for SMS: Twilio credentials

(Recommended) A tiny static server: http-server

Install http-server globally (or use npx later):

npm i -g http-server

2) Backend (API)

From the project root:

cd api
npm install


Create api/.env:

# --- Required for local ---
NODE_ENV=development
PORT=5362

# If you use the proxy method below, you don't need CORS.
# If you call the API directly from the browser, set:
# CORS_ORIGIN=http://localhost:8080

# Mongo (adjust if needed)
MONGO=mongodb://localhost:27017/gamesdom

# JWT
JWT_SECRET=change-me-very-long-random

# Phone default country code
DEFAULT_CC=+1

# Twilio (optional in dev; offline OTP still works)
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_FROM=

# MTN MoMo sandbox (optional in dev)
MOMO_ENV=sandbox
MOMO_BASE=https://sandbox.momodeveloper.mtn.com
MOMO_SUB_KEY_COLLECTION=
MOMO_API_USER_ID=
MOMO_API_KEY=
MOMO_CALLBACK_URL=http://localhost:5362/api/payments/mtn/callback


Run the API:

npm start
# API is now on http://localhost:5362

3) Frontend
Option A (Recommended): Use a proxy so /api/* goes to the backend

From the project root (where index.html lives):

http-server -p 8080 --proxy http://localhost:5362
# or without global install:
# npx http-server -p 8080 --proxy http://localhost:5362


Now open:

http://localhost:8080


Why this works: the frontend calls /api/... (relative path). The static server serves files and proxies any unknown route (like /api/...) to http://localhost:5362, avoiding CORS issues.

Option B: Call the API directly (no proxy)

Set CORS_ORIGIN=http://localhost:8080 in api/.env and restart the API.

Temporarily change platform/platform.js post() helper to prepend the API base:

- async function post(url, body) {
-   const r = await fetch(url, {
+ const API_BASE = 'http://localhost:5362'; // local only
+ async function post(url, body) {
+   const r = await fetch(API_BASE + url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(state.user.token ? { Authorization: 'Bearer ' + state.user.token } : {}) },
      body: JSON.stringify(body)
    });
    return r.json();
  }


Then serve the frontend (no proxy needed):

http-server -p 8080
# or: npx http-server -p 8080


Open http://localhost:8080.

4) Quick Checks

Home page: http://localhost:8080 renders, shows points/level/streak.

Login modal: Click Login, enter phone, Send OTP, Verify.

Without Twilio, “offline login” still works for dev; it will sync when online.

Roulette: One spin/day (client enforces; backend can also enforce when logged in).

Payments (optional): If testing MoMo sandbox, initiate a payment and watch the console/API logs.

5) Common Issues

CORS error:
Use Option A (proxy), or set CORS_ORIGIN=http://localhost:8080 and use Option B.

API not reachable:
Ensure API is on http://localhost:5362 and the frontend proxy is running on port 8080.

Mongo connection error:
Update MONGO in .env to a reachable instance (local Mongo or a test cluster).

OTP SMS not received (dev):
Twilio creds are optional; offline login will still proceed for local testing.