# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
bun dev          # Start dev server (localhost:3000)
bun run build    # Production build
bun run lint     # ESLint
bun start        # Start production server
```

Package manager is **Bun** (not npm/yarn).

## Architecture

This is a **Next.js 16 photo gallery** (App Router, React 19, TypeScript) presenting couple photos in 2 design layouts. Static export (`output: "export"`) deployed to Vercel.

### Tech Stack

- Next.js 16 with App Router
- React 19, TypeScript (strict mode)
- Tailwind CSS v4 (imported via `@import "tailwindcss"` in globals.css)
- **Motion** library (v12, successor to Framer Motion) for animations
- Six Google Fonts loaded in layout.tsx (Geist, Cormorant Garamond, DM Sans, Playfair Display, Space Grotesk, Libre Baskerville)

### Key Components

- **`app/components/motion.tsx`** — Reusable scroll-triggered animation primitives (FadeInUp, FadeIn, SlideIn, ScaleIn, DrawLine, TextReveal, ScrollProgress, StaggerContainer/StaggerItem). Used across most gallery pages.
- **`app/components/PolaroidImage.tsx`** — Interactive polaroid card with click-to-zoom modal using FLIP animation, portal rendering, escape/click-outside dismissal. Supports light/dark themes.
- **`app/components/ScatteredPile.tsx`** — Scattered photo layout using R2 quasirandom sequence for even distribution and splitmix32 PRNG for rotation/scatter. Powers the `/` page.
- **`app/components/PileControls.tsx`** — Interactive slider panel for tuning ScatteredPile parameters (canvas size, tightness, scatter, rotation, photo size). Hidden by default; toggle by typing "mia" on the keyboard.

### Utilities

- **`app/lib/photos.ts`** — `getPhotos()` reads all images from `/public` at build time. Returns `Photo[]` with `src` and `alt`. All gallery pages call this.
- **`app/lib/useClickOutside.ts`** / **`app/lib/useScrollLock.ts`** — Custom hooks used by PolaroidImage modal.

### Design Pages

| Route | Name | Key Pattern |
|-------|------|-------------|
| `/` | Scattered Prints | ScatteredPile (light theme) with hidden controls (type "mia" to toggle) |
| `/alt` | Analog Memory | Polaroid grid with film grain overlay |

### Path Alias

`@/*` maps to the project root (configured in tsconfig.json).

### Image Handling

Next.js Image component with `images: { unoptimized: true }` (required for static export). All photos live in `/public` as pre-optimized WebP files.
