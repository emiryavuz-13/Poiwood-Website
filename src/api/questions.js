import api from './axios';

export const getProductQuestions = async (productId, page = 1, limit = 10) => {
  const response = await api.get(`/questions/product/${productId}`, { params: { page, limit } });
  return response.data.data;
};

export const createQuestion = async (productId, questionText) => {
  const response = await api.post('/questions', { product_id: productId, question_text: questionText });
  return response.data.data;
};

export const deleteQuestion = async (id) => {
  const response = await api.delete(`/questions/${id}`);
  return response.data;
};
