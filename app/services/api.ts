import axios from 'axios';
import { API_BASE_URL, API_CONFIG } from '../config';

const api = axios.create({
  baseURL: API_BASE_URL,
  ...API_CONFIG,
});

export interface Channel {
  id: string;
  name: string;
  description?: string;
  allowed_fields: string[];
  max_fields: number;
  min_write_interval_seconds: number;
  min_read_interval_seconds: number;
  created_at: string;
}

export interface ApiKeyResponse {
  key: string;
  scope: string;
  channelId: string;
}

export interface Reading {
  ts: string;
  fields: Record<string, number>;
}

export interface SeriesDataPoint {
  ts: string;
  value: number;
}

export interface Workflow {
  id: string;
  channel_id: string;
  name: string;
  enabled: boolean;
  rule: {
    field: string;
    op: string;
    value: number;
  };
  action: {
    type: string;
    url: string;
  };
  created_at: string;
}

export const channelsApi = {
  create: async (data: { name: string; description?: string; allowedFields: string[] }): Promise<Channel> => {
    const response = await api.post('/api/channels', data);
    return response.data;
  },
  
  get: async (id: string): Promise<Channel> => {
    const response = await api.get(`/api/channels/${id}`);
    return response.data;
  },
  
  createApiKey: async (channelId: string, scope: 'read' | 'write' | 'readwrite' = 'readwrite'): Promise<ApiKeyResponse> => {
    const response = await api.post(`/api/channels/${channelId}/keys`, { scope });
    return response.data;
  },
};

export const readingsApi = {
  post: async (apiKey: string, data: Record<string, number>): Promise<{ ok: boolean }> => {
    const response = await api.post('/api/readings', data, {
      headers: { 'x-api-key': apiKey },
    });
    return response.data;
  },
  
  getLatest: async (apiKey: string): Promise<Reading | null> => {
    const response = await api.get('/api/readings/latest', {
      headers: { 'x-api-key': apiKey },
    });
    return response.data;
  },
  
  getAll: async (apiKey: string, limit: number = 100, since?: string): Promise<Reading[]> => {
    const params: any = { limit };
    if (since) params.since = since;
    const response = await api.get('/api/readings', {
      headers: { 'x-api-key': apiKey },
      params,
    });
    return response.data;
  },
};

export const chartsApi = {
  getSeries: async (apiKey: string, field: string, limit: number = 50, since?: string): Promise<SeriesDataPoint[]> => {
    const params: any = { field, limit };
    if (since) params.since = since;
    const response = await api.get('/api/charts/series', {
      headers: { 'x-api-key': apiKey },
      params,
    });
    return response.data;
  },
};

export const workflowsApi = {
  create: async (apiKey: string, data: {
    name: string;
    enabled?: boolean;
    rule: { field: string; op: string; value: number };
    action: { type: string; url: string };
  }): Promise<Workflow> => {
    const response = await api.post('/api/workflows', data, {
      headers: { 'x-api-key': apiKey },
    });
    return response.data;
  },
  
  getAll: async (apiKey: string): Promise<Workflow[]> => {
    const response = await api.get('/api/workflows', {
      headers: { 'x-api-key': apiKey },
    });
    return response.data;
  },
};

export const exportApi = {
  getCsv: async (apiKey: string, limit: number = 1000): Promise<string> => {
    const response = await api.get('/api/export/csv', {
      headers: { 'x-api-key': apiKey },
      params: { limit },
      responseType: 'text',
    });
    return response.data;
  },
};