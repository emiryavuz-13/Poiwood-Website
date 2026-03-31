import api from './axios';

export const getStories = async () => {
  const response = await api.get('/stories');
  return response.data.data;
};
