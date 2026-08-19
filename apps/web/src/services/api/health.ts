import { apiRequest } from './client';

interface HealthResponse {
  success: boolean;

  data: {
    service: string;
    status: string;
  };
}

export function getApiHealth() {
  return apiRequest<HealthResponse>('/health');
}
