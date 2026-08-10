# Inventario de Prendas — Fase 1 + Fase 2

Sistema web para registrar e inventariar prendas (nuevas y seminuevas) desde el celular
o la computadora, con generación de código único, búsqueda, etiquetas imprimibles en A4,
y ahora también clientes, pedidos y venta rápida durante transmisiones en vivo.

## Qué incluye la Fase 1 (inventario)

- Registro rápido de prendas con foto (cámara o galería), código automático (`P-000001`, `P-000002`...) y estado inicial "Disponible".
- Inventario con vista de tarjetas y de tabla, más buscador por código, categoría, tipo, marca, talla, color, estado y ubicación.
- Ficha de detalle de cada prenda, con cambio de estado (Disponible / Reservado / Vendido / Entregado / Retirado).
- Generación de etiquetas individuales con código y QR.
- Selección múltiple de prendas y generación de una hoja A4 con varias etiquetas para imprimir en una impresora doméstica normal.
- Dashboard con el resumen del inventario y accesos rápidos.

## Qué incluye la Fase 2 (clientes, reservas, Live)

- **Clientes**: lista con buscador, ficha con historial de compras, alta y edición.
- **Venta rápida**: pantalla pensada para usar durante el TikTok Live — se escribe el código
  de la prenda, se confirma que es la correcta, y se asigna a un cliente (nuevo o existente)
  en pocos toques. La prenda pasa automáticamente a "Reservado".
- **Pedidos**: agrupan las prendas asignadas a un mismo cliente. Se pueden quitar prendas
  (vuelven a "Disponible" automáticamente) y cambiar el estado del pedido
  (Abierto / Confirmado / Entregado / Cancelado).
- El detalle de producto (Fase 1) ahora incluye el botón "Asignar a cliente" cuando la
  prenda está Disponible.

Los módulos de pagos por Yape y preparación de pedidos con QR (Fase 3) **no están incluidos todavía**;
la base de datos ya quedó preparada para agregarlos sin rehacer lo construido (ver `supabase/future/`).

## 1. Requisitos

- Node.js 18 o superior.
- Una cuenta gratuita en [supabase.com](https://supabase.com).

## 2. Configurar Supabase

1. Crea un proyecto nuevo en Supabase.
2. Ve a **SQL Editor** y ejecuta, en orden:
   - `supabase/migrations/001_init.sql` — tabla `productos`, generador de códigos y bucket de fotos.
   - `supabase/migrations/002_fase2_clientes_pedidos.sql` — tablas `clientes`, `pedidos` y `pedido_items`.
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
                       Venta rápida, Clientes, Pedidos
components/           Piezas de interfaz reutilizables
lib/                  Acceso a Supabase: productos, fotos, clientes, pedidos
types/                Tipos de datos compartidos
supabase/migrations/  SQL de Fase 1 y Fase 2 (se ejecutan ahora, en orden)
supabase/future/      SQL de referencia para Fase 3 (no se ejecuta todavía)
```

## Notas

- Las fotos se comprimen automáticamente en el navegador antes de subirse, para ahorrar almacenamiento.
- Ningún producto se elimina físicamente: al dejar de usarse, su estado pasa a "Retirado".
- La hoja de etiquetas está pensada para impresoras domésticas comunes (no térmicas), en formato A4.
- Una prenda es una unidad única: la base de datos impide que quede en dos pedidos activos a la vez.
- Si quitas una prenda de un pedido, vuelve automáticamente a "Disponible".
