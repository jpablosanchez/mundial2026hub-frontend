import axios from 'axios';
import api from './apiClient';

const BASE_URL = 'http://localhost:8080';

// HU-01: Registro — RegistroRequest fields: nombres, apellidos, correoUsuario, claveUsuario
export const registrarUsuario = async (datos) => {
    const body = {
        nombres: datos.nombre,
        apellidos: datos.apellido,
        correoUsuario: datos.correo,
        claveUsuario: datos.contrasena,
    };
    const response = await axios.post(`${BASE_URL}/usuario/registro`, body);
    return response.data;
};

// HU-02: Login — LoginRequest uses @JsonProperty: "correo" y "clave"
export const loginUsuario = async (datos) => {
    const body = {
        correo: datos.correo,
        clave: datos.contrasena,
    };
    const response = await axios.post(`${BASE_URL}/usuario/login`, body);
    return response.data;
};

// HU-03: Guardar preferencias
export const guardarPreferencias = async (idUsuario, datos) => {
    const response = await api.post(`/preferencia/${idUsuario}`, datos);
    return response.data;
};

// HU-04: Obtener preferencias
export const obtenerPreferencias = async (idUsuario) => {
    const response = await api.get(`/preferencia/${idUsuario}`);
    return response.data;
};

// HU-04: Editar preferencias
export const editarPreferencias = async (idUsuario, datos) => {
    const response = await api.put(`/preferencia/${idUsuario}`, datos);
    return response.data;
};

// HU-01b: Verificar correo
export const verificarCorreo = async (token) => {
    const response = await axios.get(`${BASE_URL}/usuario/verificar`, { params: { token } });
    return response.data;
};