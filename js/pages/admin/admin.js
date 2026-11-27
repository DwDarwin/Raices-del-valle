import { configurarRutasNavegacion } from "../../utils/rutas.js";
import { inicializarModuloInventario } from "./adminInventario.js";
import {
  inicializarNavegacionAdmin,
  inicializarSesionAdmin,
} from "./adminNavegacion.js";
import { inicializarModuloPedidos } from "./adminPedidos.js";

function inicializarPanelAdmin() {

  // Primero comprobar que el usuario sea administrador
  if (!inicializarSesionAdmin()) {
    return;
  }

  configurarRutasNavegacion(document);

  inicializarNavegacionAdmin();
  inicializarModuloInventario();
  inicializarModuloPedidos();
}



inicializarPanelAdmin();
