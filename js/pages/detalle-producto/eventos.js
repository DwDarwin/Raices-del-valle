import { formatearMoneda } from "../../utils/formato.js";

export function vincularEventosDetalle(producto, documento) {
  let cantidad = 1;
  const precioUnitario = producto.price;

  const botonRestar = documento.getElementById("btn-decrease");
  const botonSumar = documento.getElementById("btn-increase");
  const botonAgregar = documento.getElementById("btn-detail-add-cart");
  const textoCantidad = documento.getElementById("quantity-display");
  const textoTotal = documento.getElementById("cart-total-price");

  const actualizarCantidadYTotal = () => {
    if (textoCantidad) textoCantidad.textContent = cantidad;
    if (textoTotal) {
      textoTotal.textContent = formatearMoneda(precioUnitario * cantidad);
    }
  };

  botonRestar?.addEventListener("click", () => {
    if (cantidad > 1) {
      cantidad--;
      actualizarCantidadYTotal();
    }
  });

  botonSumar?.addEventListener("click", () => {
    cantidad++;
    actualizarCantidadYTotal();
  });

  botonAgregar?.addEventListener("click", () => {
    documento.dispatchEvent(
      new CustomEvent("raices:agregar-carrito", {
        detail: { productoId: producto.id, cantidad },
      }),
    );
  });

  vincularAcordeones(documento);
  vincularGaleria(documento);
}

function vincularAcordeones(documento) {
  const elementosAcordeon = documento.querySelectorAll(".accordion-item");

  elementosAcordeon.forEach((acordeon) => {
    acordeon.addEventListener("toggle", () => {
      if (acordeon.open) {
        elementosAcordeon.forEach((otroAcordeon) => {
          if (otroAcordeon !== acordeon) otroAcordeon.removeAttribute("open");
        });
      }
    });
  });
}

function vincularGaleria(documento) {
  const imagenPrincipal = documento.getElementById("main-product-img");
  const contenedorMiniaturas = documento.getElementById("gallery-thumbnails");

  if (!contenedorMiniaturas || !imagenPrincipal) return;

  contenedorMiniaturas.addEventListener("click", (evento) => {
    const miniaturaSeleccionada = evento.target.closest(".thumb");
    if (!miniaturaSeleccionada) return;

    contenedorMiniaturas
      .querySelectorAll(".thumb")
      .forEach((miniatura) => miniatura.classList.remove("active"));
    miniaturaSeleccionada.classList.add("active");

    const nuevaRuta = miniaturaSeleccionada.getAttribute("data-img");
    if (nuevaRuta) imagenPrincipal.src = nuevaRuta;
  });
}
