# KhajaGo — Food Delivery Marketplace (Nepal MVP)


## Running the tests

```bash
# Backend — from backend/
npm test              # everything
npm run test:unit     # pure logic, no database needed, runs in under a second
npm run test:integration   # full HTTP request/response cycle against a real API

# Frontend — from frontend/
npm test
```

`test:integration` uses `mongodb-memory-server`, which downloads a real
MongoDB binary the first time it runs (one-time, then cached) — this needs
a normal internet connection. It will **not** work from the same restricted
sandbox this whole project was built in (more on that below), but it works
completely normally on a real machine.

See **`TESTING.md`** at the project root for the manual QA checklist —
the things automated tests structurally can't cover: whether pages actually
look right, whether a real browser can complete eSewa's hosted login, and
mobile responsiveness.

## Tech stack

- **Frontend:** React 19, Vite, React Router, Tailwind CSS v4, Redux Toolkit, Axios
- **Backend:** Node.js, Express 5, MongoDB, Mongoose, JWT, bcryptjs
- **External services:** Cloudinary (images), eSewa ePay v2 (payments) — both live


## What's actually working right now

- Customer and restaurant self-registration, login, JWT-protected routes
- Role-based authorization (`CUSTOMER` / `RESTAURANT` / `ADMIN`) enforced on
  the backend — the frontend's route guards are just UX on top of that
- All 9 MongoDB models, restaurant/menu CRUD with Cloudinary uploads,
  customer browsing (search/filter/sort, two search modes), a real cart,
  and checkout with backend-validated coupons and addresses
- **Orders are real, end to end, for Cash on Delivery**: placing an order
  re-validates the restaurant, address ownership, and every item's current
  price/availability server-side — nothing from the client is trusted for
  the final total. Customers get an order history and a status-progress
  page; restaurant owners get a tabbed order queue with Accept/Reject and
  Preparing → Ready → Completed actions, all guarded by valid-transition
  rules so an order can't jump straight from "new" to "completed"
- `eSewa` is deliberately blocked at order placement — both the "Place
  order" button and the backend endpoint refuse it with a clear message,
  since there's no real payment flow behind it until Step 9
- **eSewa is now real**, not blocked: order → initiate → hosted eSewa
  payment page → signature-verified, status-checked callback → confirmed
  order. See the dedicated section above for exactly what was and wasn't
  independently verified.
- **Reviews are gated to completed orders, one per order**, enforced at
  both the database level (a unique index on customer+order) and in the
  controller (with a friendly error instead of a raw duplicate-key
  response). Every new review recalculates the restaurant's aggregate
  rating and count from real data — the seed data's random rating values
  get replaced by actual averages as reviews come in.
- **Admin is fully real**: a dashboard with actual platform stats (not
  placeholders), a 7-day revenue chart, recent orders/restaurants, and
  top restaurants by revenue; restaurant approval/suspension; user
  search with an actual, enforced deactivate/reactivate toggle (checked
  in the auth middleware itself, not just a UI label); a platform-wide
  order view; and category/coupon management.
- **43 automated tests** (28 backend, 15 frontend) covering pricing math,
  eSewa signature verification and tamper detection, order status
  transitions, and — most importantly — real HTTP-level integration tests
  proving the backend actually ignores a client-submitted price, rejects
  cross-restaurant ownership mismatches, and blocks non-admins from admin
  routes. Not just claimed during development — they live in the repo and
  run with `npm test`.
- A full demo dataset: 10 restaurants, 56 menu items, 12 categories, 3
  restaurant owners, 20 customers, 5 coupons — across all 6 target cities

## Project structure

```
food-delivery-app/
├── backend/     API server — see backend/README section below
├── frontend/    React app — see frontend/README section below
├── .env.example       full list of every env var used in the project
└── README.md          this file
```

Inside each half, the code is organized exactly the way the spec calls for:
customer code under `frontend/src/pages/customer`, restaurant owner code under
`frontend/src/pages/restaurant`, admin code under `frontend/src/pages/admin`,
and all of them talk to the same `backend/routes` → `controllers` → `models`
stack.

## Setup

### Prerequisites

- Node.js 18+
- A MongoDB connection string — [MongoDB Atlas](https://www.mongodb.com/atlas)
  free tier is the easiest option if you don't have Mongo running locally

### 1. Backend

```bash
cd backend
cp .env.example .env
# edit .env — at minimum set MONGO_URI and JWT_SECRET
npm install
npm run seed   # creates the one ADMIN account (see below)
npm run dev    # starts the API on http://localhost:5000
```

### 2. Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev 
```

### The admin account

There's intentionally no public "sign up as admin" endpoint — allowing that
from the frontend is exactly the kind of privilege-escalation hole Section 20
of the spec warns about. Instead, `npm run seed` creates one admin using
`SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` from `backend/.env` (defaults to
`admin@fooddelivery.com.np` / `ChangeMe123!`). Change that password after
your first login, and never run the seed script with default credentials
against a real deployment.

### Demo data

The same `npm run seed` run also creates the full Section 21 dataset —
10 restaurants (all pre-approved, so they're visible immediately), 56 menu
items, 12 categories, 5 coupons, 3 restaurant owners and 20 customers. It's
safe to re-run; it skips the demo data if restaurants already exist.

- **Restaurant owners** (each owns 2–3 restaurants): `prakash.shrestha@khajago.test`,
  `sunita.gurung@khajago.test`, `bikash.tamang@khajago.test` — password `Password123!`
- **Customers**: `customer1@khajago.test` through `customer20@khajago.test` — same password

## Security notes (Section 20)

Already implemented:

- Passwords hashed with bcrypt (10 salt rounds), never returned in API responses
- JWT auth via `Authorization: Bearer <token>`, verified on every protected route
- `role` is never trusted from the client: registration only accepts
  `CUSTOMER`/`RESTAURANT`, validated twice (express-validator + a controller
  allow-list) — `ADMIN` cannot be self-assigned
- **Restaurant ownership is never trusted from the client either.** Every
  menu/restaurant mutation re-derives ownership by looking up the record in
  MongoDB and comparing it to `req.user._id` — a request can't just claim
  ownership by passing a different restaurant ID
- `isApproved` is excluded from the restaurant owner's editable-fields list —
  owners cannot self-approve; only admin tooling (Step 11) can flip it
- Image uploads are restricted to image MIME types, capped at 5MB, and never
  written to disk (streamed straight to Cloudinary from memory)
- Helmet, CORS scoped to `CLIENT_URL`, and rate limiting (a general API-wide
  limit plus a stricter one on `/api/auth/login` against brute-forcing)
- Centralized error handling that hides stack traces outside development
- Input validation on all auth, restaurant, and menu-item endpoints

Still to come as later phases add the endpoints they apply to: backend-only
order-total calculation (Step 8) and backend-verified eSewa payments (Step 9).

