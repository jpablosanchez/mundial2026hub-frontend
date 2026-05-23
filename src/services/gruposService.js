import axios from 'axios';

const BASE_URL = 'http://localhost:8080';

const orEmpty = (promise) =>
  promise.catch((err) => {
    if (err.response?.status === 404) return { data: [] };
    throw err;
  });

// Endpoint dedicado de grupos (pendiente de implementación en el backend)
export const getTablaGrupos = () =>
  orEmpty(axios.get(`${BASE_URL}/grupo/tabla`));

// Todos los partidos — se usa para derivar standings por grupo en el frontend
export const getTodosPartidos = () =>
  orEmpty(axios.get(`${BASE_URL}/partido/getAll`));
