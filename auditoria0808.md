# Auditoría de proyecto — Hakori.co

**Fecha:** 2026-09-08
**Rama:** main (limpia, sin cambios pendientes, sincronizada con origin)
**Commits:** 4 (`83098ae` init, `b7353ee` 0309, `8f8aa44` 0409)

## 1. Qué es el proyecto

Landing de preventa para **Hakori Drop 001**, una primera colección de indumentaria
(remeras oversize bordadas) con temática japonesa: Katana, Torii, Sakura y Monte Fuji.
Es un sitio **Next.js 16 / React 19 / Tailwind v4**, una sola app dentro de `web/`.
No es todavía una tienda funcional: es una landing tipo "coming soon" con captación
de emails, countdown a una fecha de lanzamiento y páginas de producto/legales.

El brief de diseño está en `docs/hakori-drop-001-web-correcta.pdf` y lo construido
en `web/src/` sigue ese brief con bastante fidelidad (hero con countdown, grilla de
4 productos, sección manifiesto, storytelling por producto, FAQ, captación final,
footer).

## 2. Estado actual — qué funciona

### Frontend / landing
- **Home** (`app/page.tsx`): Header → Hero con countdown y captura de email →
  Grilla de productos (carrusel con drag) → Manifiesto → 4 secciones de storytelling
  (una por producto) → FAQ → Community/captura final → Footer.
- **Countdown** (`countdown-timer.tsx`): cuenta regresiva real a
  `DROP_TARGET_DATE = 2026-09-27T20:00:00-03:00`, definida en `lib/drop-config.ts`.
- **Página de producto** (`producto/[slug]`): galería con dos vistas (foto ambientada
  / diseño recortado), selector de talle, acordeón de detalles/cuidado/envíos.
  Generada estáticamente (`generateStaticParams`) para los 4 slugs.
- **Páginas legales** (`politicas/[slug]`): privacidad, cookies y seguridad, con
  contenido ya redactado (incluye referencia a Ley 25.326 argentina). Generadas
  estáticamente desde `lib/legal.ts`.
- **Cookie consent** (`cookie-consent.tsx`): banner funcional con cookie propia
  (`hakori_cookie_consent`, 180 días), aceptar/rechazar.
- **Suscripción / baja de newsletter**: flujo completo con Resend —
  `subscribe.ts` (alta + email de bienvenida vía `react-email`), `unsubscribe.ts`
  (baja), páginas `cancelar-suscripcion` y formulario dedicado. Incluye honeypot
  anti-bot y validación de email básica.
- Imágenes optimizadas a `.webp` (migradas desde `.png` en el commit `b7353ee`).

### Infraestructura
- Proyecto Next.js estándar, ESLint configurado, TypeScript, Tailwind v4.
- `.env.local` existe pero con **todas las variables vacías** (`RESEND_API_KEY`,
  `RESEND_AUDIENCE_ID`, `EMAIL_FROM`, `SITE_URL`) — el envío de mails y el guardado
  de contactos hoy **no están operativos** en este entorno; el código ya contempla
  ese caso (loguea error y devuelve mensaje genérico al usuario, no rompe la UI).
- `.gitignore` correcto: `.env.local` no está trackeado, solo `.env.example`.

## 3. Lo que NO está — gaps principales

1. **No hay venta real.** Los botones "+ Agregar" y "PAGAR" en `product-detail.tsx`
   y en las cards de `product-grid.tsx` son visuales: no hay carrito, no hay estado
   global de compra, no hay integración de pago (Mercado Pago / Stripe / etc.), y
   el contador "Carrito: 0" del header está hardcodeado. No existen `cart`,
   `checkout` ni `payment` en el código.
2. **Credenciales de Resend sin configurar.** Sin `RESEND_API_KEY` y
   `RESEND_AUDIENCE_ID` reales, la lista de espera no guarda contactos ni manda el
   mail de bienvenida — es el bloqueador más simple de resolver antes de lanzar.
3. **Enlaces placeholder en el footer**: "Envíos", "Cambios y devoluciones",
   "Canal legal", "Centro de ayuda", "Contacto", Instagram y TikTok apuntan a `#`.
   Faltan esas páginas/enlaces reales.
4. **Sin tests.** No hay ningún archivo `*.test.*` / `*.spec.*` en el proyecto —
   ni unitarios ni end-to-end. Los flujos de suscripción/baja (los únicos con
   lógica de servidor) no tienen cobertura automatizada.
5. **Metadata / SEO incompleta**: el `<title>` en `layout.tsx` es `"Hakori.Co "`
   (con espacio final). No hay Open Graph, `og:image`, favicon más allá del default
   de Next, ni `sitemap.xml` / `robots.txt` explícitos.
6. **Sin analítica** conectada (la política de cookies menciona "cookies de
   analítica" pero no hay ningún proveedor de analytics implementado todavía).
7. **Dominio y envío de mail de producción**: `.env.example` indica que hasta
   verificar el dominio en Resend, el sender es el sandbox (`onboarding@resend.dev`,
   solo entrega al dueño de la cuenta) — falta verificar el dominio `hakori.co` en
   Resend para que los mails lleguen a clientes reales.
8. **Fecha del drop es "provisoria"** (27/09/2026, texto literal "Fecha provisoria"
   en el hero) — falta confirmar fecha final antes de lanzar.
9. **Sin panel/gestión de stock ni administración**: los 4 productos y sus precios
   están hardcodeados en `lib/products.ts`; no hay CMS ni forma de que alguien no
   técnico actualice precios, stock o textos.
10. **Sin manejo de accesibilidad/legal de checkout** (términos y condiciones de
    compra, política de envíos/devoluciones reales) más allá de las 3 páginas
    legales genéricas ya escritas.

## 4. Riesgos / cosas a vigilar

- El mensaje de error genérico de `subscribeEmail`/`unsubscribeEmail` es correcto
  para no filtrar detalles internos, pero **hoy siempre va a fallar en producción**
  si no se cargan las env vars reales antes del deploy.
- `product-detail.tsx` y `product-grid.tsx` duplican la lógica de selección de
  talle sin estado compartido — al día de hoy es solo visual, pero si se conecta
  un carrito real conviene unificar esa lógica en un solo lugar (contexto/store)
  en vez de reproducirla también ahí.
- El footer ya linkea "Política de Privacidad" con checkbox de aceptación en el
  formulario de newsletter, pero el checkbox no bloquea el envío del formulario
  (no es `required`) — revisar si eso es intencional o hay que exigirlo por
  cumplimiento.

## 5. Qué faltaría para poder lanzar el Drop 001 (checklist sugerido)

- [ ] Cargar `RESEND_API_KEY` / `RESEND_AUDIENCE_ID` / `EMAIL_FROM` de producción
      y verificar el dominio `hakori.co` en Resend.
- [ ] Confirmar y fijar la fecha real de lanzamiento (hoy dice "provisoria").
- [ ] Decidir y construir el flujo de venta real: carrito + checkout + pasarela de
      pago (Mercado Pago es lo más común en AR) o, si el Drop 001 es solo reserva
      por email, dejar explícito que no hay compra en esta etapa.
- [ ] Completar enlaces reales de footer (Instagram, TikTok, Contacto, Envíos,
      Cambios y devoluciones, Canal legal).
- [ ] SEO básico: título sin espacio final, meta Open Graph/Twitter, favicon de
      marca, `sitemap.xml`/`robots.txt`.
- [ ] Analítica (GA4/Meta Pixel/Plausible, según lo que se quiera medir).
- [ ] Al menos tests de humo para `subscribeEmail`/`unsubscribeEmail` (son los
      únicos puntos con lógica de servidor y efectos externos).
- [ ] Revisar cumplimiento: checkbox de política de privacidad como obligatorio
      si se quiere exigir consentimiento explícito antes de suscribir.
