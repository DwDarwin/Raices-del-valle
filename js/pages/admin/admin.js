import { configurarRutasNavegacion } from "../../utils/rutas.js";
import { inicializarModuloInventario } from "./adminInventario.js";
import {
  inicializarNavegacionAdmin,
  inicializarSesionAdmin,
} from "./adminNavegacion.js";
import { inicializarModuloPedidos } from "./adminPedidos.js";

function inicializarPanelAdmin() {
  configurarRutasNavegacion(document);
  inicializarSesionAdmin();
  inicializarNavegacionAdmin();
  inicializarModuloInventario();
  inicializarModuloPedidos();
}

inicializarPanelAdmin();
