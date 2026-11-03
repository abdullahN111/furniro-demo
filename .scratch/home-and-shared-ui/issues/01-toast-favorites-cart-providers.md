# 01: Toast, Favorites, and Cart Providers (SSR Fix & State Sync)

Status: resolved

## Objective

Fix the SSR blank-screen bug in `CartContext` and introduce `ToastContext` and `FavoritesContext` so that notifications and favorite states work globally without N+1 network requests or browser `alert()` popups.

## Tasks

1. **Fix `CartContext.tsx` SSR Blank Screen**:
   - Remove `if (!isMounted) return null;` so server-rendered HTML is returned immediately.
2. **Create `src/app/context/ToastContext.tsx`**:
   - Provide `showToast({ message, type, actionLabel, actionHref })` with an elegant floating toast stack in the bottom-right corner.
3. **Create `src/app/context/FavoritesContext.tsx`**:
   - Fetch user favorites once when authenticated (`GET /api/favorites`).
   - Expose `favoriteIds`, `favoriteCount`, `isFavorite(productId)`, `toggleFavorite(productId, productTitle?)`, and `loadingIds`.
   - On unauthenticated toggle, trigger a toast: `"Please sign in to save favorites"` with action `"Sign In"` -> `/login`.
4. **Wire Providers in `src/app/layout.tsx`**:
   - Wrap application in `ToastProvider` and `FavoritesProvider` alongside `CartProvider`.

## Answer

Implemented `ToastContext.tsx`, `FavoritesContext.tsx`, removed the SSR-blocking `if (!isMounted) return null;` guard in `CartContext.tsx`, and wired the providers in `src/app/layout.tsx`.
