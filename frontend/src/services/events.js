import api from './api'

export const eventsService = {
  getAll:   (params = {}) => api.get('/api/events', { params }),
  getOne:   (id)          => api.get(`/api/events/${id}`),
  create:   (data)        => api.post('/api/events', data),
  update:   (id, data)    => api.put(`/api/events/${id}`, data),
  archive:  (id)          => api.delete(`/api/events/${id}`),
  getTypes: ()            => api.get('/api/event-types'),
}

export const blocksService = {
  // Bloques
  getAll:  (eventId)       => api.get(`/api/events/${eventId}/blocks`),
  create:  (eventId, data) => api.post(`/api/events/${eventId}/blocks`, data),
  update:  (id, data)      => api.put(`/api/blocks/${id}`, data),
  remove:  (id)            => api.delete(`/api/blocks/${id}`),

  // Canciones en bloque
  addSong:    (blockId, data) => api.post(`/api/blocks/${blockId}/songs`, data),
  updateSong: (id, data)      => api.put(`/api/block-songs/${id}`, data),
  removeSong: (id)            => api.delete(`/api/block-songs/${id}`),

  // Asignaciones de personas
  addAssignment:    (blockId, data) => api.post(`/api/blocks/${blockId}/assignments`, data),
  bulkAssignments:  (blockId, data) => api.post(`/api/blocks/${blockId}/assignments/bulk`, data),
  updateAssignment: (id, data)      => api.put(`/api/assignments/${id}`, data),
  removeAssignment: (id)            => api.delete(`/api/assignments/${id}`),
}
