const CLAVE_CARRITO = "rdv:carrito";

function formatearPrecio(precio) {
    return new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: "COP",
        maximumFractionDigits: 0
    }).format(Number(precio) || 0);
}

function leerCarrito() {
    try {
        const datos = JSON.parse(localStorage.getItem(CLAVE_CARRITO));

        if (!Array.isArray(datos)) {
            return [];
        }

        return datos
            .filter(item =>
                item &&
                item.id != null &&
                Number(item.cantidad) > 0
            )
            .map(item => ({
                ...item,
                cantidad: Math.floor(Number(item.cantidad)),
                precio: Number(item.precio) || 0
            }));
    } catch (error) {
        console.error("Error leyendo el carrito:", error);
        return [];
    }
}

function guardarCarrito(carrito) {
    try {
        localStorage.setItem(CLAVE_CARRITO, JSON.stringify(carrito));
        return true;
    } catch (error) {
        console.error("No se pudo guardar el carrito:", error);
        return false;
    }
}

function obtenerProductosCatalogo() {
    try {
        if (typeof window.leerProductos === "function") {
            const productos = window.leerProductos();
            return Array.isArray(productos) ? productos : [];
        }

        const datos = JSON.parse(
            localStorage.getItem("rdv:productos") || "[]"
        );

        return Array.isArray(datos) ? datos : [];
    } catch (error) {
        console.error("No se pudieron leer los productos:", error);
        return [];
    }
}

function normalizarProducto(producto) {
    return {
        id: String(producto.id),
        nombre: producto.name ?? producto.nombre ?? "Producto",
        precio: Number(producto.price ?? producto.precio) || 0,
        unidad: producto.unit ?? producto.unidadVenta ?? "",
        imagen: producto.image ?? producto.imagen ?? ""
    };
}

export function inicializarCarrito() {
    const botonCarrito = document.getElementById("botonCarrito");
    const panelCarrito = document.getElementById("panelCarrito");
    const cerrarCarrito = document.getElementById("cerrarCarrito");
    const listaCarrito = document.getElementById("listaCarrito");
    const contadorCarrito = document.getElementById("contadorCarrito");
    const resumenCarrito = document.getElementById("resumenCarrito");
    const carritoVacio = document.getElementById("carritoVacio");
    const pieCarrito = document.getElementById("pieCarrito");
    const totalCarrito = document.getElementById("totalCarrito");
    const vaciarCarrito = document.getElementById("vaciarCarrito");
    const terminarCompra = document.getElementById("terminarCompra");
    const mensajeCarrito = document.getElementById("mensajeCarrito");

   
    if (
        !botonCarrito ||
        !panelCarrito ||
        !listaCarrito ||
        !contadorCarrito
    ) {
        return;
    }

    let carrito = leerCarrito();

    function mostrarMensaje(mensaje) {
        mensajeCarrito.textContent = mensaje;
        mensajeCarrito.hidden = false;
    }

    function limpiarMensaje() {
        mensajeCarrito.textContent = "";
        mensajeCarrito.hidden = true;
    }

    function abrirCarrito() {
        panelCarrito.hidden = false;
        botonCarrito.setAttribute("aria-expanded", "true");
    }

    function cerrarPanel() {
        panelCarrito.hidden = true;
        botonCarrito.setAttribute("aria-expanded", "false");
    }

    function crearElemento(tag, clase, texto) {
        const elemento = document.createElement(tag);

        if (clase) {
            elemento.className = clase;
        }

        if (texto !== undefined) {
            elemento.textContent = texto;
        }

        return elemento;
    }

    function renderizarCarrito() {
        listaCarrito.replaceChildren();
        
        const cantidadTotal = carrito.reduce(
            (total, item) => total + item.cantidad,
            0
        );

        const total = carrito.reduce(
            (suma, item) => suma + item.precio * item.cantidad,
            0
        );

        contadorCarrito.textContent = cantidadTotal > 99
            ? "99+"
            : String(cantidadTotal);

        botonCarrito.setAttribute(
            "aria-label",
            `Abrir carrito, ${cantidadTotal} ${cantidadTotal === 1 ? "producto" : "productos"
            }`
        );

        resumenCarrito.textContent =
            `${cantidadTotal} ${cantidadTotal === 1 ? "producto" : "productos"}`;

        totalCarrito.textContent = formatearPrecio(total);

        carritoVacio.hidden = carrito.length > 0;
        pieCarrito.hidden = carrito.length === 0;

        carrito.forEach(item => {
            const articulo = crearElemento("article", "carrito-item");

            const imagen = crearElemento("img", "carrito-item-imagen");
            imagen.alt = item.nombre;

            if (item.imagen) {
                imagen.src = item.imagen;
            } else {
                imagen.hidden = true;
            }

            imagen.addEventListener("error", () => {
                imagen.hidden = true;
            }, { once: true });

            const contenido = crearElemento(
                "div",
                "carrito-item-contenido"
            );

            const nombre = crearElemento(
                "h3",
                "carrito-item-nombre",
                item.nombre
            );

            const presentacion = crearElemento(
                "span",
                "carrito-item-presentacion",
                item.unidad
            );

            const precio = crearElemento(
                "span",
                "carrito-item-precio",
                `${formatearPrecio(item.precio)}${item.unidad ? ` / ${item.unidad}` : " c/u"}`
            );

            const final = crearElemento("div", "carrito-item-final");
            const controles = crearElemento("div", "carrito-cantidad");

            const botonMenos = crearElemento("button", "", "−");
            botonMenos.type = "button";
            botonMenos.dataset.accion = "restar";
            botonMenos.dataset.id = item.id;
            botonMenos.setAttribute(
                "aria-label",
                `Restar una unidad de ${item.nombre}`
            );

            const cantidad = crearElemento(
                "span",
                "",
                String(item.cantidad)
            );

            const botonMas = crearElemento("button", "", "+");
            botonMas.type = "button";
            botonMas.dataset.accion = "sumar";
            botonMas.dataset.id = item.id;
            botonMas.setAttribute(
                "aria-label",
                `Agregar una unidad de ${item.nombre}`
            );

            controles.append(botonMenos, cantidad, botonMas);

            const subtotal = crearElemento(
                "span",
                "carrito-item-subtotal",
                formatearPrecio(item.precio * item.cantidad)
            );

            final.append(controles, subtotal);
            contenido.append(nombre);

            if (item.unidad) {
                contenido.append(presentacion);
            }

            contenido.append(precio, final);
            articulo.append(imagen, contenido);
            listaCarrito.append(articulo);
        });
    }

    function actualizarCarrito() {
        const panelEstabaAbierto = !panelCarrito.hidden;

        const guardado = guardarCarrito(carrito);

        renderizarCarrito();
        
        if (panelEstabaAbierto) {
            panelCarrito.hidden = false;
            botonCarrito.setAttribute("aria-expanded", "true");
        }

        if (!guardado) {
            mostrarMensaje(
                "No se pudo guardar el carrito en este navegador. " +
                "Tus cambios podrían perderse al recargar."
            );
        }
    }

    function agregarProducto(productoId, cantidad = 1) {
        const productos = obtenerProductosCatalogo();

        const productoOriginal = productos.find(
            producto => String(producto.id) === String(productoId)
        );

        if (!productoOriginal) {
            mostrarMensaje(
                "No encontramos ese producto en el catálogo. " +
                "Actualiza la página e inténtalo de nuevo."
            );
            return;
        }

        const producto = normalizarProducto(productoOriginal);

        const existente = carrito.find(
            item => String(item.id) === producto.id
        );

        limpiarMensaje();

        if (existente) {
            existente.cantidad += cantidad;
        } else {
            carrito.push({
                ...producto,
                cantidad
            });
        }

        actualizarCarrito();
    }

    botonCarrito.addEventListener("click", () => {
        if (panelCarrito.hidden) {
            abrirCarrito();
        } else {
            cerrarPanel();
        }
    });

    cerrarCarrito.addEventListener("click", cerrarPanel);
    
    listaCarrito.addEventListener("click", evento => {
        const boton = evento.target.closest("button[data-accion]");

        if (!boton) {
            return;
        }

        const id = boton.dataset.id;
        const accion = boton.dataset.accion;

        const indice = carrito.findIndex(
            item => String(item.id) === String(id)
        );

        if (indice === -1) {
            return;
        }

        limpiarMensaje();

        if (accion === "sumar") {
            carrito[indice].cantidad += 1;
        }

        if (accion === "restar") {
            carrito[indice].cantidad -= 1;

            if (carrito[indice].cantidad <= 0) {
                carrito.splice(indice, 1);
            }
        }

        actualizarCarrito();
    });

    vaciarCarrito.addEventListener("click", () => {
        carrito = [];
        limpiarMensaje();
        actualizarCarrito();
    });

    terminarCompra.addEventListener("click", () => {
        mostrarMensaje(
            "El proceso de compra todavía no está habilitado. " +
            "Tus productos permanecen en el carrito."
        );
    });
   
    document.addEventListener("raices:agregar-carrito", evento => {
        const detalle = evento.detail;

        if (!detalle || detalle.productoId == null) {
            return;
        }

        agregarProducto(
            detalle.productoId,
            Math.max(1, Math.floor(Number(detalle.cantidad) || 1))
        );
    });

    document.addEventListener("click", evento => {
        if (panelCarrito.hidden) {
            return;
        }

        const objetivo = evento.target;
   
        if (
            objetivo instanceof Element &&
            (
                objetivo.closest("#panelCarrito") ||
                objetivo.closest("#botonCarrito")
            )
        ) {
            return;
        }

        cerrarPanel();
    }, true);

    document.addEventListener("keydown", evento => {
        if (evento.key === "Escape" && !panelCarrito.hidden) {
            cerrarPanel();
            botonCarrito.focus();
        }
    });
   
    window.addEventListener("storage", evento => {
        if (evento.key === CLAVE_CARRITO) {
            carrito = leerCarrito();
            renderizarCarrito();
        }
    });

    renderizarCarrito();
}