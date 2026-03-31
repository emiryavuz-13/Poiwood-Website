import api from './axios';

export const updateProfile = async ({ display_name, phone }) => {
  const response = await api.patch('/auth/profile', { display_name, phone });
  return response.data.data;
};
