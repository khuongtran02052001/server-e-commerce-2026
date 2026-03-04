# FE API Contract (Service System)

Base URL:
- `/service-system/v1/api`

Auth:
- Bearer JWT từ `/auth/google-login`
- Header: `Authorization: Bearer <token>`

Response envelope (global):
- Success: `{ success: true, data: ..., meta: null | object, error: null }`
- Error: `{ success: false, data: null, meta: null, error: { code, message, details? } }`
- Some endpoints can return custom body with `success` directly (interceptor will not re-wrap).

## 1. Auth

### POST `/auth/google-login`
Body:
```json
{ "googleIdToken": "..." }
```
Response:
```json
{ "success": true, "data": { "accessToken": "..." } }
```

### GET `/auth/me`
- JWT required
- Returns current user profile for FE guards.
Response `data` fields used by FE:
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "isAdmin": true,
  "isEmployee": true,
  "employeeRole": "INCHARGE",
  "isActive": true
}
```

## 2. Newsletter

### POST `/newsletter/subscribe`
Body:
```json
{
  "email": "user@example.com",
  "source": "footer",
  "ipAddress": "127.0.0.1",
  "userAgent": "Mozilla/5.0"
}
```
Response:
```json
{
  "success": true,
  "alreadySubscribed": false,
  "message": "Thank you for subscribing! Check your email for updates.",
  "data": { "id": "...", "email": "...", "status": "active" }
}
```

### POST `/newsletter/unsubscribe`
Body:
```json
{ "email": "user@example.com" }
```

### GET `/newsletter/status?email=user@example.com`
Response:
```json
{ "subscribed": true, "status": "active" }
```

## 3. Orders (User)

### GET `/orders`
- JWT required
- Returns current user orders with products included.

### GET `/orders/:id`
- JWT required
- Returns order detail of current user.

### POST `/orders`
- JWT required
- Pricing authority: **backend only**.
- Backend behavior (contracted):
  - fetches product prices by `productId` from DB
  - merges duplicated product lines by summing quantity
  - validates product existence
  - validates stock sufficiency before creating order
  - creates order and decrements stock atomically in one DB transaction (rollback on failure)
  - computes `subtotal`, `tax`, `shipping`, `totalPrice` on server
- Tax/shipping config is read from env:
  - `ORDER_TAX_RATE`
  - `ORDER_SHIPPING_FEE`
  - `FREE_SHIPPING_THRESHOLD`
- FE only sends `items`, `paymentMethod`, and address fields (no pricing fields).
Body:
```json
{
  "items": [{ "productId": "uuid", "quantity": 2 }],
  "paymentMethod": "MOMO",
  "addressName": "Home",
  "address": "123 Nguyen Trai",
  "city": "Ho Chi Minh City",
  "state": "HCM",
  "zip": "700000"
}
```

Validation notes:
- `items[].productId` must be UUID.
- `items[].quantity >= 1`.
- Deprecated request fields removed in DTO:
  - `totalPrice`
  - `subtotal`
  - `shipping`
  - `tax`

### PATCH `/orders/:id/action`
- JWT required
Body:
```json
{ "action": "cancel" }
```
or
```json
{ "action": "confirm_received" }
```

## 4. Admin / Employee - Employee Management

### GET `/admin/employees`
- Admin only
- Query: `page`, `perPage`, `query`, `status`, `role`

### POST `/admin/employees/assign-role`
- Admin only
Body:
```json
{ "userId": "uuid", "role": "CALL_CENTER" }
```

### PATCH `/admin/employees/:userId/suspend`
- Admin only
Body:
```json
{ "reason": "policy violation" }
```

### PATCH `/admin/employees/:userId/activate`
- Admin only

### DELETE `/admin/employees/:userId/role`
- Admin only

### POST `/admin/employees/manage-user`
- Admin only
Body:
```json
{ "email": "staff@shop.com", "role": "ACCOUNTS", "active": true }
```

### GET `/admin/employees/me/metrics`
- Admin or employee
- Returns role-based dashboard numbers.

## 5. Admin / Employee - Orders Workflow

### GET `/admin/orders`
- Admin: full list
- Employee: filtered queue by role

### GET `/admin/orders/:id`
- Admin: all
- Delivery man: only assigned order
- Other employee roles: accessible

### PATCH `/admin/orders/:id`
- Admin only
- Update status/paymentStatus directly

### PATCH `/admin/orders/:id/address-confirm`
- Role: `CALL_CENTER` / `INCHARGE`

### PATCH `/admin/orders/:id/order-confirm`
- Role: `CALL_CENTER` / `INCHARGE`

### PATCH `/admin/orders/:id/pack`
- Role: `PACKER` / `INCHARGE`

### PATCH `/admin/orders/:id/assign-deliveryman`
- Role: `PACKER` / `INCHARGE`
Body:
```json
{ "deliverymanId": "uuid", "notes": "optional" }
```

### PATCH `/admin/orders/:id/start-delivery`
- Role: `DELIVERY_MAN` / `INCHARGE`

### PATCH `/admin/orders/:id/deliver`
- Role: `DELIVERY_MAN` / `INCHARGE`
- COD/pending payment requires `cashCollectedAmount`
Body:
```json
{ "cashCollectedAmount": 250000, "notes": "optional" }
```

### PATCH `/admin/orders/:id/reschedule-delivery`
- Role: `DELIVERY_MAN` / `INCHARGE`

### PATCH `/admin/orders/:id/failed-delivery`
- Role: `DELIVERY_MAN` / `INCHARGE`

### PATCH `/admin/orders/:id/receive-payment`
- Role: `ACCOUNTS` / `INCHARGE`

### GET `/admin/orders/:id/workflow`
- Returns audit logs for order actions.

## 6. Analytics

### GET `/admin/analytics?period=30d`
- Role: `ADMIN`, `INCHARGE`, `ACCOUNTS`
- Supported periods: `7d`, `30d`, `90d`, `1y`
- Response shape:
```ts
{
  revenue: { total: number; change: number; trend: number[] };
  orders: { total: number; change: number; pending: number; completed: number; cancelled: number };
  customers: { total: number; change: number; active: number; new: number };
  products: { total: number; change: number; lowStock: number; outOfStock: number };
  topProducts: Array<{ name: string; sales: number; revenue: number }>;
  recentActivity: Array<{ action: string; time: string; value: string }>;
}
```

## 7. Reviews

### GET `/reviews?productId=<uuid>`
- Public

### POST `/reviews`
- JWT required

### PATCH `/reviews/:id/helpful`
- JWT required

### GET `/reviews/can-review?productId=<uuid>`
- JWT required

---

Notes:
- Employee role mapping in backend: `PACKER` is stored as `WARE_HOUSE`.
- Re-login required after role updates so JWT contains latest `isEmployee` and `employeeRole`.
- Delivery flow status: `packed` -> `ready_for_delivery` -> `out_for_delivery` -> `delivered` -> `completed`.

## 8. Migration Discipline (Sanity -> REST)

- This contract is the canonical runtime source.
- Legacy Sanity files are for behavior reference only.
- Do not add new Sanity/GROQ usage in feature code.
- See:
  - `docs/REST_FEATURE_FLOW_FOR_BE.md`
  - `docs/SANITY_LEGACY_TRACKER.md`

## 9. Canonical vs Compatibility Endpoints

Canonical for FE:
- `/auth/*`, `/orders/*`, `/reviews/*`, `/newsletter/*`, `/admin/*`

Compatibility endpoints (legacy bridge, avoid new usage):
- `/user/orders`, `/user/reviews`, `/user/addresses`, `/user/notifications`
