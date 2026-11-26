// reemplazar por URL del backend desplegado
const API_BASE_URL = "http://localhost:8080";

export const API_URL = `${API_BASE_URL}/api`;

export const API_ENDPOINTS = {
    productos: `${API_URL}/productos`,
    pedidos: `${API_URL}/pedidos`
};
