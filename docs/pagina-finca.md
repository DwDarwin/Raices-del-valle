# Documentación — Página "La finca"

Página informativa sobre la familia productora (Chindoy Muchavisoy, Sibundoy, Putumayo).
Es una página **estática**: solo usa HTML y CSS. El único JavaScript es `js/app.js`, que ya existía y carga el header y el footer.

## 1. Archivos

| Archivo | Rol |
|---|---|
| `pages/finca.html` | Estructura y contenido de la página |
| `css/fincas.css` | Estilos propios de la página (prefijo `finca-`) |
| `css/styles.css` | Variables globales, tipografía y botones (compartido) |
| `css/header.css`, `css/footer.css` | Estilos del header y el footer (compartidos) |
| `js/app.js` | Inyecta `pages/header.html` y `pages/footer.html` |
| `assets/home/familia-jacanamejoy-cosecha.webp` | Imagen del hero |
| `assets/family/cultivos-finca.webp` | Imagen de la sección de cultivo |

La ruta `pages/finca.html` es la que enlazan el header, el footer y el botón "Conoce a la familia" del home.

## 2. Cómo encaja en la arquitectura

```
finca.html
 ├─ <link> styles.css, header.css, footer.css   → base compartida
 ├─ <link> fincas.css                           → estilos exclusivos
 └─ <script type="module"> app.js               → carga header y footer
```

- `<header id="header-container">` y `<footer id="footer-container">` están vacíos en el HTML.
- `app.js` ejecuta `initializeApp()`, que llama a `loadComponent(containerId, fileName)` para cada uno.
- `loadComponent` hace `fetch` de `../pages/<archivo>` (resuelto con `new URL(..., import.meta.url)`) y asigna el resultado con `container.innerHTML`.
- Después se llama a `inicializarMenuMobile()` para activar el menú hamburguesa.
- `renderizarCatalogoHome()` no se ejecuta aquí: solo corre si existe `#products-grid-container`, que solo está en el home.

Por eso se usa `type="module"` en el script (necesario para `import` y `import.meta.url`) y rutas con `../`, porque la página vive dentro de `pages/`.

## 3. HTML (`pages/finca.html`)

### Elementos del `<head>`

| Elemento | Propiedad | Para qué sirve |
|---|---|---|
| `<html lang="es">` | `lang` | Idioma, para lectores de pantalla y SEO |
| `<meta name="viewport">` | `width=device-width, initial-scale=1.0` | Hace que el diseño responsive funcione en móvil |
| `<meta name="description">` | `content` | Texto que muestran los buscadores |
| `<title>` | — | Título de la pestaña |
| `<link rel="icon">` | `href="data:image/svg+xml,..."` | Favicon en SVG incrustado, sin archivo extra |
| `<link rel="preconnect">` | `href`, `crossorigin` | Acelera la carga de Google Fonts |
| Google Fonts | `family=Poppins` | Tipografía del proyecto |
| Boxicons (CDN) | — | Iconos `bx bxs-map` y `bx bx-right-arrow-alt` |

### Secciones del `<main>`

**1. Hero (`section.finca-hero`)**
- `<img class="finca-hero-bg">` ocupa todo el fondo, con `alt` descriptivo.
- `<div class="finca-hero-wrapper">` contiene el texto por encima de la imagen.
- `<h4 class="subtitle finca-eyebrow">` es el texto pequeño superior. `subtitle` viene de `styles.css`.
- `<h1 class="banner-title">` es el título principal. Hay un solo `h1` por página. El `<span class="finca-highlight">` resalta el apellido en color dorado y cursiva.
- `<p class="finca-location">` muestra el icono de ubicación y la vereda.

**2. Cita e historia (`section.finca-story`)**
- Una cuadrícula de dos columnas: a la izquierda la cita, a la derecha los párrafos.
- `<blockquote class="finca-quote">` es la etiqueta semántica correcta para una cita.

**3. Estadísticas (`section.finca-stats`)**
- Lleva `aria-label="La finca en cifras"` porque la sección no tiene un encabezado visible.
- Tres bloques `.finca-stat`, cada uno con `.finca-stat-number` y `.finca-stat-text`. Para añadir una cifra se duplica un bloque.

**4. Forma de cultivo (`section.finca-method`)**
- Dos mitades: `.finca-method-img` (foto) y `.finca-method-content` (texto sobre fondo verde).
- `<a class="btn btn-primary" href="mercado.html">` reutiliza el botón global y lleva al mercado.

### Clases reutilizadas de `styles.css`
`banner-title`, `title`, `subtitle`, `btn`, `btn-primary`.

## 4. CSS (`css/fincas.css`)

### Variables propias
Se declaran en `:root` solo para esta página:

| Variable | Valor | Uso |
|---|---|---|
| `--finca-sand` | `#efe8da` | Fondo de las estadísticas |
| `--finca-cream` | `#fbf8f1` | Fondo de la sección de historia |
| `--finca-muted` | `#4a4f48` | Texto de párrafos |

Además usa variables globales: `--color-brand-primary`, `--color-brand-accent`, `--color-brand-earth`, `--color-white`, `--max-width`, `--bg-hero-overlay` y `--bg-hero-mobile-overlay`.

### Propiedades principales por sección

**Hero**
- `.finca-hero`: `position: relative` (ancla de los elementos absolutos), `height: 480px`, `display: flex` con `align-items: flex-end` (texto abajo) y `overflow: hidden`.
- `.finca-hero-bg`: `position: absolute; inset: 0` con `object-fit: cover` para que la imagen llene el recuadro sin deformarse, y `object-position: center 30%` para mantener visible el rostro. Tiene `z-index: 1`.
- `.finca-hero::after`: pseudo-elemento con `background: var(--bg-hero-overlay)`. Es el degradado oscuro que da legibilidad al texto. Tiene `z-index: 2`.
- `.finca-hero-wrapper`: `z-index: 3`, para quedar encima del degradado. `width: 75%` con `margin: 0 auto` lo centra.

**Historia**
- `.finca-story-grid`: `display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr)`. Son dos columnas iguales. `minmax(0, …)` evita que el contenido desborde. `gap: 64px` y `align-items: center`.
- `.finca-story-text p + p`: el selector adyacente añade separación solo entre párrafos.

**Estadísticas**
- `.finca-stats-grid`: `display: flex; justify-content: space-between`.
- `.finca-stat`: `flex: 1` reparte el ancho en partes iguales.
- `.finca-stat:not(:last-child)`: dibuja una línea vertical separadora (`border-right`) en todos menos el último.

**Forma de cultivo**
- `.finca-method`: `display: grid; grid-template-columns: 1fr 1fr` con `min-height: 480px`.
- `.finca-method-img img`: `width/height: 100%` y `object-fit: cover`.
- `.finca-method-content`: `display: flex; flex-direction: column; justify-content: center; align-items: flex-start; gap: 20px`. Apila el texto y lo centra verticalmente.

### Diseño responsive (media queries)

| Breakpoint | Cambios |
|---|---|
| `width < 992px` (tablet) | Historia en una sola columna; la sección de cultivo se apila (imagen de 320px de alto arriba, texto debajo); los contenedores pasan a `width: 85%` |
| `width < 768px` (móvil) | Hero de 420px con degradado vertical (`--bg-hero-mobile-overlay`); cita a 26px; estadísticas en columna sin líneas separadoras |

Se usa la sintaxis moderna `@media (width < 992px)`, igual que `styles.css` y `contacto.css`.

### Convenciones
- Todas las clases propias llevan el prefijo `finca-`, para no chocar con las de otras páginas (`hero`, `about`, `contact`).
- No se usa `!important`: los conflictos de especificidad se resolvieron repitiendo el selector (`.finca-stat:not(:last-child)` dentro del media query).

## 5. JavaScript

Esta página **no tiene JS propio**. Lo que usa es:

| Función (en `js/app.js` y `js/components/`) | Qué hace en esta página |
|---|---|
| `initializeApp()` | Arranca la carga de los componentes |
| `loadComponent(containerId, fileName)` | Trae `header.html` y `footer.html` con `fetch` y los inserta |
| `inicializarMenuMobile()` | Activa el menú móvil del header |

## 6. Accesibilidad

- Un único `<h1>` y jerarquía de encabezados ordenada.
- `alt` descriptivo en las dos imágenes.
- `aria-label` en la sección de cifras.
- Etiquetas semánticas: `main`, `section`, `blockquote`, `nav` (en el header).
- El degradado del hero garantiza el contraste del texto blanco.

## 7. Cómo editar el contenido

| Quiero cambiar… | Dónde |
|---|---|
| Nombre de la familia o vereda | Hero en `finca.html` |
| La cita o la historia | `.finca-quote` y `.finca-story-text` |
| Las cifras | `.finca-stat-number` y `.finca-stat-text` |
| Las fotos | Atributos `src` y `alt` de las dos `<img>` |
| Colores | Variables en `:root` de `fincas.css` o `styles.css` |
| Altura del hero | `height` de `.finca-hero` |
