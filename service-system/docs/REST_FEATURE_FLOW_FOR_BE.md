# REST Feature Flow For Backend

Updated: 2026-03-04  
Source of truth: [FE_API_CONTRACT.md](./FE_API_CONTRACT.md), [DOCS_ALIGNMENT_REPORT.md](./DOCS_ALIGNMENT_REPORT.md)

## 1) Goal

This document translates the current frontend behavior into backend-readable feature flows after removing Sanity runtime usage.

Use this doc when implementing or validating BE endpoints for FE integration.

## 2) Global Rules

- Base URL: `/service-system/v1/api`
- Auth: Bearer JWT from NextAuth session (`accessToken`)
- Response convention expected by FE:
  - preferred: `{ success: boolean, data: ... , message?: string, error?: string }`
  - FE unwraps from either `data` or plain object for backward compatibility
  - in this service, global interceptor usually wraps to:
    - success: `{ success, data, meta, error: null }`
    - failure: `{ success: false, data: null, meta: null, error }`
- Pagination convention being aligned:
  - Query: `page`, `perPage`
  - Meta: `{ page, perPage, totalCount, hasNextPage }`

## 3) Feature Flow By Domain

### 3.1 Authentication

1. FE gets Google identity token.
2. FE calls `POST /auth/google-login`.
3. BE returns JWT access token.
4. FE stores JWT in session token and uses it for protected APIs.

Critical fields returned by `/auth/me` for FE guards/UI:
- `id`, `email`
- `isAdmin`
- `isEmployee`
- `employeeRole`
- `isActive`

### 3.2 User Profile / Dashboard

Primary FE fetch:
- `GET /auth/me`

Related FE screens then call:
- Canonical: `GET /orders` (my orders), `GET /orders/:id`, `/reviews`, `/newsletter`
- Compatibility (legacy bridge still available): 
  - `GET /user/dashboard/stats`
  - `GET /user/orders`
  - `GET /user/notifications`
  - `GET /user/addresses`

Expected behavior:
- 401 -> FE redirects to sign-in.
- 200 with nullable profile fields is valid (no forced sign-out).

### 3.3 Orders (Customer)

- Create order: `POST /orders`
- My orders: `GET /orders`
- Order detail: `GET /orders/:id`
- User action: `PATCH /orders/:id/action` with:
  - `cancel`
  - `confirm_received`

Server-side totals must be authoritative:
- `subtotal`, `tax`, `shipping`, `totalPrice`

Create-order execution rules (BE updated):
1. FE sends only:
   - `items[{ productId, quantity }]`
   - `paymentMethod`
   - address fields
2. BE loads products from DB by `productId`.
3. BE merges duplicate product rows by quantity.
4. BE validates:
   - product exists
   - requested quantity <= stock
5. BE computes totals from server config/env:
   - `ORDER_TAX_RATE`
   - `ORDER_SHIPPING_FEE`
   - `FREE_SHIPPING_THRESHOLD`
6. BE persists final computed pricing fields.
7. BE creates order + decrements stock in a single DB transaction.

DTO contract notes:
- `items[].productId`: UUID
- `items[].quantity`: integer >= 1
- Removed from request payload:
  - `totalPrice`
  - `subtotal`
  - `shipping`
  - `tax`

### 3.4 Employee Management (Admin)

- List: `GET /admin/employees`
- Assign role: `POST /admin/employees/assign-role`
- Suspend: `PATCH /admin/employees/:userId/suspend`
- Activate: `PATCH /admin/employees/:userId/activate`
- Remove role: `DELETE /admin/employees/:userId/role`
- Unified operation: `POST /admin/employees/manage-user`

Current FE payload for unified operation:
```json
{ "email": "staff@shop.com", "role": "ACCOUNTS", "active": true }
```

Role mapping note:
- FE role `packer` maps to DB enum `WARE_HOUSE`.

### 3.5 Employee Order Workflow

Workflow endpoints used by FE:
- `PATCH /admin/orders/:id/address-confirm`
- `PATCH /admin/orders/:id/order-confirm`
- `PATCH /admin/orders/:id/pack`
- `PATCH /admin/orders/:id/assign-deliveryman`
- `PATCH /admin/orders/:id/start-delivery`
- `PATCH /admin/orders/:id/deliver`
- `PATCH /admin/orders/:id/reschedule-delivery`
- `PATCH /admin/orders/:id/failed-delivery`
- `PATCH /admin/orders/:id/receive-payment`
- `GET /admin/orders/:id/workflow`

Cash collection rule (already enforced in FE):
- For COD + pending/unpaid, FE sends:
```json
{ "cashCollectedAmount": 250000, "notes": "optional" }
```

Status pipeline expected by FE:
- `packed -> ready_for_delivery -> out_for_delivery -> delivered -> completed`

### 3.6 Admin Analytics

- `GET /admin/analytics?period=7d|30d|90d|1y`

Expected response shape:
- `revenue`, `orders`, `customers`, `products`, `topProducts`, `recentActivity`

### 3.7 Reviews

- Public list: `GET /reviews?productId=...`
- Submit: `POST /reviews`
- Helpful: `PATCH /reviews/:id/helpful`
- Eligibility: `GET /reviews/can-review?productId=...`

## 4) Legacy Sanity Mapping (Quick Reference)

- Old Sanity GROQ user/profile/cart/order flows are legacy only.
- Runtime FE path is REST-first.
- Keep Sanity files only as migration references, not as active data source.

See: [SANITY_LEGACY_TRACKER.md](./SANITY_LEGACY_TRACKER.md)

## 5) Backend Checklist (What FE still needs stable)

1. Keep `/auth/me` fields stable (`isAdmin`, `isEmployee`, `employeeRole`).
2. Keep workflow endpoint permissions aligned with role guards.
3. Keep `deliver` validation consistent with COD cash rule.
4. Keep pagination meta consistent (`page`, `perPage`, `totalCount`, `hasNextPage`).
5. Keep response envelope stable (`success`, `data`, `message`).
6. Keep canonical route usage on FE (`/orders`, `/reviews`) and avoid new coupling to compatibility `/user/*` mirrors.
