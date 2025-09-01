import axios from 'axios';

const API_BASE_URL = 'http://localhost:5126/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

export const projectService = {
  getActiveProjects: async (filters?: any) => {
    const response = await apiClient.get('/projects', { params: filters });
    return response.data;
  },
};

export default apiClient;