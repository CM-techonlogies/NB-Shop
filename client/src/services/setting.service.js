import api from './api';

export const settingService = {
  getSettings: async () => {
    const res = await api.get('/settings');
    return res.data;
  },
};
