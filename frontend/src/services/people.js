import api from './api'

export const peopleService = {
  getAll:  (params = {}) => api.get('/api/people', { params }),
  getAll2: ()            => api.get('/api/people/all'),  // sin paginar, para selectores
  getOne:  (id)          => api.get(`/api/people/${id}`),
  create:  (data)        => api.post('/api/people', data),
  update:  (id, data)    => api.put(`/api/people/${id}`, data),
  remove:  (id)          => api.delete(`/api/people/${id}`),
}

export const rolesService = {
  getAll:  ()       => api.get('/api/musical-roles'),
  create:  (data)   => api.post('/api/musical-roles', data),
  update:  (id, d)  => api.put(`/api/musical-roles/${id}`, d),
  remove:  (id)     => api.delete(`/api/musical-roles/${id}`),
}
