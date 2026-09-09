# Auditoría de proyecto — Hakori.co

**Fecha:** 2026-09-09 (actualización de la auditoría del 2026-09-08)
**Rama:** main — 5 commits (`83098ae` init … `72f295c` auditoría 08/09) +
**cambios sin commitear**: todo lo descripto en esta actualización (backend
nuevo en `backend/` y la integración del frontend contra él) todavía no está
commiteado.

## 0. Qué cambió desde la auditoría del 08/09

Se construyó desde cero un **backend en .NET 9 / ASP.NET Core** (`backend/`,
proyecto `HakoriCo.Api`) con **PostgreSQL** vía EF Core, y se conectó el
frontend Next.js a él. Esto cierra el gap más grande que señalaba la
auditoría anterior (punto 1: "no hay venta real") y varios más. Resumen por
fase:

- **Fase 0 — scaffolding**: solución .NET, Postgres vía docker-compose,
  health check, CORS, Swagger.
- **Fase 1 — catálogo**: `Product`/`ProductVariant` (talle + stock real,
  reemplaza los talles hardcodeados e inconsistentes que tenía el frontend),
  `GET /api/products`, `GET /api/products/{slug}`, seed con los 4 productos
  del Drop 001.
- **Fase 2 — newsletter**: `POST /api/newsletter/subscribe|unsubscribe`
  migrado desde los Server Actions de Next.js; Postgres pasa a ser la fuente
  de verdad de los contactos (antes solo vivían en la Audience de Resend).
- **Fase 3 — carrito, checkout y pagos**: carrito de invitado por cookie,
  `POST /api/checkout` que crea una preferencia de **Mercado Pago** (Checkout
  Pro), webhook de confirmación de pago con validación de firma, reserva de
  stock atómica (verificada bajo concurrencia — dos compradores compitiendo
  por la última unidad de un talle no generan oversell), expiración
  automática de órdenes impagas.
- **Fase 4 — panel admin**: `/admin` (Razor Pages dentro del mismo backend),
  login con ASP.NET Core Identity, edición de precio/stock por talle, listado
  y override manual de estado de órdenes, listado de suscriptores.
- **Integración del frontend**: `web/src/lib/products.ts` pasó de array
  hardcodeado a cliente HTTP; se agregaron carrito (`/carrito`), páginas de
  resultado de pago (`/checkout/exito|error|pendiente`); los Server Actions
  `subscribe.ts`/`unsubscribe.ts` y la dependencia de `resend`/`react-email`
  se eliminaron del frontend (ese flujo ahora vive enteramente en el
  backend).

Todo esto se probó de punta a punta contra Postgres real y, para Mercado
Pago, contra la API real de MP (sin credenciales configuradas en este
entorno — falla limpiamente con un mensaje al usuario, como se espera).

## 1. Qué es el proyecto

Landing + tienda de preventa para **Hakori Drop 001**, una primera colección
de indumentaria (remeras oversize bordadas) con temática japonesa: Katana,
Torii, Sakura y Monte Fuji. El sitio público sigue siendo **Next.js 16 /
React 19 / Tailwind v4** (`web/`), pero ya no es un proyecto frontend-only:
ahora hay un **backend .NET 9 / PostgreSQL** (`backend/`) que sirve el
catálogo, el newsletter, el carrito/checkout/pagos y el panel de
administración. Sigue sin ser 100% una tienda en producción — falta cargar
credenciales reales de Mercado Pago y Resend, y decidir infraestructura de
despliegue — pero el flujo de compra ya existe y funciona de punta a punta
en local.

El brief de diseño está en `docs/hakori-drop-001-web-correcta.pdf`.

## 2. Estado actual — qué funciona

### Frontend (`web/`)
- **Home, producto, legales, cookie consent**: igual que antes, con dos
  cambios: `producto/[slug]` pasó de estático (`generateStaticParams`) a
  dinámico (SSR), porque el stock ahora cambia en runtime; el catálogo se
  lee de la API en vez de `lib/products.ts` hardcodeado.
- **Carrito** (`components/cart-provider.tsx`, `/carrito`): contexto React
  global respaldado por cookie httpOnly (`hakori_cart`) contra el backend;
  agregar/quitar/actualizar cantidad, badge de "Carrito" en el header ya no
  está hardcodeado en `0`.
- **Checkout**: formulario de envío en `/carrito` → `POST /api/checkout` →
  redirect a Mercado Pago (Checkout Pro) → páginas de resultado
  `/checkout/exito|error|pendiente` que consultan el estado real de la
  orden.
- **Newsletter**: mismos formularios de antes (`email-capture-form.tsx`,
  `unsubscribe-form.tsx`), ahora contra `lib/newsletter.ts` → API del
  backend, en vez de Server Actions + Resend directo.

### Backend (`backend/src/HakoriCo.Api/`)
- **Catálogo**: `GET /api/products`, `GET /api/products/{slug}` — 4
  productos con 6 talles cada uno, precio y stock reales en Postgres.
- **Newsletter**: `POST /api/newsletter/subscribe|unsubscribe` — Postgres
  como fuente de verdad, Resend como espejo/envío best-effort (si faltan
  credenciales, el contacto igual se guarda — mejora respecto al
  comportamiento anterior, que perdía el lead).
- **Carrito/órdenes/pagos**: `GET/POST/PATCH/DELETE /api/cart(/items)`,
  `POST /api/checkout`, `GET /api/orders/{orderNumber}`,
  `POST /api/payments/webhook` (valida firma HMAC de Mercado Pago).
- **Admin** (`/admin`): login (ASP.NET Core Identity, un solo rol `Admin`,
  sin registro público), CRUD de precio/stock, listado/detalle de órdenes
  con override manual de estado, listado de suscriptores.
- Migraciones EF Core aplicadas, seed de los 4 productos del Drop 001.

### Infraestructura
- Frontend: igual que antes (Next.js estándar, ESLint, TypeScript,
  Tailwind v4). Ya no depende de `resend`/`react-email` — esas
  dependencias se quitaron del `package.json`.
- Backend: .NET 9, EF Core + Npgsql, Postgres vía `docker-compose.yml`
  (puerto `55432` en dev — el `5432`/`5433` por defecto ya estaban
  ocupados por instancias de Postgres nativas preexistentes en la máquina
  de desarrollo), Swagger en Development, health check en `/health`.
- Config vía `appsettings.json`/env vars: `ConnectionStrings:Default`,
  `Resend:*`, `MercadoPago:*`, `SiteUrl`, `ApiPublicUrl`, `AdminSeed:*` —
  todos vacíos por defecto (no comprometen secretos), a cargar en el
  entorno real antes de desplegar.
- `web/.env.local` / `.env.example` ahora solo necesitan
  `NEXT_PUBLIC_API_URL` (ya no `RESEND_*`, que se movieron al backend).

## 3. Lo que NO está — gaps principales

1. ~~**No hay venta real.**~~ **Resuelto.** Carrito, checkout y preferencia
   de Mercado Pago existen y funcionan; falta únicamente cargar
   credenciales reales de MP (`MercadoPago:AccessToken`,
   `MercadoPago:WebhookSecret`) para que el pago se complete de verdad.
2. **Credenciales de Resend y Mercado Pago sin configurar.** Igual que
   antes pero ahora centralizado en el backend: sin
   `Resend:ApiKey`/`AudienceId`/`EmailFrom` no sale el mail de bienvenida
   (el contacto sí se guarda), y sin `MercadoPago:AccessToken` el checkout
   no puede generar una preferencia de pago real (falla con un mensaje
   claro al usuario, no rompe la UI).
3. **Enlaces placeholder en el footer** — sin cambios: "Envíos", "Cambios y
   devoluciones", "Canal legal", "Centro de ayuda", "Contacto", Instagram y
   TikTok siguen apuntando a `#`.
4. **Sin tests automatizados.** El backend tiene un proyecto de tests
   scaffoldeado (`backend/tests/HakoriCo.Api.Tests`) pero **vacío** — no se
   escribió ningún test todavía (webhook de pagos, `StockService` bajo
   concurrencia, subscribe/unsubscribe). El frontend sigue sin ningún
   `*.test.*`/`*.spec.*`. La verificación hecha hasta ahora fue manual
   (curl + navegador), no cobertura automatizada.
5. **Metadata / SEO incompleta** — sin cambios respecto al 08/09 (título
   con espacio final, sin Open Graph, sin `sitemap.xml`/`robots.txt`).
6. **Sin analítica** — sin cambios.
7. **Dominio de producción para Resend** — sin cambios (sigue en modo
   sandbox hasta verificar `hakori.co`).
8. **Fecha del drop "provisoria"** — sin cambios.
9. ~~**Sin panel/gestión de stock ni administración.**~~ **Resuelto.**
   `/admin` permite editar precio y stock por talle, ver/gestionar
   órdenes y ver suscriptores, sin tocar la base de datos a mano.
10. **Sin manejo de accesibilidad/legal de checkout real** (términos y
    condiciones de compra) — sin cambios; ahora es más relevante porque el
    checkout ya existe y puede procesar pagos reales apenas se carguen
    las credenciales.

## 4. Riesgos / cosas a vigilar (actualizado)

- **Credenciales de Mercado Pago y Resend son las únicas piezas que
  faltan para que la compra sea 100% real** — todo el código está armado
  y probado contra las APIs reales (los intentos sin credenciales
  fallaron exactamente donde se esperaba: 401/403 de las APIs externas,
  no bugs propios). Cargar `MercadoPago:AccessToken`/`WebhookSecret` y
  `Resend:ApiKey`/`AudienceId`/`EmailFrom` en el entorno de producción es
  el paso que más impacto tiene ahora.
- **Cookies cross-origin en producción**: en local, frontend
  (`localhost:3000`) y backend (`localhost:5000`) comparten dominio
  (`localhost`) así que la cookie de carrito funciona con `SameSite=Lax`.
  En producción, si el backend queda en un subdominio distinto (p. ej.
  `api.hakori.co`), hay que revisar si `SameSite=Lax` sigue alcanzando o
  hace falta `SameSite=None; Secure` — **decisión pendiente, no
  bloqueante para seguir desarrollando en local.**
- **Dos servicios para desplegar en vez de uno**: antes el proyecto era
  un único deploy de Next.js; ahora hay que desplegar también el backend
  .NET + Postgres (y decidir dónde: mismo host, servicio separado,
  contenedor, etc.) — no hay todavía una decisión de hosting para el
  backend.
- **Seed del admin**: la primera cuenta de `/admin` solo se crea si se
  configuran `AdminSeed:Email`/`Password` — hay que recordar setearlos
  (y después, idealmente, rotar la contraseña) en el entorno real.
- **`OrderExpirationService`** corre en memoria dentro del propio proceso
  del backend (sin un job scheduler externo) — funciona bien para esta
  escala, pero si el backend se reinicia seguido en producción conviene
  confirmar que el barrido de órdenes vencidas sigue corriendo cada 2
  minutos como se espera.
- Los riesgos ya señalados el 08/09 sobre el checkbox de privacidad no
  obligatorio en el formulario de newsletter siguen vigentes sin cambios.

## 5. Qué faltaría para poder lanzar el Drop 001 (checklist actualizado)

- [ ] Cargar `MercadoPago:AccessToken` / `MercadoPago:WebhookSecret` de
      producción (cuenta real de Mercado Pago).
- [ ] Cargar `Resend:ApiKey` / `Resend:AudienceId` / `Resend:EmailFrom` de
      producción y verificar el dominio `hakori.co` en Resend.
- [ ] Decidir hosting del backend (.NET + Postgres) y del frontend, y la
      relación de dominios entre ambos (impacta la config de cookies del
      carrito).
- [ ] Confirmar y fijar la fecha real de lanzamiento (hoy dice
      "provisoria").
- [ ] Completar enlaces reales de footer (Instagram, TikTok, Contacto,
      Envíos, Cambios y devoluciones, Canal legal).
- [ ] SEO básico: título sin espacio final, meta Open Graph/Twitter,
      favicon de marca, `sitemap.xml`/`robots.txt`.
- [ ] Analítica (GA4/Meta Pixel/Plausible, según lo que se quiera medir).
- [ ] Tests automatizados priorizados en lo más riesgoso: webhook de pagos
      (idempotencia, validación de firma) y `StockService` bajo
      concurrencia — el proyecto de tests ya existe
      (`HakoriCo.Api.Tests`), solo falta escribirlos.
- [ ] Setear `AdminSeed:Email`/`Password` en el entorno de producción y
      rotar la contraseña después del primer login.
- [ ] Revisar cumplimiento: checkbox de política de privacidad como
      obligatorio si se quiere exigir consentimiento explícito antes de
      suscribir.
- [ ] Términos y condiciones de compra / política de envíos-devoluciones
      reales, ahora que el checkout puede procesar pagos de verdad.
- [ ] Commitear el trabajo de `backend/` y de la integración del frontend
      (a la fecha de esta auditoría todavía no está commiteado).
