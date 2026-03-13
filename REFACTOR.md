# Plan de refactorización – D-nava-project-front

## Estado actual

- **Stack:** Next.js 16, React 19, TypeScript, Tailwind 4, Radix UI, Zustand.
- **Estructura:** `app/` (rutas), `components/` (ui, admin, cliente), `lib/` (api, auth, utils), `store/`, `hooks/`.

## Objetivos

1. Mejorar mantenibilidad y escalabilidad.
2. Reducir duplicación (tipos, constantes, flujos).
3. Clarificar responsabilidades por módulo.

---

## 1. Corregir typo y rutas ✅

- [x] Renombrar `app/checkout/sucess` → `app/checkout/success` (typo).
- No había enlaces a `/checkout/sucess`; la nueva ruta es `/checkout/success`.

---

## 2. API: dividir `src/lib/api.ts` ✅

**Hecho.** La implementación está en:

- `src/lib/api/client.ts` – `apiFetch`, `checkBackendHealth`, `setMaintenanceModeCallback`, `ApiError`.
- `src/lib/api/auth.ts` – login, register, profile, verify, forgot/reset, refresh, registerAdmin.
- `src/lib/api/orders.ts` – CRUD órdenes, detalles, lookup por número.
- `src/lib/api/products.ts` – productos admin y públicos, imágenes.
- `src/lib/api/categories.ts` – categorías (incl. `getCategoryByIdApi`).
- `src/lib/api/payments.ts` – Culqi + legacy Mercado Pago.
- `src/lib/api/notifications.ts` – notificaciones.
- `src/lib/api/reports.ts` – estadísticas y reportes.
- `src/lib/api/addresses.ts` – direcciones del usuario.
- `src/lib/api/index.ts` – re-exporta todo.
- `src/lib/api.ts` – re-exporta desde `./api/index` para que `@/lib/api` siga funcionando.

---

## 3. Tipos y constantes

- **CartItem y constantes de carrito:** Ya definidos en `store/cart-store.ts`. Eliminar redefiniciones en `app/checkout/page.tsx` (usar import desde el store o desde un único módulo de tipos).
- **Tipos de API:** Mantenerlos en cada módulo `api/*.ts` junto a las funciones que los usan, o opcionalmente en `src/types/api.ts` si se prefiere centralizar.

---

## 4. Componentes (barrel exports)

- Ampliar `src/components/index.ts` para exportar componentes usados en varias rutas (navbar, footer, cards, layout cliente, etc.) y favorecer imports desde `@/components` cuando tenga sentido.

---

## 5. Checkout (futuro, opcional)

- Hoy existen dos flujos: **guest** (`/checkout`) con `localStorage` y **cliente** (`/cliente/checkout`) con Zustand y auth.
- Opciones posteriores: extraer componentes compartidos (resumen de pedido, formulario de datos) o unificar en un solo flujo con detección de usuario logueado.

---

## Orden de ejecución

1. Corregir typo `sucess` → `success`.
2. Dividir `api.ts` en módulos y mantener `api/index.ts` con re-exports.
3. Centralizar tipos/constantes y quitar duplicados en páginas.
4. Ampliar `components/index.ts`.
