import axios from 'axios';
import api from './apiClient';

const BASE = 'http://localhost:8080';
const orEmpty = (p) => p.catch(e => { if (e.response?.status === 404) return { data: [] }; throw e; });
const orNull  = (p) => p.catch(e => { if (e.response?.status === 404) return { data: null };  throw e; });

// ── Partidos ──────────────────────────────────────────────────────────────────
export const getPartidosProximos = () => orEmpty(axios.get(`${BASE}/partido/proximos`));
export const getTodosPartidos    = () => orEmpty(axios.get(`${BASE}/partido/getAll`));
export const getPartidoById      = (id) => axios.get(`${BASE}/partido/${id}`);

// ── Entradas ──────────────────────────────────────────────────────────────────
export const getEntradasPorPartido = (idPartido) => orEmpty(axios.get(`${BASE}/entrada/partido/${idPartido}`));
export const getEntradasPorTitular = (idUsuario) => orEmpty(api.get(`/entrada/titular/${idUsuario}`));
export const getEntradasPorEstado  = (estado)    => orEmpty(axios.get(`${BASE}/entrada/estado/${estado}`));
export const getEntradaById        = (id)         => orNull(axios.get(`${BASE}/entrada/${id}`));

export const reservarEntrada = (data) => api.post('/entrada/reservar', data);
export const confirmarPago   = (idEntrada, idTransaccion) =>
  api.put(`/entrada/confirmarPago/${idEntrada}`, null, { params: { idTransaccion } });

// ── Facturas ──────────────────────────────────────────────────────────────────
export const getFacturaPorEntrada = (idEntrada) => orNull(api.get(`/factura/entrada/${idEntrada}`));
export const generarFactura       = (idEntrada) => api.post(`/factura/generar/${idEntrada}`);

export const descargarFacturaPdf = async (idFactura, numeroFactura = 'factura') => {
  const res = await api.get(`/factura/pdf/${idFactura}`, { responseType: 'blob' });
  const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
  const a   = document.createElement('a');
  a.href     = url;
  a.download = `${numeroFactura}.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const enviarFacturaCorreo = (idFactura) => api.post(`/factura/enviar/${idFactura}`);

// ── Transferencias ────────────────────────────────────────────────────────────
export const transferirEntrada          = (data)       => api.post('/transferencia/transferir', data);
export const getTransferenciasPorOrigen = (idUsuario)  => orEmpty(api.get(`/transferencia/origen/${idUsuario}`));

// ── Reembolsos ────────────────────────────────────────────────────────────────
export const solicitarReembolso        = (data)       => api.post('/reembolso/solicitar', data);
export const getReembolsosPorUsuario   = (idUsuario)  => orEmpty(api.get(`/reembolso/usuario/${idUsuario}`));
export const getReembolsosPendientes   = ()           => orEmpty(api.get('/reembolso/pendientes'));
export const getAllReembolsos          = ()           => orEmpty(api.get('/reembolso/getAll'));
export const aprobarReembolso          = (id, idTransaccionReembolso) =>
  api.put(`/reembolso/aprobar/${id}`, null, { params: { idTransaccionReembolso } });
export const rechazarReembolso         = (id, motivo) =>
  api.put(`/reembolso/rechazar/${id}`, null, motivo ? { params: { motivo } } : undefined);

// ── Usuarios ──────────────────────────────────────────────────────────────────
export const getUsuarioById = (id) => api.get(`/usuario/${id}`);
