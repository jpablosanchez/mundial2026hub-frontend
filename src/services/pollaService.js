import axios from 'axios';
import api from './apiClient';

const BASE = 'http://localhost:8080';
const orEmpty = (p) => p.catch(e => { if (e.response?.status === 404) return { data: [] }; throw e; });

// ── Pollas ────────────────────────────────────────────────────────────────────
export const getAllPollas        = () => orEmpty(axios.get(`${BASE}/polla/getAll`));
export const getPollasByCreador = (id) => orEmpty(api.get(`/polla/creador/${id}`));
export const getPollasByMiembro = (id) => orEmpty(api.get(`/polla/miembro/${id}`));
export const getMiembros        = (id) => orEmpty(axios.get(`${BASE}/polla/miembros/${id}`));
export const getRanking         = (id) => orEmpty(axios.get(`${BASE}/polla/ranking/${id}`));
export const crearPolla         = (data) => api.post('/polla/crear', data);
export const unirseAPolla       = (codigo, idUsuario) =>
  api.post(`/polla/unirse/${encodeURIComponent(codigo)}/${idUsuario}`);
export const cerrarPolla        = (id) => api.put(`/polla/cerrar/${id}`);

// ── Pronósticos ───────────────────────────────────────────────────────────────
export const getPronosticosByPolla   = (id) => orEmpty(axios.get(`${BASE}/pronostico/polla/${id}`));
export const getPronosticosByUsuario = (id) => orEmpty(api.get(`/pronostico/usuario/${id}`));
export const registrarPronostico     = (data) => api.post('/pronostico/registrar', data);

// ── Partidos ──────────────────────────────────────────────────────────────────
export const getProximosPartidos = () => orEmpty(axios.get(`${BASE}/partido/proximos`));
export const getTodosPartidos    = () => orEmpty(axios.get(`${BASE}/partido/getAll`));

// ── Usuarios ──────────────────────────────────────────────────────────────────
export const getUsuarioById = (id) => api.get(`/usuario/${id}`);
