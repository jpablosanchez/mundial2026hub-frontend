import axios from 'axios';
import api from './apiClient';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

const safe = (promise, fallback) =>
  promise.catch((err) => {
    if (err.response?.status === 404 || err.response?.status === 204) {
      return { data: fallback };
    }
    throw err;
  });

// Stats + lista LaminaUsuario del usuario: { album, totalLaminas, laminasObtenidas, porcentaje }
export const getAlbumUsuario = (idUsuario) =>
  safe(
    axios.get(`${BASE_URL}/lamina/album/${idUsuario}`),
    { album: [], totalLaminas: 0, laminasObtenidas: 0, porcentaje: 0 }
  );

// Todas las láminas del catálogo: Lamina[]
export const getAllLaminas = () =>
  safe(axios.get(`${BASE_URL}/lamina/getAll`), []);

// Láminas repetidas del usuario: LaminaUsuario[] donde cantidad > 1
export const getLaminasRepetidas = (idUsuario) =>
  safe(axios.get(`${BASE_URL}/lamina/repetidas/${idUsuario}`), []);

// Abrir sobre: devuelve { mensaje, laminasObtenidas: Lamina[], nuevas: N, repetidas: N }
export const abrirSobre = (idUsuario) =>
  api.post(`/lamina/abrirPaquete/${idUsuario}`);

// Intercambios pendientes donde el usuario es receptor: IntercambioLamina[]
export const getIntercambios = (idUsuario) =>
  safe(api.get(`/intercambio/pendientes/${idUsuario}`), []);

export const solicitarIntercambio = (data) =>
  api.post('/intercambio/solicitar', data);

export const aceptarIntercambio = (idIntercambio) =>
  api.put(`/intercambio/aceptar/${idIntercambio}`);

export const rechazarIntercambio = (idIntercambio) =>
  api.put(`/intercambio/rechazar/${idIntercambio}`);

export const ponerEnIntercambio = (idLaminaUsuario) =>
  api.put(`/lamina/enIntercambio/${idLaminaUsuario}`);
