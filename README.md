# Inventario de Prendas — Fase 1 + Fase 2 + Fase 3 + Fase 4

Sistema web para registrar e inventariar prendas (nuevas y seminuevas), venderlas durante
transmisiones en vivo, cobrar por Yape, preparar los pedidos para su entrega, y fidelizar
a los clientes con regalos sorteados por ruleta — pensado para usarse principalmente
desde el celular.

## Qué incluye la Fase 1 (inventario)

- Registro rápido de prendas con foto (cámara o galería), código automático (`P-000001`, `P-000002`...) y estado inicial "Disponible".
- Inventario con vista de tarjetas y de tabla, más buscador por código, categoría, tipo, marca, talla, color, estado y ubicación.
- Ficha de detalle de cada prenda, con cambio de estado (Disponible / Reservado / Vendido / Entregado / Retirado).
- Generación de etiquetas individuales con código y QR.
- Selección múltiple de prendas y generación de una hoja A4 con varias etiquetas para imprimir en una impresora doméstica normal.
- Dashboard con el resumen del inventario y accesos rápidos.

## Qué incluye la Fase 2 (clientes, reservas, Live)

- **Clientes**: lista con buscador, ficha con historial de compras, alta y edición.
- **Venta rápida**: pantalla pensada para usar durante el TikTok Live — se escribe (o se
  escanea, ver Fase 3) el código de la prenda, se confirma que es la correcta, y se asigna
  a un cliente (nuevo o existente) en pocos toques. La prenda pasa automáticamente a "Reservado".
- **Pedidos**: agrupan las prendas asignadas a un mismo cliente. Se pueden quitar prendas
  (vuelven a "Disponible" automáticamente) y cambiar el estado del pedido
  (Abierto / Confirmado / Entregado / Cancelado).
- El detalle de producto (Fase 1) incluye el botón "Asignar a cliente" cuando la prenda está Disponible.

## Qué incluye la Fase 3 (pagos, QR, despacho)

- **Escaneo QR con la cámara**: disponible en Venta rápida (botón 📷 junto al código) y en
  Preparación de pedidos, usando el mismo código QR que ya traen las etiquetas de Fase 1.
- **Registrar pago**: desde el detalle de un pedido — monto, método (Yape / Efectivo /
  Transferencia / Otro), número de operación y foto del comprobante.
- **Pagos pendientes de validar**: pantalla para revisar los comprobantes con calma y
  marcarlos como Validado o Rechazado. El detalle del pedido muestra si ya está "Pagado"
  o cuánto falta.
- **Preparación de pedidos**: se busca el pedido por código y se van escaneando las
  prendas físicas; el sistema confirma cada una ("3 de 3 prendas verificadas") y avisa si
  se escanea una que no pertenece al pedido. Al completarse, un botón despacha el pedido:
  todas sus prendas pasan a "Entregado" (Fase 1) y el pedido también.

Con esto queda completo el alcance definido al inicio del proyecto.

## Qué incluye la Fase 4 (regalos, ruleta y enlace al cliente)

- **Regalos**: inventario aparte para obsequios (pueden tener varias unidades del mismo
  artículo, sin precio ni costo). Se agregan y se ajusta su stock con botones + / −.
- **Incluir regalo en un pedido**: checkbox disponible tanto en Venta rápida (al momento
  de asignar la prenda) como en el detalle del pedido. Puedes elegir tú mismo qué regalo
  darle, o dejarlo a la suerte de la ruleta.
- **Enlace público para el cliente** (`/p/[código secreto]`, sin contraseña): desde el
  detalle del pedido puedes compartirlo por WhatsApp o copiarlo. El cliente ve solo sus
  prendas y el total, y confirma que su pedido es correcto.
- **Ruleta de regalos**: si el pedido incluye regalo y no se eligió uno a mano, tras
  confirmar aparece una ruleta — el cliente gira una sola vez y gana un regalo al azar,
  con más probabilidad para los regalos con más stock.
- El stock del regalo se descuenta recién cuando confirmas la entrega del pedido (no al
  girar la ruleta) — ver la nota sobre esto más abajo.

### Nota sobre el stock de regalos

Como el descuento de stock ocurre al entregar (no al girar), es teóricamente posible que
dos pedidos distintos "ganen" el mismo regalo antes de que ninguno se haya entregado, si
el stock era muy justo. Para el volumen de un negocio como este debería ser poco frecuente,
y lo verías reflejado en la pantalla de Regalos apenas despaches. Si más adelante prefieres
que el regalo se "reserve" apenas se gana en la ruleta, es un ajuste chico que se puede
agregar después.

### Nota sobre el enlace público

El enlace no pide contraseña (así se acordó, para mantenerlo simple): cualquiera que lo
tenga puede abrirlo. Para que al menos no sea adivinable, usa un código secreto aparte
(`enlace_token`) en vez del número de pedido — no es una cuenta protegida, pero tampoco es
algo que alguien pueda simplemente enumerar probando URLs.

## Correcciones y mejoras posteriores

- **Bug de reasignación corregido de forma robusta**: antes de asignar una prenda a un
  cliente, el sistema ahora limpia cualquier vínculo de pedido "huérfano" que pudiera
  quedar (de datos de prueba anteriores o de cualquier caso no previsto), así que una
  prenda "Disponible" siempre se puede volver a asignar.
- **Menú lateral**: acceso rápido a todas las pantallas desde la izquierda (colapsable en
  celular, fijo en computadora). No aparece en la vista pública del cliente.
- **Preparación de pedidos**: ahora también se puede elegir el pedido de una lista, además
  de escribir su código. Y no se habilita hasta que el pedido tenga al menos un pago
  registrado (para no despachar sin haber cobrado).
- **Pedido pagado y validado = bloqueado**: una vez que la suma de pagos "Validados" cubre
  el total del pedido, ya no se pueden quitar prendas ni cambiar el regalo, para que la
  información quede íntegra.
- **Ruleta**: los segmentos ahora se muestran del mismo tamaño a propósito (la probabilidad
  real sigue ponderada por stock, pero no se revela visualmente, para mantener la sorpresa).
  También se hizo más robusta ante clics dobles: si por algún motivo la asignación no se
  aplicó, se muestra el regalo que realmente quedó guardado, nunca uno inconsistente.
- **Nuevo flujo del enlace público**: primero se resuelve el regalo (si aplica) y recién
  después se pide la confirmación del cliente — ya no hay un paso de "confirmar" antes de
  la ruleta que no aportaba nada.
- **Confirmación del cliente con utilidad real**: en vez de un solo botón "confirmar", ahora
  el cliente elige "✅ Todo correcto" o "⚠️ Tengo una observación". Cualquiera de las dos
  opciones abre WhatsApp con un mensaje pre-escrito hacia tu número (configurable con
  `NEXT_PUBLIC_WHATSAPP_NEGOCIO` en `.env.local`), para que te llegue el aviso directo. El
  detalle de la observación, si la hay, te lo dice el cliente por ese chat.
- **Retirar prenda**: nuevo botón directo en el detalle de producto (con confirmación) para
  el caso de "eliminar" una prenda — recordando que, tal como se definió desde el inicio,
  nunca se borra físicamente: pasa a estado "Retirado".

## 1. Requisitos

- Node.js 18 o superior.
- Una cuenta gratuita en [supabase.com](https://supabase.com).

## 2. Configurar Supabase

1. Crea un proyecto nuevo en Supabase.
2. Ve a **SQL Editor** y ejecuta, en orden:
   - `supabase/migrations/001_init.sql` — tabla `productos`, generador de códigos y bucket de fotos.
   - `supabase/migrations/002_fase2_clientes_pedidos.sql` — tablas `clientes`, `pedidos` y `pedido_items`.
   - `supabase/migrations/003_fase3_pagos.sql` — tabla `pagos` y bucket de comprobantes.
   - `supabase/migrations/004_fase4_regalos.sql` — tabla `regalos`, columnas de regalo/enlace en `pedidos` y bucket de fotos de regalos.
   - `supabase/migrations/005_confirmacion_cliente.sql` — columna de confirmación del cliente en `pedidos`.
3. Ve a **Project Settings → API** y copia:
   - `Project URL`
   - `anon public key`

## 3. Configurar el proyecto

```bash
npm install
cp .env.local.example .env.local
```

Edita `.env.local` y pega los valores de Supabase:

```
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
```

## 4. Ejecutar en desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000). Para probarlo desde el celular en la misma red,
usa la IP de tu computadora en vez de `localhost` (ej. `http://192.168.1.5:3000`).

## 5. Publicar la app (para usarla desde iOS, Android y Windows)

La forma más simple es desplegarla en [Vercel](https://vercel.com) (tiene plan gratuito):

1. Sube este proyecto a un repositorio de GitHub.
2. En Vercel, "Import Project" y selecciona el repositorio.
3. Agrega las mismas variables de entorno (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`).
4. Despliega. Obtendrás una URL pública (ej. `https://tu-inventario.vercel.app`) accesible desde cualquier
   navegador en iOS, Android o Windows, sin instalar nada.

### Instalar como app en Android (PWA)

Con el sitio abierto en Chrome, usa el menú → "Instalar aplicación" (o "Agregar a pantalla de inicio").
Antes de esto, reemplaza `public/icon-192.png` y `public/icon-512.png` con el logo del negocio
(el manifest ya está listo, solo faltan los archivos de ícono).

## 6. Estructura del proyecto

```
app/                  Pantallas: Dashboard, Nueva Prenda, Inventario, Detalle, Etiquetas,
                       Venta rápida, Clientes, Pedidos, Registrar pago, Pagos pendientes,
                       Preparación de pedidos, Regalos, y la vista pública del pedido (/p/[token])
components/           Piezas de interfaz reutilizables (escáner QR, ruleta de regalos, etc.)
lib/                  Acceso a Supabase: productos, fotos, clientes, pedidos, pagos, comprobantes, regalos
types/                Tipos de datos compartidos
supabase/migrations/  SQL de Fase 1, 2, 3 y 4 (se ejecutan ahora, en orden)
```

## Notas

- Las fotos se comprimen automáticamente en el navegador antes de subirse, para ahorrar almacenamiento.
- Ningún producto se elimina físicamente: al dejar de usarse, su estado pasa a "Retirado".
- La hoja de etiquetas está pensada para impresoras domésticas comunes (no térmicas), en formato A4.
- Una prenda es una unidad única: la base de datos impide que quede en dos pedidos activos a la vez.
- Si quitas una prenda de un pedido, vuelve automáticamente a "Disponible".
- El escaneo QR necesita permiso de cámara del navegador; en `localhost` funciona sin HTTPS,
  pero una vez publicado (ej. en Vercel) el navegador ya sirve el sitio por HTTPS automáticamente,
  así que no requiere configuración extra.
- Un pedido puede tener varios pagos (por ejemplo, un adelanto y luego el resto); el sistema
  suma solo los pagos "Validados" para saber si el pedido ya está pagado.
