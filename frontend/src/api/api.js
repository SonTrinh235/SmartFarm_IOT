import axiosInstance from '../configs/axios';

export const sensorApi = {
  getHistory: () => axiosInstance.get('/sensors/history'),
  getLatest: () => axiosInstance.get('/sensors/latest'),
};

export const deviceApi = {
  toggleDevice: (data) => axiosInstance.post('/controls', data),
  
  controlFan: (value) => axiosInstance.post('/equipment/fan', { value }),
  controlPump: (value) => axiosInstance.post('/equipment/pump', { value }),
};

export const assistantApi = {
  chat: (message) => axiosInstance.post('/assistant/chat', { message }),
};