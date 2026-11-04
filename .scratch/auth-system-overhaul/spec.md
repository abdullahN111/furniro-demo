# Spec: Authentication & Registration System Overhaul

## Goal

Upgrade Furniro's authentication system (`NextAuth v5`, Sanity `user` storage, `/login`, `/register`, `/create-account`, `middleware.ts`, and `Header.tsx`) to deliver seamless Email/Password + Google OAuth authentication, automatic sign-in on registration, Google-to-Credentials account linking, `callbackUrl` preservation, and live session synchronization.

## Key Decisions (From Grilling)

1. **Robust `NextAuth` & Sanity `user` Handling (`src/auth/authSetup.ts` & `src/app/api/create-account/route.ts`)**:
   - Normalize all email addresses (`email.trim().toLowerCase()`) in both `authSetup.ts` and `/api/create-account` using case-insensitive GROQ matching (`lower(email) == $email`).
   - Guard against missing `user.passwordHash` in `authorize()` so Google-only users never trigger a `bcryptjs` server crash when attempting password login.
   - **Account Linking**: If a user previously signed in with Google (`!existingUser.passwordHash`) and registers on `/register` with the same email + a password, patch their existing Sanity `user` document with `passwordHash` (preserving their `favorites`, `image`, and `_id`) so they can sign in with **either** Google or Email/Password.
   - Populate `jwt` and `session` callbacks in `authSetup.ts` so `session.user.id`, `session.user.name`, `session.user.email`, and `session.user.image` are reliably available on the client via `useSession()`.

2. **Canonical `/register` Route, Confirm Password, Strength Meter & Auto-Sign-In (`src/app/register/page.tsx`, `src/app/create-account/page.tsx`, `src/app/login/page.tsx`)**:
   - Create `/register` (`src/app/register/page.tsx`) with Full Name, Email, Password, Confirm Password, interactive 4-level password strength indicator, and show/hide password toggles.
   - Immediately sign the user in via `signIn("credentials", { email, password, redirect: false })` upon registration, show a welcome toast (`useToast()`), and redirect to `callbackUrl` (or `/`).
   - Keep `/create-account` working seamlessly by rendering/redirecting to `/register`.
   - Upgrade `/login` to read `?callbackUrl=...` (wrapped in `<Suspense>`), pass `callbackUrl` to Google OAuth and Credentials redirect, and show a toast on successful sign-in.

3. **Middleware `callbackUrl` & Live Header Session Sync (`src/middleware.ts`, `src/app/components/shared/Header.tsx`, `src/app/components/ClientAccountInfo.tsx`)**:
   - Update `src/middleware.ts` so unauthenticated access to `/checkout` redirects to `/login?callbackUrl=/checkout`, and authenticated access to `/login`, `/register`, or `/create-account` redirects to `/`.
   - Update `Header.tsx` to consume `useSession()` from `next-auth/react` directly so user state, avatar, and order badge update reactively on login/logout without requiring a full page reload.
