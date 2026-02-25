import axios from 'axios';

export interface AppConfig {
  googleClientId: string;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export async function getAppConfig(): Promise<AppConfig> {
  const response = await axios.get<AppConfig>(`${API_BASE_URL}/config`);
  return response.data;
}
