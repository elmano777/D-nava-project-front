# AGENTS.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

D'Nava (pana-front) is an e-commerce frontend for an artisan bakery. Built with Next.js 16 App Router, TypeScript, and a separate NestJS backend API.

## Common Commands

```bash
# Development
bun dev              # Start dev server (localhost:3000)
bun build            # Production build
bun start            # Start production server

# Testing
bun test             # Run Jest tests
bun test:watch       # Run tests in watch mode
bun test:coverage    # Run tests with coverage report

# Linting
bun lint             # Run ESLint
```

Run a single test file:
```bash
bun test src/lib/__tests__/utils.test.ts
```

## Architecture

### Directory Structure

- `src/app/` - Next.js App Router pages
  - `admin/` - Admin panel (requires `administrador` role)
  - `cliente/` - Authenticated customer dashboard
  - `auth/` - Login, signup, password reset flows
  - `checkout/` - Cart checkout and payment
  - `api/` - Next.js API routes (libro-reclamaciones, distance calculation)
- `src/components/` - React components
  - `ui/` - shadcn/ui primitives (button, dialog, input, etc.)
  - `admin/` - Admin-specific components
  - `cliente/` - Customer-specific components
  - `maps/` - Google Maps integration
- `src/lib/` - Core utilities
  - `api.ts` - API client with JWT auth and automatic token refresh
  - `auth.ts` - Auth helpers (token storage, JWT decode, expiration checks)
  - `distance-calculator.ts` - Delivery distance calculation
  - `utils.ts` - cn() utility for Tailwind class merging
- `src/store/` - Zustand stores
  - `cart-store.ts` - Shopping cart state with persistence
- `src/hooks/` - Custom React hooks

### API Client Pattern

All backend communication goes through `src/lib/api.ts`. The `apiFetch<T>()` wrapper:
- Automatically adds JWT Bearer token when `auth: true`
- Pre-emptively refreshes tokens 5 minutes before expiration
- Retries on 401 with refreshed token
- Triggers maintenance mode on repeated 500+ errors

API functions follow the naming convention: `{action}{Resource}Api()` (e.g., `listProductsApi`, `createOrderApi`, `getProfileApi`).

### Authentication

JWT-based with access and refresh tokens stored in localStorage:
- `access_token` - Short-lived, sent in Authorization header
- `refresh_token` - Long-lived, used to obtain new access tokens
- User data cached in `backend_user` localStorage key

Two user roles:
- `administrador` - Full admin access (`/admin/*` routes)
- `cliente` - Customer access (`/cliente/*` routes)

Route protection is handled in layout components (`src/app/admin/layout.tsx`, `src/app/cliente/layout.tsx`).

### State Management

Uses Zustand for cart state with `persist` middleware. The cart store (`src/store/cart-store.ts`) manages:
- Cart items with quantities
- Delivery type (delivery vs store pickup)
- Dynamic delivery costs

### UI Components

Built with shadcn/ui (New York style). Components are in `src/components/ui/`. Add new shadcn components via:
```bash
bunx shadcn@latest add <component-name>
```

Path aliases defined in `tsconfig.json`:
- `@/*` → `./src/*`
- Component aliases: `@/components`, `@/lib`, `@/hooks`, etc.

### Environment Variables

Required env vars (configure in `.env`):
- `NEXT_PUBLIC_API_BASE_URL` - Backend API URL (defaults to localhost:3000)
- Google Maps API key for delivery address features
- Google Analytics ID

### Testing

Jest with React Testing Library. Tests go in `__tests__/` folders adjacent to source files.

Test file naming: `*.test.ts` or `*.test.tsx`

Coverage configuration excludes:
- Type definitions (`*.d.ts`)
- Storybook files (`*.stories.*`)
- Test directories
