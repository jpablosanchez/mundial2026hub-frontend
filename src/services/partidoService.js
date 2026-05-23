import axios from 'axios';
import api from './apiClient';

const BASE_URL = 'http://localhost:8080';

// El backend devuelve 404 cuando la lista está vacía (no es un error real).
// Este helper convierte 404 en array vacío para no romper el frontend.
const orEmpty = (promise) =>
    promise.catch((err) => {
        if (err.response?.status === 404) return { data: [] };
        throw err;
    });

// HU-05: Próximos partidos (estado PROGRAMADO)
export const getProximosPartidos = () =>
    orEmpty(axios.get(`${BASE_URL}/partido/proximos`));

// HU-07: Resultados (estado FINALIZADO)
export const getResultados = () =>
    orEmpty(axios.get(`${BASE_URL}/partido/resultados`));

// HU-07: Partidos en juego
export const getEnJuego = () =>
    orEmpty(axios.get(`${BASE_URL}/partido/enJuego`));

// Detalle de un partido por ID
export const getPartidoPorId = (id) =>
    axios.get(`${BASE_URL}/partido/${id}`);

// HU-06: Filtrar por ciudad (PathVariable en el backend)
export const getAgendaPorCiudad = (ciudad) =>
    orEmpty(axios.get(`${BASE_URL}/partido/ciudad/${encodeURIComponent(ciudad)}`));

// HU-06: Filtrar por estadio (PathVariable en el backend)
export const getAgendaPorEstadio = (estadio) =>
    orEmpty(axios.get(`${BASE_URL}/partido/estadio/${encodeURIComponent(estadio)}`));

// HU-06: Agendar partido → POST /agenda/agregar con {idUsuario, idPartido}
export const agregarAgenda = (idUsuario, idPartido) =>
    api.post('/agenda/agregar', { idUsuario, idPartido });

// HU-06: Quitar partido de agenda personal
export const eliminarAgenda = (id) =>
    api.delete(`/agenda/${id}`);
