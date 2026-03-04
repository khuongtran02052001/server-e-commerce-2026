# Docs Alignment Report (Backend Refactor Scope)

Updated: 2026-03-04

This report summarizes which docs were aligned into `service-system` backend and which docs are legacy (Sanity/Next.js client-side architecture) and not directly applicable to this NestJS + Prisma service.

## 1. Aligned Into Backend

### Employee Management & Workflow
- `EMPLOYEE_MANAGEMENT_SYSTEM.md`
- `EMPLOYEE_QUICK_START.md`
- `DELIVERYMAN_DASHBOARD_GUIDE.md`
- `EMPLOYEE_DASHBOARD_GUIDE.md` (backend-relevant parts)
- `EMPLOYEE_ORDERS_ENHANCEMENTS.md` (backend-relevant order states)

Implemented in backend:
- Employee management endpoints under `/admin/employees`
- Role-based order workflow:
  - address confirm
  - order confirm
  - pack
  - assign deliveryman
  - start delivery
  - mark delivered
  - reschedule delivery
  - failed delivery
  - receive payment
- Role-based queue filtering for `/admin/orders`
- Employee metrics endpoint `/admin/employees/me/metrics`
- Order workflow audit log endpoint `/admin/orders/:id/workflow`

### Analytics
- `FIREBASE_ANALYTICS_SETUP.md` (conceptual event/metrics direction)
- analytics response aligned for FE shape under `/admin/analytics?period=...`

### Newsletter
- `NEWSLETTER_SUBSCRIPTION.md` (API behavior aligned)
- subscribe / unsubscribe / status endpoints aligned with FE flow

## 2. Legacy / Not Directly Applicable

These docs are mostly for old Sanity + Next.js app routes/components and should be treated as product UX reference, not backend contract:

- `REVIEW_SYSTEM*.md`
- `REVIEW_API_MIGRATION.md`
- `REVIEW_SYSTEM_API_ARCHITECTURE.md`
- `EMAIL_BASED_ADDRESS_MANAGEMENT.md`
- `IMPLEMENTATION_SUMMARY.md`
- `REWARD_POINTS_UPDATE.md`
- `CACHING_GUIDE.md`
- `PERFORMANCE_OPTIMIZATION_GUIDE.md`
- `RESPONSIVE_ADDRESS_LIST_DESIGN.md`
- `ADMIN_USERS_EMPLOYEE_INTEGRATION.md` (frontend integration details)
- `CLERK_PAYMENT_FLOW.md`

Reason:
- Mention `app/api/...` Next.js routes and Sanity write client.
- Mention component-level UI behavior only.
- Not mapped 1:1 to NestJS module boundaries.

## 3. Current Canonical FE Contract

Use this file as source of truth for FE integration:
- `docs/FE_API_CONTRACT.md`

It contains:
- base URL
- auth behavior
- newsletter endpoints
- user orders endpoints
- admin + employee endpoints
- order workflow endpoints
- analytics response shape
- review endpoints

## 4. Refactor Boundaries Applied

The refactor intentionally focused on:
- backend APIs
- role permissions
- workflow transitions
- DB schema fields needed for workflow/audit

The refactor intentionally did not copy:
- client UI concerns (pagination UI, skeletons, Tailwind breakpoints)
- Sanity-specific document fields unless required by backend API behavior

## 5. Recommended Next Step

When FE starts integration, use:
1. `FE_API_CONTRACT.md` for endpoint usage
2. Swagger for payload validation
3. This alignment report for understanding legacy docs vs active backend behavior
4. `REST_FEATURE_FLOW_FOR_BE.md` for feature-by-feature FE runtime flow
5. `SANITY_LEGACY_TRACKER.md` for remaining Sanity cleanup map

## 6. Legacy Code Commenting Policy

To avoid losing historical logic while migrating:
- Keep old Sanity files as **reference only**
- Add header comment `LEGACY SANITY ...` at file top
- Never use those files as runtime source for new feature work
- Implement all new work through REST contract
