import axiosInstance from '../configs/axios';

export const sensorApi = {
  getHistory: () => axiosInstance.get('/sensors/history'),
  getLatest: () => axiosInstance.get('/sensors/latest'),
};

export const deviceApi = {
  toggleDevice: (data) => axiosInstance.post('/controls', data),
};