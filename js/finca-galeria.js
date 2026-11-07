// Galería de la página "La finca": abre la foto ampliada en un diálogo.
const lightbox = document.getElementById("finca-lightbox");

if (lightbox) {
  const lightboxImg = lightbox.querySelector("img");
  const lightboxCaption = lightbox.querySelector(".finca-lightbox-caption");

  document.querySelectorAll(".finca-gallery-item").forEach((item) => {
    item.querySelector(".finca-gallery-btn").addEventListener("click", () => {
      const img = item.querySelector("img");
      lightboxImg.src = img.currentSrc || img.src;
      lightboxImg.alt = img.alt;
      lightboxCaption.textContent = item.querySelector("figcaption").textContent;
      lightbox.showModal();
    });
  });

  // Cierra con la X o al hacer clic fuera de la foto (Esc ya lo cierra por defecto)
  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox || event.target.closest(".finca-lightbox-close")) {
      lightbox.close();
    }
  });
}
