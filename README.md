# KhajaGo — Food Delivery Marketplace (Nepal MVP)

A MERN food delivery marketplace for Nepal.
real-time tracking — customers check order status by opening the order page,
per the MVP spec.

**Status: Phase 1 of 9 complete** — Project setup, database models, and full
authentication (backend + frontend) are built and verified. See
[Roadmap](#roadmap) below.

## Tech stack

- **Frontend:** React 19, Vite, React Router, Tailwind CSS v4, Redux Toolkit, Axios
- **Backend:** Node.js, Express 5, MongoDB, Mongoose, JWT, bcryptjs
- **External services:** eSewa (payments, Step 9), Cloudinary (images, Step 4+)

## What's actually working right now

- Customer and restaurant self-registration, login, JWT-protected routes
- Role-based authorization (`CUSTOMER` / `RESTAURANT` / `ADMIN`) enforced on
  the backend — the frontend's route guards are just UX on top of that
- All 9 MongoDB models (User, Restaurant, Category, MenuItem, Address, Order,
  Payment, Review, Coupon)
- A working React app: register/log in as any role and land on the correct
  dashboard shell

## Project structure

```
food-delivery-app/
├── backend/     
├── frontend/   
├── .env.example       
└── README.md          
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
npm run dev    # starts the app on http://localhost:5173
```

Open `http://localhost:5173`, register as a customer or a restaurant, and
you'll land on the matching dashboard. Log in as the seeded admin (see
below) to see the admin shell.


## Security notes (Section 20)

Already implemented in this phase:

- Passwords hashed with bcrypt (10 salt rounds), never returned in API responses
- JWT auth via `Authorization: Bearer <token>`, verified on every protected route
- `role` is never trusted from the client: registration only accepts
  `CUSTOMER`/`RESTAURANT`, validated twice (express-validator + a controller
  allow-list) — `ADMIN` cannot be self-assigned
- Helmet, CORS scoped to `CLIENT_URL`, and rate limiting (a general API-wide
  limit plus a stricter one on `/api/auth/login` against brute-forcing)
- Centralized error handling that hides stack traces outside development
- Input validation on all auth endpoints

Still to come as later phases add the endpoints they apply to: backend-only
order-total calculation (Step 8), backend-verified eSewa payments (Step 9),
and restaurant-ownership checks on menu/order mutations (Step 4/8).

## Roadmap

Following Section 25's development order exactly:

| Step | Scope | Status |
|---|---|---|
| 1–3 | Project setup, database models, authentication | ✅ Done |
| 4 | Restaurant CRUD, menu CRUD, categories, restaurant dashboard | Next |
| 5 | Customer home, restaurant listing/details, search, filters | Planned |
| 6 | Cart | Planned |
| 7 | Checkout (address, coupon, fees) | Planned |
| 8 | Orders (create, accept, prepare, ready, complete) | Planned |
| 9 | eSewa integration | Planned — will verify against current official docs before writing any endpoint code |
| 10 | Reviews (completed orders only) | Planned |
| 11 | Admin dashboard and management | Planned |
| 12 | Full-flow testing | Planned |

## A note on two small deviations from the literal file tree

- `.env.example` lives at the root **and** inside `backend/`/`frontend/` —
  Node/Vite only read `.env` from their own working directory, so the
  per-app copies are what actually get used; the root one is a single
  reference for everything.
- `bcryptjs` is used instead of `bcrypt` — identical API, pure JavaScript,
  no native build step required. Swapping back is a one-line change in
  `models/User.js` if you'd rather use native `bcrypt`.
