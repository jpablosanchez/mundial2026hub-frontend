import axios from 'axios';

const BASE_URL = 'http://localhost:8080';

const orEmpty = (promise) =>
  promise.catch((err) => {
    if (err.response?.status === 404) return { data: [] };
    throw err;
  });

export const getTodosLosPartidos = () =>
  orEmpty(axios.get(`${BASE_URL}/partido/getAll`));

export const sincronizarPartidos = () =>
  axios.get(`${BASE_URL}/partido/sincronizar`);

export const getPartidosPorEquipo = (equipo) =>
  orEmpty(axios.get(`${BASE_URL}/partido/equipo/${encodeURIComponent(equipo)}`));
