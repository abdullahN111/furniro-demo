# 04: Home Page Sections & Footer Polish

Status: resolved
Blocked by: 01

## Objective

Fix all visual glitches, dead buttons, and placeholder text across `Hero`, `Range`, `RangeCard`, `Explore`, `CollectionSetup`, and `Footer`.

## Tasks

1. **`Hero.tsx`**:
   - Replace deprecated `objectFit="cover"` with `className="object-cover"`.
   - Improve responsive spacing and card presentation on mobile and desktop.
2. **`Range.tsx` & `RangeCard.tsx`**:
   - Replace `"Lorem ipsum..."` with real furniture range copy.
   - Wrap each `RangeCard` (`Dining`, `Living`, `Bedroom`) in `<Link href={`/shop?category=${title}`}>` with smooth hover elevation and image scale.
3. **`Explore.tsx`**:
   - Wrap `"Explore More"` in `<Link href="/shop">`.
   - Add auto-play carousel interval (pausing on mouse hover), clickable slide caption linking to `/shop?category=...`, and smooth transitions.
4. **`CollectionSetup.tsx`**:
   - Polish `#FuniroFurniture` image grid cards and PDF download feedback with `useToast()`.
5. **`Footer.tsx`**:
   - Fix `<ul> > <li> > <Link>` semantics.
   - Replace `<Link href="/">Subscribe</Link>` with a controlled `<form>` that validates the email address and displays a toast confirmation.

## Answer

Updated `Hero.tsx`, `Range.tsx`, `RangeCard.tsx`, `OurProducts.tsx`, `Explore.tsx`, `CollectionSetup.tsx`, and `Footer.tsx`.
