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

        window.location.href =
            `./mercado.html?buscar=${encodeURIComponent(termino)}`;
    }

    botonBuscar.addEventListener("click", buscarProducto);

    campoBusqueda.addEventListener("keydown", evento => {
        if (evento.key === "Enter") {
            buscarProducto();
        }
    });
}