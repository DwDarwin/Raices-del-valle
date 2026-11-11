# Guía de arquitectura del frontend

Este documento define las reglas  para mantener organizado el frontend
de nuestro proyecto Raíces del Valle. Su objetivo es evitar que se mezclen responsabilidades,
que se duplique código y que se creen nuevos accesos directos a
`localStorage`.

La aplicación utiliza JavaScript vanilla y módulos ES. No se debe incorporar
una arquitectura más compleja que la necesaria para resolver una funcionalidad.

## Principio general

Cada capa tiene una responsabilidad concreta:

- **Pages:** coordinan una página específica y sus casos de uso.
- **Components:** controlan una pieza visual reutilizable y sus eventos de UI.
- **Storage:** encapsula la persistencia y las operaciones relacionadas con
  una entidad o clave.
- **Services:** integran servicios externos, como Formspree.
- **Utils:** contienen utilidades realmente compartidas, por ejemplo rutas o
  formato de moneda.
- **Data:** contiene datos mock o datos iniciales, no la lógica de persistencia.

## Estructura vigente

```text
Raices-del-valle/
├── index.html
├── pages/
│   ├── header.html
│   ├── footer.html
│   └── *.html
├── css/
│   ├── base/
│   ├── components/
│   ├── layout/
│   └── pages/
├── js/
│   ├── app.js
│   ├── components/
│   ├── data/
│   ├── pages/
│   ├── services/
│   ├── storage/
│   └── utils/
└── docs/
```

## Responsabilidad de cada carpeta

### `js/pages`

Contiene la lógica propia de cada página. Los archivos se mantienen
directamente en esta carpeta para que sean fáciles de localizar.

Ejemplos:

- `js/pages/home.js`: productos destacados y eventos propios de Home.
- `js/pages/mercado.js`: catálogo y acciones del mercado.
- `js/pages/canasta.js`: renderizado y comportamiento de `canasta.html`.
- `js/pages/detalleProducto.js`: coordinación del detalle de producto.
- `js/pages/admin.js`, `login.js`, `registro.js`, `contacto.js` y `finca.js`.

Una página puede importar componentes, storage, servicios y utilidades. No debe
copiar la lógica de esas capas.

### `js/components`

Contiene funcionalidades visuales que se montan sobre el DOM:

- `carrito.js`: indicador y acciones visuales del carrito.
- `sesion.js`: usuario activo y cierre de sesión.
- `suscriptionModal.js`: formulario y modal de suscripción.
- `menuMobile.js`: menú móvil.

Un componente no debe implementar su propio acceso a `localStorage`. Debe usar
el módulo de storage correspondiente.

### `js/storage`

Cada módulo administra su propia clave, lectura, guardado, eliminación y
operaciones relacionadas. No existe un storage global.

- `carritoStorage.js`: clave `rdv:carrito` y operaciones del carrito.
- `sesionStorage.js`: clave `usuarioActivo` y sesión activa.
- `usuariosStorage.js`: clave `listaUsuarios` y CRUD de usuarios.
- `productoStorage.js`: clave `rdv:productos` y productos persistidos.
- `suscripcionStorage.js`: clave `rdv:suscripcion` y cupón de suscripción.

Las páginas y componentes no deben acceder directamente a `localStorage`.
Deben importar las funciones del storage responsable:

```js
import { obtenerCarrito, guardarCarrito } from "../storage/carritoStorage.js";
```

Si una funcionalidad necesita una nueva clave, se crea o se amplía el storage
de esa entidad. No se debe crear otra clave para los mismos datos ni copiar el
CRUD en una página.

### `js/services`

Contiene integraciones externas o procesos que no son persistencia local.

Ejemplo:

- `contactoFormspree.js`: envío del formulario de contacto a Formspree.

No se debe crear un service para envolver una función local sencilla si no
existe una integración externa o una responsabilidad independiente.

### `js/utils`

Contiene funciones reutilizables y sin estado de página:

- `rutas.js`: resolución de rutas y enlaces con `data-ruta`.
- `formato.js`: formato de moneda y valores.

Antes de crear una función utilitaria, se debe buscar si ya existe una función
equivalente.

## Reglas para agregar una funcionalidad

Antes de editar:

1. Identificar la página responsable.
2. Buscar funciones y módulos existentes relacionados.
3. Revisar si ya existe una clave o método de storage.
4. Reutilizar utilidades, componentes y eventos existentes.
5. Definir la responsabilidad del nuevo código antes de crear un archivo.

Al implementar:

- Mantener los cambios dentro de la página o módulo correspondiente.
- Separar renderizado, interacción y persistencia cuando la funcionalidad lo
  requiera.
- Usar nombres explícitos y consistentes con el código existente.
- Mantener funciones pequeñas y con una responsabilidad clara.
- Usar imports relativos correctos con extensión `.js`.
- No crear archivos que solo reexporten funciones sin aportar
  comportamiento.
- No mover lógica administrativa a módulos globales si solo se usa en
  Administración.
- No duplicar formatos de moneda, rutas, validaciones o acceso a storage.


## Lista de revisión antes de entregar cambios

1. La funcionalidad está en la página, componente, storage, service o util correcto.
2. No hay acceso directo a `localStorage` fuera de `js/storage`.
3. No se repiten claves, rutas, formatos ni validaciones existentes.
4. Los imports apuntan a archivos existentes y usan `.js`.
5. Los nombres son explícitos y consistentes.
6. Los cambios no afectan páginas no relacionadas.
7. Se ejecutó la validación apropiada: sintaxis, pruebas o revisión manual.
