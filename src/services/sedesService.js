import axios from 'axios';

const BASE = (process.env.REACT_APP_API_URL || 'http://localhost:8080') + '/sedes';
const orEmpty = (p) => p.catch(e => { if (e.response?.status === 404) return { data: [] }; throw e; });

export const getAllSedes     = () => orEmpty(axios.get(BASE));
export const getSedeById    = (id)   => axios.get(`${BASE}/${id}`);
export const getSedesByPais = (pais) => orEmpty(axios.get(`${BASE}/pais/${encodeURIComponent(pais)}`));
export const getSedesMapa   = ()     => orEmpty(axios.get(`${BASE}/mapa`));
