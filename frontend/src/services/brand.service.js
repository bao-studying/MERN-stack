import axiosClient from './axiosClient';

const brandApi = {
  getAll: (config = {}) => axiosClient.get('/brands', config),
  create: (data) => axiosClient.post('/brands', data),
  update: (id, data) => axiosClient.put(`/brands/${id}`, data),
  delete: (id) => axiosClient.delete(`/brands/${id}`),
};

export default brandApi;
