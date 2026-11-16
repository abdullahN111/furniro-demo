# 04: Fix `tailwind.config.ts` `/ai` Content Scan, Portal Overlays & Luxury Vertical Chatbot UI

Status: resolved

## Root Causes Identified from User Screenshots
1. **`tailwind.config.ts` only scanned `./src/**/*`**: Because `/ai` is a root folder outside `./src`, Tailwind purged every class used in `/ai/components/*` (`sm:w-[410px]`, `h-[620px]`, `z-[990]`, `from-[#1F1F1F]`, etc.), causing the chatbot to stretch full-width horizontally with invisible white-on-white header text and `z-index: auto` (getting covered by the Hero card).
2. **`VisualSearchModal` & `SearchBox` rendered inside `<header className="backdrop-blur-md">`**: In CSS, `backdrop-filter` on `<header>` creates a containing block for `position: fixed` children, clipping `VisualSearchModal` inside the 88px header bar (Screenshot 3).
3. **Chatbot Visual Contrast & Vertical Proportions**: A white chatbot blends into the white website background. The chatbot needs a vertical portrait layout (`380px × 540px`) anchored slightly above the bottom-right corner (`bottom-7 right-7`) with a high-contrast Warm Espresso & Gold (`#1C1917` / `#B88E2F` / `#F3EAE0`) color scheme.

## Fixes
1. Add `"./ai/**/*.{js,ts,jsx,tsx,mdx}"` to `tailwind.config.ts`.
2. Render `VisualSearchModal` and `SearchBox` using `createPortal(..., document.body)` so modals always cover the full viewport cleanly.
3. Redesign `ai/components/ChatbotWidget.tsx` as a vertical portrait panel on the bottom-right (slightly above the bottom edge) with a non-white luxury espresso/warm-sand theme and a refined floating trigger button.
