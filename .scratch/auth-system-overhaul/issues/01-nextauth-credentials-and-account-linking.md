# 01: NextAuth Credentials Hardening & Google Account Linking

Status: resolved

## Objective

Harden `src/auth/authSetup.ts` and `src/app/api/create-account/route.ts` with case-insensitive email normalization, null-safe `passwordHash` checks, JWT/Session callbacks, and Google-to-Credentials account linking.
