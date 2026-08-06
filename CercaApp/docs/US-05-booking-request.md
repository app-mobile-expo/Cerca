# US-05 — Solicitar una reserva

## Qué pide la historia

> Como cliente quiero solicitar una reserva.

Criterio de aceptación (literal de `Cerca.md`): **la solicitud se envía una sola vez aunque el cliente pulse dos veces, y el estado se refleja al volver atrás.**

De la matriz de permisos: `booking:request` lo tienen `customer`, `provider`, `moderator` y `admin` por igual — cualquiera puede reservar. La capa extra es **"no tu anuncio"**: no puedes reservar tu propio servicio. Como no es un problema de capacidad (todos la tienen), el botón **no se oculta**: se deshabilita y explica, igual que "ya reseñaste esta reserva" en US-06.

## Qué construí

### `src/domain/bookings/` (TypeScript puro, cero React)

- `booking.ts` — entidad `Booking` (ya existía, sin cambios: `id`, `listingId`, `customerId`, `providerId`, `status`, `reviewId`).
- `booking-status.ts` — `BookingStatus` como unión discriminada por `kind` (`requested | accepted | declined | completed | cancelled`), ya existía y ya seguía la regla del proyecto.
- `booking.policy.ts` — `canRequestBooking(actorId, listingOwnerId)`: devuelve `{ ok: true }` o `{ ok: false, reason: 'cannot_book_own_listing' }`. Le añadí el comentario de una línea que faltaba; la lógica ya estaba bien (devuelve un motivo, no un booleano, igual que `canReviewBooking` en `Cerca.md`).
- `booking.errors.ts` — `BookingDomainError` y `OwnListingBookingError`, para que el caso de uso pueda lanzar un error tipado cuando la política bloquea la reserva. Solo añadí comentarios.

### `src/domain/shared/assert-never.ts` (nuevo)

No existía ningún `assertNever` en el repo. Lo creé en `domain/shared` porque es TS puro y lo necesitan tanto el dominio como la presentación (`booking-status-badge.tsx` lo usa en su `switch`). Si el backend añade un quinto/sexto estado a `BookingStatus`, cualquier `switch` que use `assertNever` deja de compilar y señala exactamente dónde falta el caso nuevo.

### `src/application/bookings/`

- `ports/booking.repository.ts` — puerto `BookingRepository` (ya existía). Le arreglé el formato del import (estaba todo en una línea sin espacios) y le añadí el comentario. La firma ya traía `idempotencyKey` en `requestBooking`, así que no hizo falta tocarla.
- `use-cases/request-booking.ts` (nuevo) — `createRequestBookingUseCase(repository)` devuelve una función `requestBooking(input)` que primero corre `canRequestBooking` y, si falla, lanza `OwnListingBookingError` **sin tocar la red**. Si pasa, delega en `repository.requestBooking(listingId, idempotencyKey)`. Es una fábrica de función, no una clase, para poder inyectar un repositorio falso en los tests sin mocks de módulo.
- `use-cases/get-booking.ts` (nuevo) — `createGetBookingUseCase(repository)`, para el detalle.
- `use-cases/list-bookings.ts` (nuevo) — `createListBookingsUseCase(repository)`, para `GET /bookings?role=`.

### `src/infrastructure/`

- `api/api-error.ts` (nuevo) — `ApiError` (guarda `status` y `reason`, el campo `reason` de problem+json que coincide con las políticas de dominio) y `ApiNetworkError` (la petición nunca llegó al servidor). No son específicos de bookings: cualquier gateway futuro (listings, reviews) los reutiliza.
- `api/http-client.ts` (nuevo) — **no existía ningún cliente HTTP en el repo**, así que lo construí como pieza de infraestructura común, no solo para bookings. Hace `fetch` contra `EXPO_PUBLIC_API_BASE_URL` (con `http://localhost:3000/v1` como valor por defecto, tal como dice `Cerca.md`), agrega `Authorization: Bearer <token>` leyendo la sesión de `SecureSessionStorage`, agrega `Idempotency-Key` cuando se lo pasan, y traduce cualquier respuesta no-2xx a `ApiError` leyendo el `reason` del `problem+json`. Un fallo de `fetch` (sin red) se traduce a `ApiNetworkError`. Nunca expone un `number` de status suelto a capas de arriba: todo pasa por estas dos clases de error.
- `api/booking.gateway.ts` (nuevo) — `BookingApiGateway implements BookingRepository`. Cada método llama a `httpClient` y valida la respuesta con `bookingSchema.parse(raw)` (Zod, espejo exacto de `Booking` y `BookingStatus`, incluido el `discriminatedUnion` por `kind`). Si el backend manda un campo faltante o un `status.kind` que el dominio no conoce, `parse` lanza y el dato mal formado **nunca llega** a `application` ni a `presentation`. Exporta también `bookingGateway`, una instancia única (mismo patrón que `sessionStorage` en `secure-session-storage.ts`).
- `utils/idempotency-key.ts` (nuevo) — `generateIdempotencyKey()`, un identificador único por intento de `POST /bookings` (timestamp en base36 + parte aleatoria). No usa ninguna API de Expo: no es un secreto, solo necesita ser único, así que evité tocar `expo-crypto` u otra API nativa que hubiera obligado a revisar los docs versionados de Expo SDK 57 sin necesidad real.

### `src/presentation/bookings/`

- `hooks/booking-keys.ts` — fábrica de claves de caché jerárquicas (`bookingKeys.all → lists()/list(role) → details()/detail(id)`), calcada del patrón `listingKeys` de `Cerca.md`.
- `hooks/use-request-booking.ts` — el corazón de la historia. `useMutation` de React Query envuelto en `requestOnce(params)`:
  - Un `useRef(false)` (`isSubmittingRef`) se marca `true` de forma **síncrona** antes de llamar a `mutation.mutate`. Un segundo toque, aunque llegue en el mismo tick antes de que React re-renderice, encuentra el ref ya en `true` y no llama ni una sola vez más a `mutate`. Esto es más fuerte que depender solo de `mutation.isPending` (que depende de un re-render).
  - `mutationFn` genera una `Idempotency-Key` nueva por cada intento aceptado (no por cada tap) y llama al caso de uso `requestBooking` de `application`.
  - `onSuccess`: `queryClient.setQueryData(bookingKeys.detail(booking.id), booking)` — pone el detalle en caché sin esperar un refetch — y `queryClient.invalidateQueries({ queryKey: bookingKeys.lists() })` — invalida **todas** las listas de reservas (cliente y proveedor), no solo el detalle. Es la regla "qué otras vistas muestran este dato" de `Cerca.md`.
  - `onSettled` libera el `ref`, así que un intento **nuevo** (después de un error, con un tap real del usuario) genera una `Idempotency-Key` distinta.
- `hooks/use-booking.ts` — `useQuery` para `GET /bookings/{id}`, clave `bookingKeys.detail(id)`. Como la mutación escribe en esa misma clave, la pantalla de detalle ve el dato nuevo sin pedirlo de nuevo al volver atrás.
- `hooks/use-bookings-list.ts` — `useQuery` para `GET /bookings?role=`, clave `bookingKeys.list(role)`.
- `components/booking-request-button.tsx` — botón con `accessibilityState={{ disabled, busy }}`, se deshabilita mientras `isPending`, muestra `ActivityIndicator` en vez de texto (nunca "carga por color solo": el `busy` también lo anuncia el lector de pantalla).
- `components/booking-status-badge.tsx` — pinta `BookingStatus` con `switch (status.kind)` + `assertNever`, texto **más** color de fondo (nunca solo color).
- `utils/booking-status-label.ts` — la función pura que hace el `switch`, separada del componente para poder testearla sin renderizar React Native.
- `utils/booking-error-message.ts` — `getBookingErrorMessageKey(error)`: mapea `OwnListingBookingError` y `ApiError(reason: 'not_owner')` a la **misma** clave `bookings.blocked.cannot_book_own_listing` (el mismo mensaje, venga el bloqueo del cliente o del servidor), `ApiNetworkError` a `errors.network`, 401/403 a `errors.forbidden`, cualquier otro `ApiError` a `errors.server` — nunca un texto con el código de estado crudo.
- `screens/request-booking.screen.tsx` — pantalla de solicitud. Si `canRequestBooking` falla, deshabilita el botón y muestra `t('bookings.blocked.cannot_book_own_listing')` en vez de ocultarlo (capa extra, no capacidad). Al tener éxito, navega a la confirmación.
- `screens/booking-confirmation.screen.tsx` — pantalla de confirmación tras solicitar.
- `screens/booking-detail.screen.tsx` — pantalla de detalle con sus tres estados (carga con `ActivityIndicator`, error con mensaje + botón de reintento, dato cargado con el badge de estado).

### Rutas (`src/app/(app)/bookings/`)

- `new.tsx` → `RequestBookingScreen`, recibe `listingId` y `listingOwnerId` por parámetros de ruta.
- `[id]/index.tsx` → `BookingDetailScreen`.
- `[id]/confirmation.tsx` → `BookingConfirmationScreen`.

### i18n

Añadí las claves `bookings.*` (namespace nuevo) y `errors.network/forbidden/server/generic/unauthenticated` a `src/infrastructure/i18n/locales/en.json` y `es.json`, en paralelo en los dos archivos.

### Infraestructura de pruebas (nuevo en el repo)

El repo no tenía Vitest instalado (solo `typescript` y `@types/react` como dev-deps). Lo agregué porque la tarea pedía pruebas mínimas y sin un runner no hay forma de cumplirlas:

- `devDependencies` nuevas: `vitest`, `jsdom`, `@testing-library/react`.
- `vitest.config.mts` — alias `@/ → ./src` (igual que `tsconfig.json`), entorno `jsdom`.
- `package.json`: `"test": "vitest run"`, y `"verify": "npm run typecheck && npm run test"` (antes `verify` solo corría `tsc`).

## Decisiones de diseño

**¿Por qué no usé `@testing-library/react-native` para las pantallas?** El proyecto no tiene Jest/`jest-expo` configurado, y montar ese stack (mocks de `expo-secure-store`, `expo-router`, Reanimated, etc.) es trabajo de infraestructura de pruebas que no corresponde a esta única historia. En su lugar, **saqué toda la lógica que vale la pena probar de los componentes**: la política de dominio, el caso de uso, el gateway, el hook de mutación (probado con `@testing-library/react`, que solo necesita DOM/jsdom porque el hook en sí no usa nada de `react-native`) y el mapeo de errores a i18n. Las pantallas `.tsx` quedan como cableado delgado sobre esas piezas ya probadas. Queda como deuda documentada abajo.

**¿Por qué el "lock" de doble-tap es un `useRef`, no solo `mutation.isPending`?** `isPending` viene de un re-render de React. Si dos toques llegan muy pegados, no hay garantía de que el segundo vea `isPending: true` antes de que React re-renderice. Un `ref` mutado de forma síncrona dentro del propio manejador (`requestOnce`) es la única garantía real dentro del mismo hilo de JS. `isPending` se sigue usando para la UI (deshabilitar visualmente el botón), pero la garantía de "una sola petición" no depende de eso.

**¿Por qué genero la `Idempotency-Key` en el cliente y no la pido al servidor?** Es justo el propósito de la cabecera: si el mismo intento del usuario se reenvía (por ejemplo, `mutations.retry` estuviera activo, o el propio usuario reintenta tras ver un error de red que en realidad sí llegó al servidor), el servidor puede detectar que es el mismo intento y no crear una segunda reserva. Genero una clave nueva solo cuando el `ref` deja pasar un intento nuevo (`onSettled` lo libera), nunca por cada tap bloqueado.

**`packages/contract/` — decidí no crearlo.** `Cerca.md` lo describe como un paquete **compartido con el backend** (`apps/api` en el monorepo imaginado). Este repositorio (`markeplace-expo`) es solo el cliente móvil: no hay ningún `apps/api` aquí con el que compartir código, el backend es un servicio externo que ya existe. Crear un paquete de workspace de npm vacío, sin nada al otro lado que lo importe, sería infraestructura sin función. Por eso los tipos y los schemas de Zod de `Booking` siguen viviendo donde ya estaban: el **tipo** en `src/domain/bookings/booking.ts` (TS puro, sin Zod — el dominio no debería saber qué librería de validación usa la capa de red) y el **schema** de Zod en `src/infrastructure/api/booking.gateway.ts` (el límite con la red, donde `Cerca.md` dice explícitamente que debe vivir el `parse`). Si en algún momento este repo pasa a ser un monorepo real con `apps/api` adentro, ahí sí tiene sentido mover `Booking`, `BookingStatus` y `canRequestBooking` a `packages/contract` para que el backend importe exactamente el mismo archivo — tal como se hace con `canReviewBooking` en el ejemplo de US-06.

**Cliente HTTP (`http-client.ts`) — nuevo, y deliberadamente genérico.** No existía ninguna pieza de infraestructura de red en el repo antes de esta historia. La construí sin nada específico de bookings (no importa `Booking` en ningún lado) para que los futuros gateways (`listing.gateway.ts`, `review.gateway.ts`) la reutilicen tal cual, en vez de que cada historia futura reinvente su propio `fetch`.

**Colores hexadecimales en `booking-status-badge.tsx` y en los botones.** `Cerca.md` pide `className` de NativeWind con colores semánticos del tema, pero **NativeWind no está instalado en el repo** (no está en `package.json`, no hay `tailwind.config.js` ni `babel.config.js` con el preset). Esto es deuda de la tarea de fundación del proyecto (`8ed0e8d feat: establish project foundation`), no de esta historia: todas las pantallas existentes (`sign-in.screen.tsx`, `my-listings.screen.tsx`, etc.) ya usaban `StyleSheet` con hexadecimales antes de que yo tocara nada. Seguí el mismo patrón para no mezclar dos sistemas de estilos a mitad de una historia de reservas, y lo dejo marcado con un comentario `NOTA` en el archivo y aquí como deuda explícita.

## Cómo probarlo a mano

1. `npm run verify` (o `npm run typecheck` y `npm run test` por separado) — debe quedar en verde.
2. Con la app corriendo (`npm run start`), navegar manualmente a `cerca://bookings/new?listingId=listing-1&listingOwnerId=user-2` (o usar `router.push` desde cualquier pantalla mientras no exista el detalle de anuncio de US-02/US-03).
   - **Importante**: como el `AuthProvider` actual (`src/presentation/auth/providers/auth-provider.tsx`) es todavía un stub que siempre devuelve `actor: null` (US-01 no está terminado), la pantalla de solicitud va a mostrar el mensaje "Inicia sesión para continuar" en vez del formulario. Esto es un límite conocido, no un bug de esta historia — ver "Qué falta" abajo.
   - Para probar la pantalla en sí sin esperar a US-01, se puede pisar temporalmente `initialAuthContext` en `auth-provider.tsx` con un actor de prueba (`{ id: 'user-1', capacities: ['customer'], platformRole: 'user' }`) y revertirlo después.
3. Con un actor de prueba: navegar a `bookings/new?listingId=listing-1&listingOwnerId=user-1` (mismo id que el actor) → el botón debe verse **deshabilitado** con el texto "No puedes reservar tu propio anuncio."
4. Navegar a `bookings/new?listingId=listing-1&listingOwnerId=user-2` (otro dueño) → pulsar "Solicitar reserva" dos veces seguidas rápido → solo debe verse un spinner una vez y llegar una sola petición al backend (verificable en los logs del servidor o con una API de prueba que registre las peticiones entrantes).
5. Tras el éxito, la app navega sola a la pantalla de confirmación (`bookings/[id]/confirmation`) y desde ahí a `bookings/[id]` (detalle), que debe mostrar el badge de estado "Solicitada".
6. Apagar el backend o poner el teléfono en modo avión y repetir el paso 4 → debe aparecer el mensaje "No pudimos conectarnos..." (`errors.network`), nunca un código de estado crudo.
7. Salir de la pantalla de detalle y volver a entrar (o volver atrás y adelante) → como `bookingKeys.detail(id)` es la misma clave que la mutación llenó con `setQueryData`, el estado se ve sin parpadeo ni reprocesamiento visible.

## Qué falta / deuda conocida

- **`AuthProvider` sigue siendo un stub** (US-01 no wireó sesión real todavía): `actor` siempre es `null`. La pantalla de solicitud lo maneja sin romperse (muestra "inicia sesión"), pero no se puede probar el flujo completo de punta a punta en la app hasta que US-01 conecte `sessionStorage` con el contexto de auth real.
- **No hay pantalla de detalle de anuncio todavía** (US-02/US-03 pendientes), así que no hay un botón real de "Reservar" en ningún lado del árbol de navegación: la ruta `bookings/new` se probó a mano con parámetros de query, y queda lista para que el futuro `listings/[id].tsx` la invoque pasándole `listingId` y `listingOwnerId`.
- **No hay pantalla de "mis reservas" (lista)**: construí `useBookingsList` y `bookingKeys.list(role)` porque la invalidación de caché de la mutación los necesita, pero no hay una pantalla que los consuma todavía. Cuando exista, ya tiene su hook listo.
- **NativeWind no está instalado** en el proyecto (deuda de la fundación, no de esta historia). Todos los estilos nuevos de esta historia usan `StyleSheet` con hexadecimales, igual que el resto del código existente, marcado con un comentario en `booking-status-badge.tsx`.
- **No hay ESLint configurado** en el repo (no hay `eslint.config.js`, no está en `package.json`). La regla `import/no-restricted-paths` que `Cerca.md` pide para blindar la Clean Architecture en el linter **no está ejecutable todavía**; hoy la separación de capas depende solo de disciplina y de que `tsc` no vea imports de `react-native` en `domain`. Verifiqué a mano que ningún archivo de `src/domain/bookings` ni `src/application/bookings` importa React ni React Native.
- **Pruebas de las pantallas (`.screen.tsx`) no existen**, solo de las piezas puras que las alimentan (política, caso de uso, gateway, hook de mutación, mapeo de errores). Ver "Decisiones de diseño" para el porqué.
- La clave de idempotencia (`generateIdempotencyKey`) no es criptográficamente aleatoria (usa `Math.random`); es adecuada porque no es un secreto, solo necesita ser única por intento, pero si el equipo prefiere una garantía más fuerte, `expo-crypto` la reemplaza sin tocar el resto del flujo (habría que revisar antes su API exacta en los docs de Expo SDK 57, como pide `AGENTS.md`).
