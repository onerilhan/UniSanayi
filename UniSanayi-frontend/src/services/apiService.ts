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

  getProjectDetail: async (id: string) => {
    const response = await apiClient.get(`/projects/${id}`);
    return response.data;
  },

};


export const applicationService = {
  // Projeye başvur
  applyToProject: async (projectId: string, coverLetter: string, token: string) => {
    const response = await apiClient.post('/applications', {
      projectId,
      coverLetter
    }, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  },

  // Öğrencinin başvurularını getir
  getMyApplications: async (token: string) => {
    const response = await apiClient.get('/applications/my', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  },

  // Başvuru detayı
  getApplicationDetail: async (applicationId: string, token: string) => {
    const response = await apiClient.get(`/applications/${applicationId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      },
    });
    return response.data;
  }
};

export default apiClient;