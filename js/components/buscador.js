import { obtenerRutaProyecto } from "../utils/rutas.js";

export function inicializarBuscador() {
    const botonBuscar = document.getElementById("buscarProducto");
    const campoBusqueda = document.getElementById("busquedaProducto");

    if (!botonBuscar || !campoBusqueda) {
        return;
    }

    function buscarProducto() {
        const termino = campoBusqueda.value.trim();

        if (!termino) {
            campoBusqueda.focus();
            return;
        }

        const rutaMercado = new URL(
            `pages/mercado.html?buscar=${encodeURIComponent(termino)}`,
            obtenerRutaProyecto()
        );

        window.location.href = rutaMercado.href;
    }

    botonBuscar.addEventListener("click", buscarProducto);

    campoBusqueda.addEventListener("keydown", evento => {
        if (evento.key === "Enter") {
            buscarProducto();
        }
    });
}