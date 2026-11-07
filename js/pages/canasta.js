
const CLAVE_CARRITO = "rdv:carrito";
const EVENTO_CARRITO_ACTUALIZADO = "rdv:carrito-actualizado";

let costoEnvio = 0;

const formatoCOP = new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0
});

function leerCarrito() {
    try {
        const datos = JSON.parse(
            localStorage.getItem(CLAVE_CARRITO) || "[]"
        );

        if (!Array.isArray(datos)) return [];

        return datos
            .filter(item =>
                item &&
                item.id != null &&
                Number(item.cantidad) > 0
            )
            .map(item => ({
                ...item,
                id: String(item.id),
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
        localStorage.setItem(
            CLAVE_CARRITO,
            JSON.stringify(carrito)
        );

        document.dispatchEvent(
            new CustomEvent(EVENTO_CARRITO_ACTUALIZADO, {
                detail: { carrito }
            })
        );

        return true;
    } catch (error) {
        console.error("No se pudo guardar el carrito:", error);
        return false;
    }
}

function crearElemento(tag, clase, texto) {
    const elemento = document.createElement(tag);

    if (clase) elemento.className = clase;
    if (texto !== undefined) elemento.textContent = texto;

    return elemento;
}

function inicializarCanasta() {
    const lista = document.getElementById("listaCanasta");
    const estadoVacio = document.getElementById("canastaVacia");
    const cantidadProductos = document.getElementById("cantidadProductos");

    const subtotalElemento = document.getElementById("subtotalCanasta");
    const envioElemento = document.getElementById("envioCanasta");
    const totalElemento = document.getElementById("totalCanasta");

    const botonContinuar = document.getElementById("continuarPago");
    const modal = document.getElementById("modalFacturacion");
    const botonCerrarModal = document.getElementById("cerrarModalFacturacion");

    const botonAplicarDescuento = document.getElementById("aplicarDescuento");
    const codigoDescuento = document.getElementById("codigoDescuento");
    const mensajeDescuento = document.getElementById("mensajeDescuento");

    if (!lista || !estadoVacio) return;

    let carrito = leerCarrito();

    function renderizar() {
        lista.replaceChildren();

        const unidades = carrito.reduce(
            (suma, item) => suma + item.cantidad,
            0
        );

        const subtotal = carrito.reduce(
            (suma, item) => suma + item.precio * item.cantidad,
            0
        );

        const total = subtotal + costoEnvio;

        cantidadProductos.textContent =
            `${unidades} ${unidades === 1 ? "producto" : "productos"}`;

        subtotalElemento.textContent = formatoCOP.format(subtotal);
        envioElemento.textContent = formatoCOP.format(costoEnvio);
        totalElemento.textContent = formatoCOP.format(total);

        estadoVacio.hidden = carrito.length > 0;
        lista.hidden = carrito.length === 0;
        botonContinuar.disabled = carrito.length === 0;

        carrito.forEach(item => {
            const articulo = crearElemento("article", "canasta-item");

            const imagen = crearElemento("img", "canasta-item-imagen");
            imagen.alt = item.nombre || "Producto del mercado";

            if (item.imagen) {
                imagen.src = item.imagen;

                imagen.addEventListener("error", () => {
                    imagen.hidden = true;
                }, { once: true });
            } else {
                imagen.hidden = true;
            }

            const detalle = crearElemento(
                "div",
                "canasta-item-detalle"
            );

            const categoria = crearElemento(
                "span",
                "canasta-item-categoria",
                item.categoria || "Sin categoría"
            );

            const nombre = crearElemento(
                "h2",
                "canasta-item-nombre",
                item.nombre || "Producto"
            );

            const presentacion = crearElemento(
                "span",
                "canasta-item-presentacion",
                item.unidad || "Presentación no especificada"
            );

            // Botón para eliminar individualmente el producto.
            const eliminar = crearElemento(
                "button",
                "canasta-item-eliminar"
            );

            eliminar.type = "button";
            eliminar.dataset.accion = "eliminar";
            eliminar.dataset.id = item.id;

            eliminar.setAttribute(
                "aria-label",
                `Eliminar ${item.nombre || "producto"}`
            );

            const iconoEliminar = crearElemento(
                "i",
                "bx bx-trash"
            );

            iconoEliminar.setAttribute("aria-hidden", "true");

            eliminar.append(
                iconoEliminar,
                document.createTextNode("Eliminar")
            );

            detalle.append(
                categoria,
                nombre,
                presentacion,
                eliminar
            );

            // Controles de cantidad.
            const controles = crearElemento(
                "div",
                "canasta-cantidad"
            );

            const menos = crearElemento("button", "", "−");
            menos.type = "button";
            menos.dataset.accion = "restar";
            menos.dataset.id = item.id;

            menos.setAttribute(
                "aria-label",
                `Restar una unidad de ${item.nombre}`
            );

            const cantidad = crearElemento(
                "span",
                "",
                String(item.cantidad)
            );

            const mas = crearElemento("button", "", "+");
            mas.type = "button";
            mas.dataset.accion = "sumar";
            mas.dataset.id = item.id;

            mas.setAttribute(
                "aria-label",
                `Agregar una unidad de ${item.nombre}`
            );

            controles.append(menos, cantidad, mas);

            const precio = crearElemento(
                "strong",
                "canasta-item-subtotal",
                formatoCOP.format(item.precio * item.cantidad)
            );

            articulo.append(
                imagen,
                detalle,
                controles,
                precio
            );

            lista.append(articulo);
        });
    }

    function sincronizarDesdeAlmacenamiento() {
        carrito = leerCarrito();
        renderizar();
    }

    function actualizar() {
        if (!guardarCarrito(carrito)) {
            alert("No se pudieron guardar los cambios de tu canasta.");
        }

        renderizar();
    }

    
    lista.addEventListener("click", evento => {
        const boton = evento.target.closest(
            "button[data-accion]"
        );

        if (!boton) return;

        const id = boton.dataset.id;
        const accion = boton.dataset.accion;

        const indice = carrito.findIndex(
            item => String(item.id) === String(id)
        );

        if (indice === -1) return;

        if (accion === "sumar") {
            carrito[indice].cantidad += 1;

        } else if (accion === "restar") {
            carrito[indice].cantidad -= 1;

            if (carrito[indice].cantidad <= 0) {
                carrito.splice(indice, 1);
            }

        } else if (accion === "eliminar") {
            carrito.splice(indice, 1);
        }

        actualizar();
    });

    
    botonContinuar.addEventListener("click", () => {
        if (carrito.length === 0) return;

        if (typeof modal.showModal === "function") {
            modal.showModal();
        } else {
            alert("Tu canasta está lista para ser facturada");
        }
    });

    botonCerrarModal.addEventListener("click", () => {
        modal.close();
    });

    modal.addEventListener("click", evento => {
        if (evento.target === modal) {
            modal.close();
        }
    });

    // El descuento queda pendiente de implementar.
    botonAplicarDescuento.addEventListener("click", () => {
        const codigo = codigoDescuento.value.trim();

        mensajeDescuento.textContent = codigo
            ? "Los códigos de descuento estarán disponibles próximamente."
            : "Escribe un código para continuar.";

        mensajeDescuento.hidden = false;
    });

    
    document.addEventListener(
        EVENTO_CARRITO_ACTUALIZADO,
        sincronizarDesdeAlmacenamiento
    );

    
    window.addEventListener("storage", evento => {
        if (evento.key === CLAVE_CARRITO) {
            sincronizarDesdeAlmacenamiento();
        }
    });

    renderizar();
}

inicializarCanasta();
