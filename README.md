# KhajaGo — Food Delivery Marketplace (Nepal MVP)

A MERN food delivery marketplace for Nepal, inspired by (but visually and
technically independent of) Zomato, Swiggy and Bhoj. No rider system, no
real-time tracking — customers check order status by opening the order page,
per the MVP spec.

**Status: Steps 1–6 of 12 complete** — Project setup, database models,
authentication, the Restaurant System, customer browsing, and the Cart are
built and verified. See [Roadmap](#roadmap) below.

## Tech stack

- **Frontend:** React 19, Vite, React Router, Tailwind CSS v4, Redux Toolkit, Axios
- **Backend:** Node.js, Express 5, MongoDB, Mongoose, JWT, bcryptjs
- **External services:** Cloudinary (images — live), eSewa (payments, Step 9)

## What's actually working right now

- Customer and restaurant self-registration, login, JWT-protected routes
- Role-based authorization (`CUSTOMER` / `RESTAURANT` / `ADMIN`) enforced on
  the backend — the frontend's route guards are just UX on top of that
- All 9 MongoDB models (User, Restaurant, Category, MenuItem, Address, Order,
  Payment, Review, Coupon) — notably, no Cart model, on purpose (see below)
- Restaurant owners can create/edit restaurant profiles (with logo + cover
  image upload to Cloudinary) and manage **multiple** restaurants each — the
  seed data uses 3 owners across 10 restaurants, so this had to be a real
  one-to-many relationship, not a simplified 1:1 shortcut
- Full menu CRUD with categories, availability toggling, and photo upload
- Customer browsing: home page, restaurant listing with search/filter/sort,
  restaurant detail pages with the live menu grouped by category, and a
  Restaurants/Dishes tab (Section 18's two search modes) on the listing page
- **A real, working cart**: add/remove, increment/decrement quantity, clear
  cart, and restaurant validation (adding from a second restaurant prompts to
  replace the cart rather than silently mixing orders). Client-side by
  design — there's no `Cart` model, so it lives in Redux and localStorage
  until Checkout turns it into a real `Order`
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
npm run dev    # starts the app on http://localhost:5173
```

Open `http://localhost:5173`, register as a customer or a restaurant, and
you'll land on the matching dashboard. Log in as the seeded admin (see
below) to see the admin shell.

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

## Roadmap

Following Section 25's development order exactly:

| Step | Scope | Status |
|---|---|---|
| 1–3 | Project setup, database models, authentication | ✅ Done |
| 4 | Restaurant CRUD, menu CRUD, categories, restaurant dashboard | ✅ Done |
| 5 | Customer home, restaurant listing/details, search, filters | ✅ Done |
| 6 | Cart | ✅ Done |
| 7 | Checkout (address, coupon, fees) | Next |
| 8 | Orders (create, accept, prepare, ready, complete) | Planned |
| 9 | eSewa integration | Planned — will verify against current official docs before writing any endpoint code |
| 10 | Reviews (completed orders only) | Planned |
| 11 | Admin dashboard and management | Planned |
| 12 | Full-flow testing | Planned |

## A note on small deviations from the literal file tree

- `.env.example` lives at the root **and** inside `backend/`/`frontend/` —
  Node/Vite only read `.env` from their own working directory, so the
  per-app copies are what actually get used; the root one is a single
  reference for everything.
- `bcryptjs` is used instead of `bcrypt` — identical API, pure JavaScript,
  no native build step required. Swapping back is a one-line change in
  `models/User.js` if you'd rather use native `bcrypt`.
- `backend/utils/uploadImage.js` and `backend/middleware/uploadMiddleware.js`
  aren't in the original file list, but Cloudinary uploads need somewhere to
  live — a Cloudinary-upload helper and a multer config, both reused by
  restaurant and menu-item image uploads.
- Category management isn't a separate `categoryController.js`/routes file;
  it lives inside `menuController.js`/`menuRoutes.js` since categories exist
  to organize menu items and Section 13 groups "food/menu operations" under
  `/api/menu`. Both `RESTAURANT` and `ADMIN` can create categories (Section 4
  lists "Add categories" under restaurant owner features); only `ADMIN` can
  rename or deactivate one, so the list doesn't fragment into near-duplicates.
- A restaurant owner can run **more than one** restaurant — the restaurant
  and menu APIs are built around that from the start, since the seed data
  (3 owners, 10 restaurants) makes it a real requirement, not an edge case.
- Section 2's page list has one `Restaurants.jsx`, but Section 18 asks
  customers to search both restaurants *and* dishes. Rather than invent a
  second page file, `Restaurants.jsx` has a Restaurants/Dishes tab that
  swaps both the filter set and the results grid — restaurant search hits
  `GET /api/restaurants`, dish search hits the new `GET /api/menu`.
- `GET /api/menu` (cross-restaurant dish search) isn't in the original API
  list, but nothing else could serve "search food items" (Section 3) once
  menu items became restaurant-scoped in Step 4. It only ever returns items
  from approved restaurants.
- "Select location" from the Section 7 customer flow is implemented as
  simple city quick-filters (Home) and a city dropdown (listing page) —
  not GPS/geolocation, which would be more complexity than an MVP needs.
- Favorites and Reviews display aren't built yet even though they're
  customer-facing browsing features — Section 25's 12 steps never actually
  assign Favorites to a step, and Reviews is explicitly Step 10. Restaurant
  cards do show the real aggregate rating already stored on each restaurant,
  since that data already exists.
- There's no `Cart` model and no cart API — deliberately. Section 12's model
  list has no Cart, so the cart lives entirely in Redux (persisted to
  localStorage), and only becomes a real, backend-validated `Order` at
  Checkout/Step 8. The "backend must calculate the final total" rule
  (Section 9) applies to that order-creation step, not to the cart itself.
- The cart doesn't require login. Section 7's flow lists Login before
  Browse/Cart, but gating cart-building behind auth is a product choice the
  spec doesn't force, and letting people build a cart before signing up is
  the more common pattern. Login becomes mandatory at Checkout (Step 7),
  since that's where a real, user-owned Order gets created.