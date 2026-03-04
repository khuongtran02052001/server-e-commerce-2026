# Sanity Legacy Tracker

Updated: 2026-03-04

Purpose:
- Track remaining legacy Sanity references after migrating runtime to REST.

Current status:
- Runtime source of truth is REST (`/service-system/v1/api`).
- New feature code must not add Sanity client/GROQ queries.

Legacy docs kept for product reference only:
- `REVIEW_SYSTEM*.md`
- `REVIEW_API_MIGRATION.md`
- `REVIEW_SYSTEM_API_ARCHITECTURE.md`
- `ADMIN_USERS_EMPLOYEE_INTEGRATION.md`
- `CLERK_PAYMENT_FLOW.md`
- `IMPLEMENTATION_SUMMARY.md`
- `EMAIL_BASED_ADDRESS_MANAGEMENT.md`
- `CACHING_GUIDE.md`
- `PERFORMANCE_OPTIMIZATION_GUIDE.md`

Cleanup rule:
1. If a legacy behavior is still needed, document it in `FE_API_CONTRACT.md`.
2. Implement in NestJS module + Prisma model/repository.
3. Mark legacy note as migrated.

Canonical docs:
- `FE_API_CONTRACT.md`
- `REST_FEATURE_FLOW_FOR_BE.md`
- `DOCS_ALIGNMENT_REPORT.md`
