# — Food Delivery Marketplace (Nepal MVP)

A MERN food delivery marketplace for Nepal— customers check order status by opening the order page,
per the MVP spec.

**Status: Steps 1–9 of 12 complete** — Project setup through Orders and the
real eSewa integration are built and verified. See [Roadmap](#roadmap) below.

## Tech stack

- **Frontend:** React 19, Vite, React Router, Tailwind CSS v4, Redux Toolkit, Axios
- **Backend:** Node.js, Express 5, MongoDB, Mongoose, JWT, bcryptjs
- **External services:** Cloudinary (images), eSewa ePay v2 (payments) — both live


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





## Roadmap

Following Section 25's development order exactly:

| Step | Scope | Status |
|---|---|---|
| 1–3 | Project setup, database models, authentication | ✅ Done |
| 4 | Restaurant CRUD, menu CRUD, categories, restaurant dashboard | ✅ Done |
| 5 | Customer home, restaurant listing/details, search, filters | ✅ Done |
| 6 | Cart | ✅ Done |
| 7 | Checkout (address, coupon, fees) | ✅ Done |
| 8 | Orders (create, accept, prepare, ready, complete) | ✅ Done |
| 9 | eSewa integration | ✅ Done |
| 10 | Reviews (completed orders only) | ✅ Done |
| 11 | Admin dashboard and management | Planned |
| 12 | Full-flow testing | Planned |

#