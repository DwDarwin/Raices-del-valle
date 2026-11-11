# Raíces del Valle

Raíces del Valle conecta el trabajo de la familia Chindoy con las personas que
valoran el origen de lo que consumen. Este aplicativo web transforma su
producción campesina en una experiencia digital cercana, permitiéndoles mostrar
su trabajo y acercar a los clientes a una compra consciente, con identidad y
sin intermediarios innecesarios.

## Tecnologías

- HTML
- CSS3
- JavaScript ES Modules

## Instalación y ejecución

```bash
git clone https://github.com/DwDarwin/Raices-del-valle.git
cd Raices-del-valle
```

El proyecto no requiere instalación de dependencias. Para ejecutarlo
localmente, abre `index.html` con un servidor local.

## Arquitectura

Frontend modular desarrollado con JavaScript vanilla. La aplicación organiza
sus responsabilidades en:

- `pages`: lógica específica de cada página.
- `components`: componentes visuales reutilizables.
- `storage`: persistencia y operaciones CRUD por entidad.
- `services`: integraciones externas.
- `utils`: funciones compartidas.

---

```text
Raices-del-valle/
├── index.html             # Pagina principal
├── pages/                 # Paginas HTML y componentes compartidos
├── css/
│   ├── base/              # Estilos base
│   ├── components/        # Estilos de componentes
│   ├── layout/            # Header, footer y estructura general
│   └── pages/             # Estilos específicos por pagina
├── js/
│   ├── app.js             # Inicializacion general
│   ├── pages/             # Logica de cada pagina
│   ├── components/        # Componentes reutilizables
│   ├── storage/           # Persistencia y CRUD por entidad
│   ├── services/          # Integraciones externas
│   ├── utils/             # Utilidades compartidas
│   └── data/              # Datos iniciales
└── assets/                # Imágenes y recursos visuales

```

## Funcionalidades

- Catálogo de productos y detalle de producto.
- Carrito de compras y actualización de cantidades.
- Checkout con código de descuento.
- Registro, inicio y cierre de sesión.
- Administración de productos.
- Formulario de contacto.
- Suscripción con cupón de descuento.

## Integrantes

- Amanda Chindoy
- Diego Moreno
- Evelyn Pascual
- Darwin Noriega
