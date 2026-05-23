import api from './apiClient';

const orEmpty = (promise) =>
  promise.catch((err) => {
    if (err.response?.status === 404) return { data: [] };
    throw err;
  });

export const getAgendaUsuario = (idUsuario) =>
  orEmpty(api.get(`/agenda/usuario/${idUsuario}`));

export const getNotificacionesUsuario = (idUsuario) =>
  orEmpty(api.get(`/notificacion/usuario/${idUsuario}`));
