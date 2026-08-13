# feature/flatlist-card — Listings & Categories (GET)

## Qué pide esta rama

Dos GET nuevos, cada uno como vertical independiente en Clean Architecture (domain → application → infrastructure → presentation), siguiendo el patrón ya establecido por `bookings`/`reviews`:

1. **Listings** — `GET /listings`
2. **Categories** — `GET /categories`

Punto de partida: Tomy dejó 4 archivos stub en `origin/feature/flatlist-card` marcando la capa de presentación de listings (`ListingCard.tsx`, `ListingList.tsx`, `useListing.ts`, `ListingScreen.tsx`), cada uno con `export const test = () => {};`. Esta rama se creó desde `develop` ya sincronizado (ver más abajo) y se trajeron esos 4 archivos tal cual.

## Estado de `develop` al crear la rama

`develop` local y `origin/develop` habían divergido (5 commits propios — merges de US-05 bookings y US-06 reviews — vs. 1 commit propio de origin — merge de `feature/homeScreem-integration`, PR #11). Se resolvió con un `git merge origin/develop` limpio, sin conflictos (archivos afectados: `Home.tsx`, `ProfileContent.tsx`, `AppNavigator.tsx`, `HomeScreen.tsx`, `ProfileScreen.tsx`, `SearchScreen.tsx`, `navigation.d.ts`). `feature/flatlist-card` parte de ese `develop` ya al día.

## Contrato de API

Confirmado contra la API real corriendo en `http://localhost:3333` (Swagger no documenta el shape de salida, así que se sacó pegándole directo a los endpoints).

### `GET /v1/categories`

Sin query params. Devuelve un array **directo** (sin wrapper):

```json
[{ "id": "uuid", "slug": "aire-acondicionado", "name": "Aire acondicionado" }]
```

### `GET /v1/listings`

Requiere `lat`+`lng` **o** `cityId` — si no viene ninguno, `422 LOCATION_REQUIRED` (problem+json).

Query params: `query?` (string, max 120), `categoryId?` (uuid), `lat?` (-90..90), `lng?` (-180..180), `cityId?` (string), `radiusKm?` (0.1..200, default 10), `cursor?` (string, paginación keyset — nunca offset), `limit?` (1..50, default 20).

```json
{
  "items": [{
    "id": "uuid",
    "title": "Clases de guitarra — servicio profesional",
    "categoryId": "uuid",
    "priceFrom": { "amountMinor": 28000, "currency": "COP" },
    "status": "published",
    "ratingAvg": 0,
    "ratingCount": 0,
    "distanceMeters": 639.99
  }],
  "nextCursor": "opaque-base64-string"
}
```

**Ojo:** este `items[]` es un resumen (list DTO), no la entidad completa. `GET /v1/listings/{id}` (detalle, fuera de alcance de esta rama) trae además `ownerId`, `description`, `pricing.model`, `createdAt`. El dominio que modelemos ahora debe reflejar lo que el GET de lista realmente entrega — no inventar campos de más.

## Qué se construyó (por capa)

_Se completa a medida que avanza el trabajo. El usuario escribe el código; esta bitácora registra qué se tocó y por qué, no cómo escribirlo._

### `src/domain/shared/`

- `money.ts` (nuevo) — `Money = { amountMinor, currency }`. No es específico de listings: el doc de la API dice que "el dinero son enteros" en todo el proyecto, así que se puso en `shared` junto a `assert-never.ts` en vez de dentro de `domain/listings/`, para que otras verticales (categorías con precio, futuros anuncios) lo reutilicen sin importar cross-feature.

### `src/domain/listings/`

- `listing.ts` (nuevo) — entidad `Listing` modelada 1:1 sobre lo que devuelve el **item** de `GET /v1/listings` (el resumen de lista, no el detalle): `id`, `title`, `categoryId`, `priceFrom: Money`, `status`, `ratingAvg`, `ratingCount`, `distanceMeters`. Alias de tipos `ListingId` y `CategoryId` (`string`), igual que `BookingId`/`ListingId` en `booking.ts`.
  - `status` se dejó como `string` a propósito, no como unión literal: solo se confirmó el valor `"published"` en la respuesta real; existen endpoints `publish`/`pause`/`moderate` que sugieren más estados, pero no se verificaron todos. Pendiente de ajustar si hace falta más adelante.
  - `distanceMeters` se dejó **obligatorio**, sin confirmar si desaparece cuando la búsqueda se hace por `cityId` en vez de `lat`/`lng`. Decisión explícita: no se investiga ahora, solo se toca "cuando corresponda" (fuera de alcance de este módulo por ahora).

### `src/domain/categories/` — pendiente

### `src/application/listings/`

- `ports/listing.repository.ts` (nuevo) — puerto `ListingRepository` con un único método `listListings(params: ListListingsParams): Promise<ListListingsResult>`. `ListListingsParams` cubre los query params reales del endpoint (`lat?`, `lng?`, `cityId?`, `categoryId?`, `query?`, `radiusKm?`, `cursor?`, `limit?`), todos opcionales por ahora (sin tipar todavía la regla "lat+lng o cityId" como unión discriminada — queda como mejora pendiente). `ListListingsResult` es `{ items: readonly Listing[]; nextCursor: string | null }`, no un array suelto, porque la API pagina por cursor y el branch existe para renderizar una lista con scroll.
- `use-cases/list-listings.ts` (nuevo) — `createListListingsUseCase(repository)`, mismo patrón fábrica que `createListBookingsUseCase`: no tiene lógica propia, solo delega en `repository.listListings(params)`. Sirve para poder inyectar un repositorio falso en tests.

Implementado en `src/infrastructure/api/listing.gateway.ts` (`ListingApiGateway`) + `src/infrastructure/api/schemas/money.schema.ts` (`moneySchema`, separado igual que `Money` en `domain/shared`, por la misma razón: transversal).

### Reorganización de carpetas (fix, mismo día)

Al escribir los archivos a mano quedaron en rutas que no coincidían con lo acordado: `application/listing/` (singular) en vez de `application/listings/`, `application/use-cases/list-listings.ts` suelto en vez de anidado, `infrastructure/api/listing/` como subcarpeta en vez de archivo plano `listing.gateway.ts` (como `booking.gateway.ts`). Se corrigió moviendo todo a la estructura acordada.

**2 bugs corregidos (mismo día):** `title` venía tipeado `tittle` en `domain/listings/listing.ts` y en el schema de Zod de `listing.gateway.ts` (hubiera roto `.parse()` contra la respuesta real, que sí trae `title`). Y `categoryId` venía como `categoryCity` en `ListListingParams` (`application/listings/ports/listing.repository.ts`) — no correspondía a ningún query param real del endpoint. Verificado con `grep -rn "tittle\|categoryCity" src/` que no queda ningún rastro.

**Gotcha real de git:** los primeros intentos de `git mv` fallaban con `fatal: no se encuentra bajo control de versiones` — no era un problema de la terminal cortando el pegado (parecía eso al principio), sino que `git mv` **exige que el archivo ya esté trackeado** (agregado al índice). Los archivos nuevos de este módulo estaban en `??` (untracked), así que había que usar `mv` normal del sistema — `git` los sigue viendo como nuevos en la ruta nueva sin problema. En cambio, los 4 stubs de Tomy sí estaban en `A` (ya en el índice, porque vinieron de `git checkout origin/feature/flatlist-card --`), así que para esos `git mv` funcionó directo y preservó el historial.

### `src/application/categories/` — pendiente

### `src/infrastructure/api/` — pendiente (categories)

### `src/presentation/listings/`

Reorganizado desde los 4 stubs de Tomy (ver arriba) a estructura vertical-slice, y completado:

- `hooks/listing-keys.ts` (nuevo) — fábrica de claves de caché de React Query, `all → lists()/list(filters)`. `filters` excluye `cursor` a propósito: el cursor lo maneja React Query internamente como `pageParam`, no el llamador del hook.
- `hooks/use-listings.ts` — `useListings(filters)` con `useInfiniteQuery` (no `useQuery` simple): la API ya trae `nextCursor` pensado para scroll infinito y el branch es literalmente *flatlist-card*. `getNextPageParam` lee `lastPage.nextCursor ?? undefined`.
- `components/listing-list.tsx` — `ListingList`, presentacional puro (no llama hooks de datos): recibe `listings`, `onEndReached`, `refreshing`, `onRefresh` como props y renderiza el `FlatList`. Mismo patrón que `BookingStatusBadge`: la screen es quien orquesta datos, el componente solo pinta.
  - Bug corregido: `const styles = StyleSheet.create(...)` estaba declarado *después* del `return` (código inalcanzable) — el JSX leía `styles.content` antes de que existiera, `ReferenceError` garantizado en cada render. Se movió `styles` a nivel de módulo, como en el resto del proyecto.
- `components/listing-card.tsx` — `ListingCard`, también presentacional, pinta `title`, `priceFrom` formateado y `ratingAvg`/`ratingCount` si hay reseñas. No muestra el nombre de categoría todavía (`categoryId` es un uuid) — depende del GET de categories, fuera de alcance de esta pasada.
- `utils/format-money.ts` (nuevo) — `formatMoney(money, locale)`. **No divide por 100 a lo bruto**: usa `Intl.NumberFormat(...).resolvedOptions().maximumFractionDigits` para saber cuántos decimales tiene la moneda real (COP tiene 0, USD tiene 2, KWD tiene 3) antes de convertir de unidad menor a mayor — es la regla que el propio `cerca-api.md` advierte ("dividir entre 100 está mal en general").
- `screens/listings.screen.tsx` (nuevo) — `ListingsScreen`: llama `useListings`, aplana `data.pages.flatMap(p => p.items)`, maneja loading/error/empty (patrón calcado de `booking-detail.screen.tsx`), conecta `fetchNextPage`/`hasNextPage`/`isFetchingNextPage` al `onEndReached` de `ListingList`. Filtros de ubicación **hardcodeados** por ahora (`lat`/`lng` de Medellín, el ejemplo de `cerca-api.md`) — no hay geolocalización real conectada todavía, y no se tocó por dos razones: está fuera de alcance de "solo listings", y `AGENTS.md` exige revisar la doc versionada de Expo SDK 57 antes de tocar cualquier API nativa como `expo-location`.
- **No usa `useTranslation`/i18n**, a diferencia del resto de screens del proyecto — strings en español hardcodeados. Se descubrió que `react-i18next`/`i18next` **no están instalados** (igual que pasó con `@tanstack/react-query`) y que además no existe ningún archivo de inicialización de i18next en el repo — 8 archivos de bookings/reviews ya mergeados dependen de esto y hoy no compilan por esa razón. Arreglarlo de raíz (instalar + crear el init + envolver la app en el provider) es un cambio cross-cutting fuera de "solo el módulo de listings"; queda anotado para decidir aparte, no se tocó.

**2ª dependencia faltante descubierta y agregada:** `@tanstack/react-query` tampoco estaba en `package.json` pese a ya estar en uso en bookings/reviews (6 archivos). Se instaló (`^5.101.4`) — necesario para que `useInfiniteQuery` funcione en `use-listings.ts`, y de paso destraba los hooks de bookings/reviews que ya lo importaban.

## Archivos de Tomy (no tocar más de lo necesario)

- `src/presentation/components/listings/ListingCard.tsx`
- `src/presentation/components/listings/ListingList.tsx`
- `src/presentation/hooks/useListing.ts`
- `src/presentation/screens/ListingScreen/ListingScreen.tsx`
