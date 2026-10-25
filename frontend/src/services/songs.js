import api from './api'

export const songsService = {
  getAll: (params = {}) => api.get('/api/songs', { params }),
  getOne: (id)          => api.get(`/api/songs/${id}`),
  create: (data)        => api.post('/api/songs', data),
  update: (id, data)    => api.put(`/api/songs/${id}`, data),
  remove: (id)          => api.delete(`/api/songs/${id}`),
  toggle: (id)          => api.patch(`/api/songs/${id}/toggle-active`),

  // Cifrados en texto
  getCipherTexts: (songId)       => api.get(`/api/songs/${songId}/cipher-texts`),
  createCipherText: (songId, d)  => api.post(`/api/songs/${songId}/cipher-texts`, d),
  updateCipherText: (id, d)      => api.put(`/api/cipher-texts/${id}`, d),
  deleteCipherText: (id)         => api.delete(`/api/cipher-texts/${id}`),

  // Archivos
  getCipherFiles: (songId)      => api.get(`/api/songs/${songId}/cipher-files`),
  uploadCipherFile: (songId, f) => api.post(`/api/songs/${songId}/cipher-files`, f, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  deleteCipherFile: (id)        => api.delete(`/api/cipher-files/${id}`),
  getDownloadUrl:   (id)        => `/api/cipher-files/${id}/download`,
}
