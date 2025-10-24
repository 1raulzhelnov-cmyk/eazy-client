import axios, { AxiosInstance } from 'axios';
import { API_URL } from '../../utils/env';

let apiClient: AxiosInstance | null = null;

export function getApiClient(): AxiosInstance {
  if (!apiClient) {
    apiClient = axios.create({
      baseURL: API_URL,
      timeout: 15000,
    });
  }
  return apiClient;
}
