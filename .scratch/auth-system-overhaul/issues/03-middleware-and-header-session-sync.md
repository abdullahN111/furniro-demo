# 03: Middleware `callbackUrl` & Header Reactive Session Sync

Status: resolved
Blocked by: 01, 02

## Objective

Update `src/middleware.ts` to handle `/register` and preserve `callbackUrl` when redirecting protected routes, and update `Header.tsx` + `ClientAccountInfo.tsx` to use `useSession()` reactively.
