import axios from 'axios';

const BASE_URL = 'http://localhost:5050/api';

class ApiService {
  constructor() {
    this.client = axios.create({
      baseURL: BASE_URL,
      timeout: 30000,
    });
  }

  setAuthToken(token) {
    if (token) {
      this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete this.client.defaults.headers.common['Authorization'];
    }
  }

  async getLesson(lessonId) {
    try {
      const response = await this.client.get(`/lesson/${lessonId}`);
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        throw new Error('Authentication expired. Please login again.');
      }
      throw new Error(`Failed to fetch lesson: ${error.message}`);
    }
  }

  async getLessonAudio(lessonId) {
    try {
      const response = await this.client.get(`/lesson/${lessonId}/audio`, {
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        throw new Error('Authentication expired. Please login again.');
      }
      throw new Error(`Failed to fetch audio: ${error.message}`);
    }
  }
}

export const apiService = new ApiService();