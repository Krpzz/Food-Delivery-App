# Manual Testing Checklist

Automated tests (`backend/tests/`, `frontend/src/**/*.test.js`) cover the
logic that can be checked without a browser: pricing math, signature
verification, status-transition rules, ownership checks, role gating. They
cannot check whether a page actually looks right, whether a real browser can
complete eSewa's hosted login, or whether the layout holds up on a phone.
This checklist is for that other half.

## Setup

- [ ] `backend/.env` has a real `MONGO_URI` (MongoDB Atlas free tier works fine)
- [ ] `npm run seed` has been run in `backend/` (creates the admin + full demo dataset)
- [ ] Both servers are running: `npm run dev` in `backend/` and in `frontend/`
- [ ] `npm test` passes in both `backend/` and `frontend/`

## Customer flow (Section 26)

- [ ] Register a new customer account
- [ ] Log out, log back in
- [ ] Home page shows real restaurants (from the seed data) with real ratings
- [ ] Search restaurants by name; search by cuisine; filter by city; toggle "Open now"
- [ ] Switch to the "Dishes" tab; search a dish name (e.g. "Momo"); filter by category; toggle "Veg only"
- [ ] Open a restaurant; menu items are grouped correctly by category
- [ ] Add multiple items to cart; increase/decrease quantity; remove one item
- [ ] Open a *different* restaurant and try to add an item — confirm the "replace cart" prompt appears and works
- [ ] Cart badge in the navbar reflects the current item count
- [ ] Go to checkout; add a new address inline; select it
- [ ] Apply a valid seed coupon (`WELCOME10`, `MOMO20`, etc.) — total should visibly drop
- [ ] Apply an invalid/made-up coupon code — should show a clear error, not a crash
- [ ] Place a **Cash on Delivery** order
- [ ] Order appears in "Your orders"; status badge shows `CONFIRMED`
- [ ] Cancel a different order while it's still `CONFIRMED` — should succeed
- [ ] Try cancelling after a restaurant has marked it `PREPARING` — should be blocked

## Restaurant owner flow

- [ ] Log in as a seeded owner (`prakash.shrestha@khajago.test`, `Password123!`)
- [ ] Dashboard shows real menu-item count and (once orders exist) real stats
- [ ] Switch between this owner's multiple restaurants using the selector
- [ ] Edit restaurant profile fields; upload a logo/cover image (needs real Cloudinary credentials)
- [ ] Add a new menu item with a photo; toggle its availability off — confirm it disappears from customer view
- [ ] From "Orders", accept a new order, then walk it through Preparing → Ready → Completed
- [ ] Confirm a completed order lets the customer leave a review, and the review shows up under "Recent reviews" on this dashboard

## eSewa flow (the one thing that genuinely needs a real browser)

- [ ] At checkout, select eSewa and place the order
- [ ] Confirm the browser actually navigates to eSewa's hosted UAT page (not a blank screen or error)
- [ ] Log in with a test credential from developer.esewa.com.np's Test-credentials page (eSewa ID `9806800001`–`9806800005`, password `Nepal@123`, token `123456`)
- [ ] Confirm you're redirected back to `/payment/esewa/success` and the order shows `CONFIRMED`
- [ ] Start a second eSewa order and deliberately cancel it on eSewa's page — confirm you land on `/payment/esewa/failure` and the order shows `PAYMENT_FAILED`, not stuck at `PENDING_PAYMENT` forever
- [ ] Double-check the current UAT secret key on the live docs before this test — it's the one value in this project that couldn't be independently verified from public sources (see README's eSewa section)

## Admin flow

- [ ] Log in as the seeded admin
- [ ] Dashboard shows real totals and a 7-day revenue chart (chart will be empty until at least one order completes)
- [ ] Approve a pending restaurant; confirm it now appears in customer browsing
- [ ] Suspend an approved restaurant; confirm it disappears from customer browsing immediately
- [ ] Deactivate a test customer account; confirm that account can no longer log in
- [ ] Try to deactivate your own admin account — should be blocked
- [ ] Create a new coupon; confirm it's usable at checkout immediately
- [ ] Add a category from here and from a restaurant owner's menu-item form; confirm both paths work

## Responsive spot-check

- [ ] Home, restaurant listing, restaurant detail, cart, and checkout all usable at a phone width (~375px)
- [ ] Admin and restaurant dashboards are usable at tablet width — they're not required to be phone-optimized (Section 23), but shouldn't be broken
- [ ] The eSewa split-panel login/register screens collapse sensibly on mobile

## Known gaps (by design, not oversight)

- No real-time updates — order status only changes on refresh, exactly as
  the original spec calls for (no Socket.IO)
- No rider/delivery-partner flow — intentionally out of scope
- Favorites and a general Profile page were never assigned to a step in
  Section 25 and were not built
