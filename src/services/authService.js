import axios from 'axios';

const BASE_URL = 'http://localhost:8080';

// HU-01: Registro
export const registrarUsuario = async (datos) => {
    const response = await axios.post(`${BASE_URL}/usuario/registro`, datos);
    return response.data;
};

// HU-02: Login
export const loginUsuario = async (datos) => {
    const response = await axios.post(`${BASE_URL}/usuario/login`, datos);
    return response.data;
};

// HU-03: Guardar preferencias
export const guardarPreferencias = async (idUsuario, datos) => {
    const response = await axios.post(`${BASE_URL}/preferencia/${idUsuario}`, datos);
    return response.data;
};

// HU-04: Obtener preferencias
export const obtenerPreferencias = async (idUsuario) => {
    const response = await axios.get(`${BASE_URL}/preferencia/${idUsuario}`);
    return response.data;
};

// HU-04: Editar preferencias
export const editarPreferencias = async (idUsuario, datos) => {
    const response = await axios.put(`${BASE_URL}/preferencia/${idUsuario}`, datos);
    return response.data;
};

// HU-01b: Verificar correo
export const verificarCorreo = async (token) => {
    const response = await axios.get(`${BASE_URL}/usuario/verificar`, { params: { token } });
    return response.data;
};