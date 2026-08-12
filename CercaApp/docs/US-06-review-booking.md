# US-06 — Reseñar una reserva completada, una sola vez

> **Rama apilada:** `feature/us-06-review-booking` sale de `feature/us-05-booking-domain` (no de `develop`), porque necesita la entidad `Booking`, `BookingStatus` y el estado `completed` que trajo US-05. **US-05 tiene que mergearse a `develop` antes que esta rama** — cuando se abra el PR de US-06, va a incluir también los commits de US-05 hasta que esa rama se integre primero.

## Qué pide la historia

> Como cliente quiero reseñar una reserva completada, una sola vez.

Criterio de aceptación (literal de `Cerca.md`): **reseñar dos veces muestra "ya reseñaste esta reserva"; fuera de plazo muestra su propio mensaje.**

Esta es "la función estrella" del proyecto (`Cerca.md`, sección homónima): la regla más difícil, con cuatro condiciones de cuatro tipos distintos, y ningún rol las resuelve:

1. **Relación** — solo quien pidió la reserva (`booking.customerId`) puede reseñarla.
2. **Estado** — la reserva tiene que estar `completed`.
3. **Unicidad** — no se puede reseñar la misma reserva dos veces (`booking.reviewId !== null`).
4. **Tiempo** — hay una ventana de 30 días desde `completedAt`.

De la matriz de permisos: `review:write` lo tienen `customer`, `provider`, `moderator` y `admin` por igual — es igual que `booking:request` en US-05, todos tienen la capacidad. La dificultad no está en la capacidad, está en la capa extra (relación + estado + unicidad + plazo). Por eso el botón de reseñar **nunca se oculta**: se deshabilita y explica, con el motivo exacto.

## Qué construí

### `src/domain/reviews/` (TypeScript puro, cero React)

- `review.ts` — entidad `Review`: `id`, `bookingId`, `listingId`, `authorId`, `rating` (1-5), `comment`, `createdAt`. No importa nada de `booking.ts`; solo guarda los ids como `string`.
- `review.policy.ts` — `canReviewBooking(actorId, booking, now)`, calcada literalmente del ejemplo de `Cerca.md`: cuatro `if` en orden (relación → estado → unicidad → plazo), cada uno devuelve `{ ok: false, reason }` con un motivo distinto (`not_your_booking | not_completed | already_reviewed | window_closed`), y `{ ok: true }` si todo pasa. `REVIEW_WINDOW_DAYS = 30` exportada como constante, no un número mágico dentro de la función. `now` es un parámetro, nunca `new Date()` por dentro — así el test de "ventana cerrada" no depende del reloj real de la máquina que corre el test.
- `review.policy.test.ts` — seis casos: bloquea por cada uno de los cuatro motivos, permite dentro de la ventana, y un caso "al filo" (29 días y pico) para probar que el límite es una desigualdad estricta (`> 30`, no `>= 30`).
- `review.errors.ts` — `ReviewDomainError` (base) y `ReviewBlockedError` (guarda el `reason` exacto que devolvió la política), mismo patrón que `booking.errors.ts` de US-05. La diferencia con `OwnListingBookingError` de bookings es que aquí un solo error sirve para los cuatro motivos, porque el `reason` ya viaja dentro del objeto — no hace falta una clase por motivo.

### `src/application/reviews/`

- `ports/review.repository.ts` — puerto `ReviewRepository` con un único método, `submitReview(bookingId, input, idempotencyKey)`. No incluye `getReviewsForListing` ni nada de "reseñas de un anuncio": ese `GET /listings/{id}/reviews` pertenece a la pantalla de detalle de anuncio (US-02/US-03), que todavía no existe en este repo. Ver "Qué falta" abajo.
- `use-cases/submit-review.ts` — `createSubmitReviewUseCase(repository)`: corre `canReviewBooking` primero y, si falla, lanza `ReviewBlockedError(reason)` **sin tocar la red** (igual que `request-booking.ts` en US-05 no toca la red si el anuncio es propio). Si pasa, delega en `repository.submitReview`.
- `use-cases/submit-review.test.ts` — con un repositorio falso en memoria: comprueba que "ya reseñada" y "fuera de plazo" rechazan sin llamar al repositorio, y que un envío elegible reenvía exactamente `rating`, `comment` e `idempotencyKey`.

### `src/infrastructure/`

- `api/review.gateway.ts` — `ReviewApiGateway implements ReviewRepository`. Llama a `POST /bookings/{id}/review` con la `Idempotency-Key`, y valida la respuesta con `reviewSchema.parse(raw)` (Zod, espejo exacto de `Review`, con `rating` acotado a un entero de 1 a 5). Reutiliza `httpClient` de US-05 sin tocarlo — es exactamente la pieza genérica que el doc de US-05 predijo que reutilizarían los gateways futuros.
- `api/review.gateway.test.ts` — parseo válido + `Idempotency-Key` enviada, respuesta con campos faltantes rechazada, y un `rating` fuera de rango (7) rechazado por el propio schema.

### `src/presentation/reviews/`

- `hooks/use-submit-review.ts` — el corazón de la historia, mismo patrón que `use-request-booking.ts`:
  - Un `useRef(false)` bloquea un segundo `submitOnce` mientras el primero sigue en vuelo, de forma síncrona (no depende de un re-render).
  - `mutationFn` genera una `Idempotency-Key` nueva por intento aceptado y llama al caso de uso `submitReview`.
  - `onSuccess`: en vez de `setQueryData` con la reserva completa (la mutación devuelve una `Review`, no un `Booking`), actualiza el detalle de la reserva en caché con `queryClient.setQueryData<Booking>(bookingKeys.detail(bookingId), (old) => old ? { ...old, reviewId: review.id } : old)`. Así, si el usuario vuelve a la pantalla de detalle o de reseña, `canReviewBooking` ve `reviewId !== null` sin pedir la reserva de nuevo, y el botón se deshabilita solo con el mensaje "ya reseñaste esta reserva" — sin esperar un refetch.
  - `queryClient.invalidateQueries({ queryKey: bookingKeys.lists() })` — la regla de "qué otras vistas muestran este dato": las listas de "mis reservas" (`bookingKeys.list('customer')`) también deberían reflejar que esa reserva ya tiene reseña.
  - Reutiliza `bookingKeys` de `src/presentation/bookings/hooks/booking-keys.ts` en vez de crear una jerarquía de reseñas separada — no hay todavía ninguna pantalla que liste reseñas por su propia clave (`GET /listings/{id}/reviews` no está construido), así que una clave `reviewKeys` nueva no tendría ningún consumidor todavía. Cuando exista esa pantalla, ese hook se construye con su propia clave.
- `hooks/use-submit-review.test.tsx` — tres casos con `@testing-library/react` (`renderHook`), mismo patrón que `use-request-booking.test.tsx`: doble toque → una sola petición; éxito → `reviewId` puesto en la caché del detalle + `bookingKeys.lists()` invalidado; `isPending` se limpia al asentarse.
- `utils/review-form-schema.ts` — `reviewFormSchema` de Zod para React Hook Form: `rating` entero de 1 a 5, `comment` de 10 a 1000 caracteres. Los mensajes de error (`message: 'review.validation.ratingRequired'`) son **claves de i18n**, nunca texto en inglés — la regla de `Cerca.md`: "los mensajes de error de Zod son claves, no texto: el schema corre en el servidor, en un worker y en un test, donde no hay idioma."
- `utils/review-form-schema.test.ts` — comprueba que un `rating: 0` y un comentario de 5 caracteres fallan con la clave correcta, y que un envío válido pasa.
- `utils/review-error-message.ts` — `getReviewErrorMessageKey(error)`: si el error es `ReviewBlockedError`, arma la clave con el propio `reason` (`review.blocked.${error.reason}`) — es exactamente la línea que `Cerca.md` marca como "la simbiosis de todo el proyecto": dominio puro → clave de i18n → mensaje exacto, sin un `switch` de cuatro casos duplicando la política. Si el error viene del servidor (`ApiError` con un `reason` que coincide con alguno de los cuatro motivos de `ReviewBlockedReason`), mapea a la misma clave — así "ya reseñaste esta reserva" se ve igual venga el bloqueo del cliente (reserva ya en caché con `reviewId`) o del servidor (alguien reseñó desde otro dispositivo un segundo antes). Errores de red, 401/403 y 500 genéricos siguen el mismo patrón que `booking-error-message.ts` de US-05.
- `utils/review-error-message.test.ts` — siete casos: los cuatro motivos de dominio (dos de ellos, para probar que no se confunden entre sí), un motivo igual que llega del servidor, y los genéricos (red, 500, 401/403, desconocido).
- `components/star-rating-input.tsx` — selector de 1 a 5 estrellas. Cada estrella es un `Pressable` de 44×44 (área táctil mínima, regla de accesibilidad de `Cerca.md`) con su propia `accessibilityLabel` ("Estrella 3 de 5") y `accessibilityState={{ selected }}` — el lector de pantalla anuncia cada estrella como un botón independiente, no como una imagen. **Nota de i18n evitada a propósito:** la interpolación usa `starNumber` como nombre de variable, no `count`. Si se llama `count`, i18next intenta resolver automáticamente `review.rating.starLabel_one` / `_other` según las reglas de plural del idioma, aunque la intención acá no es "cuántas estrellas hay" sino "qué número de estrella es esta" — es uno de los "siete olvidos" que `Cerca.md` lista explícitamente ("plurales con `_one`/`_other`, interpolación").
- `screens/review-booking.screen.tsx` — pantalla en `bookings/{id}/review`. Cubre, en orden:
  1. Carga del detalle de la reserva (`ActivityIndicator`).
  2. Error al cargarla (mensaje + reintento), reutilizando `getBookingErrorMessageKey` de US-05 — no es una reseña propia de la reserva, es el mismo error de red/servidor que ya tenía su mapeo.
  3. Sin sesión → `errors.unauthenticated`.
  4. **Vuelve a correr `canReviewBooking` en la propia pantalla**, no confía en que el botón de origen (en `booking-detail.screen.tsx`) ya lo haya filtrado — si alguien llega por un enlace directo (`cerca://bookings/abc/review`) sin pasar por el detalle, la política se aplica igual. Si bloquea, muestra el mensaje y ya: ni formulario ni botón.
  5. Si la política deja pasar, muestra el formulario (React Hook Form + `zodResolver(reviewFormSchema)`): `StarRatingInput` controlado por `Controller`, un `TextInput` multilínea para el comentario, los errores de campo debajo de cada uno, y el botón de envío con el mismo patrón anti-doble-toque de `BookingRequestButton` (deshabilitado + `ActivityIndicator` mientras `isPending`).
  6. Al tener éxito, navega de vuelta al detalle de la reserva (`router.replace`), donde el botón "Escribir una reseña" ya se ve deshabilitado con "ya reseñaste esta reserva" sin volver a pedir nada a la red (por el `setQueryData` del hook).

### Cambios en lo ya existente de US-05

- `src/presentation/bookings/screens/booking-detail.screen.tsx` — le agregué la sección de reseña: calcula `canReviewBooking(actor.id, booking, new Date())` cuando hay sesión, y siempre pinta el botón "Escribir una reseña" — deshabilitado y con el mensaje exacto (`review.blocked.<reason>`) cuando la política bloquea, habilitado y navegando a `bookings/{id}/review` cuando no. Es el punto de entrada natural: sin esto, la única forma de llegar a la pantalla de reseña sería escribiendo la URL a mano.

### Rutas (`src/app/(app)/bookings/[id]/review.tsx`)

Nueva, siguiendo exactamente el árbol de navegación que `Cerca.md` dibuja: `app/(app)/bookings/[id]/review.tsx`.

### i18n

Namespace `review.*` nuevo en `en.json` y `es.json` (en paralelo, como en US-05): título, subtítulo, CTA, placeholder del comentario, mensajes de validación del formulario, y los cuatro `review.blocked.<reason>`.

## Decisiones de diseño

**¿Por qué un solo `ReviewBlockedError` con un campo `reason`, en vez de cuatro clases como se podría pensar por el patrón de `OwnListingBookingError`?** En US-05 solo había un motivo de bloqueo (`cannot_book_own_listing`), así que una clase por motivo y un motivo por clase eran lo mismo. Acá hay cuatro motivos con la misma forma de manejo (mostrar `t(`review.blocked.${reason}`)`) — crear `NotYourBookingError`, `NotCompletedError`, `AlreadyReviewedError`, `WindowClosedError` habría significado un `switch`/`instanceof` de cuatro ramas en `review-error-message.ts` para volver a armar exactamente la misma clave que ya calculó la política. Guardar el `reason` en el error es la misma idea que `Cerca.md` aplica al propio `ReviewEligibility`: "devuelve un motivo, no un booleano" — un solo error con el motivo adentro evita duplicar la enumeración de motivos en dos sitios.

**¿Por qué el hook de mutación actualiza el `Booking` en caché en vez de invalidar y volver a pedirlo?** Porque el escenario que la historia pide probar es justo "reseñar dos veces" — si tras el éxito solo invalidara sin escribir el dato optimista, la ventana entre el éxito y el refetch dejaría el botón momentáneamente habilitado, y un segundo toque rápido podría alcanzar a mandar una segunda petición antes de que la caché supiera que ya había reseña. Escribir `reviewId` de forma síncrona en `onSuccess` cierra esa ventana sin esperar a la red.

**¿Por qué la pantalla de reseña vuelve a correr `canReviewBooking` en vez de confiar en que el botón de origen ya filtró?** Es la misma razón por la que `request-booking.screen.tsx` de US-05 vuelve a correr `canRequestBooking`: un deep link (`cerca://bookings/abc/review`, que el propio `Cerca.md` marca como función central del producto) puede aterrizar directo en esta pantalla sin pasar por el botón del detalle. La política de dominio es la única fuente de verdad en el cliente; el botón es solo un atajo de navegación, no la comprobación real.

**¿Por qué reutilicé `bookingKeys` en vez de crear `reviewKeys`?** No existe todavía ninguna pantalla que liste reseñas por su propia clave de caché (`GET /listings/{id}/reviews`, fuera del alcance de esta historia porque depende del detalle de anuncio de US-02/US-03). Una fábrica de claves sin ningún `useQuery` que la consuma es infraestructura sin función — mismo criterio que ya se usó en US-05 para decidir no crear `packages/contract/` todavía.

**Formulario con React Hook Form + Zod, aunque solo tenga dos campos.** `Cerca.md` fija el stack de formularios (`React Hook Form + Zod`, `zodResolver`) como una decisión de todo el proyecto, no "para formularios grandes". Empezar esta historia con `useState` habría significado reescribir el formulario en US-03 (el de cuatro pasos) con una librería distinta a la que ya se probó acá; usar RHF desde la primera pantalla con campos deja el patrón (`Controller`, `formState.errors`, mensajes como claves de i18n) ya resuelto para las historias que vienen.

## Cómo probarlo a mano

1. `npm run verify` — debe quedar en verde (42 pruebas antes de esta historia + las nuevas).
2. Igual que en US-05, el `AuthProvider` sigue siendo un stub (`actor: null`). Para probar el flujo real hay que pisar temporalmente `initialAuthContext` en `src/presentation/auth/providers/auth-provider.tsx` con un actor de prueba, por ejemplo `{ id: 'user-1', capacities: ['customer'], platformRole: 'user' }`, y revertirlo después.
3. Navegar a `bookings/booking-1` (usando `useBooking` con un backend de prueba que devuelva una reserva `completed`, `customerId: 'user-1'`, `reviewId: null`, `completedAt` de hace menos de 30 días) → el botón "Escribir una reseña" debe verse **habilitado**.
4. Tocarlo → navega a `bookings/booking-1/review` → elegir una calificación, escribir un comentario de al menos 10 caracteres, enviar → debe navegar de vuelta al detalle.
5. En el detalle, el botón ahora debe verse **deshabilitado** con el texto "Ya reseñaste esta reserva" — sin volver a pedir nada al backend (verificable viendo que no hay una segunda petición `GET /bookings/booking-1` en los logs).
6. Repetir con una reserva `completed` con `completedAt` de hace 31+ días → el botón debe verse deshabilitado con "Ya pasaron los 30 días para reseñar esta reserva" (mensaje distinto al de "ya reseñaste").
7. Repetir con una reserva que no sea del `actor` de prueba (`customerId` distinto) → deshabilitado con "Solo puedes reseñar reservas que tú solicitaste."
8. Repetir con una reserva `requested` o `accepted` (no completada) → deshabilitado con "Solo puedes reseñar una reserva completada."
9. Con una reserva elegible, en la pantalla de reseña, tocar "Enviar reseña" dos veces seguidas rápido → solo debe verse un spinner una vez y llegar una sola petición `POST /bookings/{id}/review` al backend.
10. Navegar directo a `bookings/booking-1/review` (sin pasar por el botón del detalle) con una reserva ya reseñada → debe mostrar igual el mensaje de "ya reseñaste esta reserva", sin formulario, probando que la política se aplica en la propia pantalla y no solo en el botón de origen.

## Qué falta / deuda conocida

- Hereda toda la deuda ya documentada en `docs/US-05-booking-request.md`: `AuthProvider` stub, NativeWind no instalado (los estilos nuevos de esta historia también usan `StyleSheet` con hexadecimales, marcado con el mismo comentario `NOTA`), ESLint sin configurar (no hay `import/no-restricted-paths` ejecutable todavía — verifiqué a mano que `src/domain/reviews` y `src/application/reviews` no importan React ni React Native), y la clave de idempotencia sigue sin ser criptográficamente aleatoria.
- **No hay pantalla de "reseñas de un anuncio"** (`GET /listings/{id}/reviews`): depende del detalle de anuncio de US-02/US-03, que todavía no existe en este repo. `ReviewRepository` solo tiene `submitReview`; cuando exista esa pantalla, se le agrega `listReviewsForListing` al mismo puerto (o uno nuevo) sin tocar lo que ya hay.
- **No hay pruebas de las pantallas `.tsx`** (`review-booking.screen.tsx`, la sección nueva de `booking-detail.screen.tsx`), mismo motivo que en US-05: el repo no tiene `jest-expo`/`@testing-library/react-native` configurado, así que toda la lógica que vale la pena probar vive en piezas puras (`review.policy.ts`, `submit-review.ts`, `review.gateway.ts`, `use-submit-review.ts`, `review-error-message.ts`, `review-form-schema.ts`) ya cubiertas por tests. `star-rating-input.tsx` tampoco tiene test de render por el mismo motivo — no hay alias de `react-native` → `react-native-web` en `vitest.config.mts` para que jsdom pueda montarlo.
- **No hay control sobre reseñas duplicadas por carrera real de red** (dos dispositivos enviando casi al mismo tiempo): el cliente confía en que el servidor también aplica `canReviewBooking` (`Cerca.md`: "el servidor es la única autoridad") y devuelve un `409` con `reason: 'already_reviewed'`, que `getReviewErrorMessageKey` ya sabe traducir a la misma clave que el bloqueo del lado del cliente.
