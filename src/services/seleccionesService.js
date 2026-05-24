import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

const orEmpty = (promise) =>
  promise.catch((err) => {
    if (err.response?.status === 404) return { data: [] };
    throw err;
  });

export const getPartidosParaEquipos = () =>
  orEmpty(axios.get(`${BASE_URL}/partido/getAll`));

export const getLaminasPorEquipo = (nombre) =>
  orEmpty(axios.get(`${BASE_URL}/lamina/seleccion/${encodeURIComponent(nombre)}`));
