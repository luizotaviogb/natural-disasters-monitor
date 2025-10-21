import api from './api';
import type {
  Earthquake,
  EarthquakeListResponse,
  EarthquakeDetailResponse,
  SyncParams,
  SyncResponse,
  EarthquakeFilters,
} from '../types/earthquake.types';

export const earthquakeService = {
  async list(filters?: EarthquakeFilters): Promise<EarthquakeListResponse> {
    const params = new URLSearchParams();

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }

    const response = await api.get<EarthquakeListResponse>(
      `/earthquakes?${params.toString()}`
    );
    return response.data;
  },

  async getById(id: string): Promise<Earthquake> {
    const response = await api.get<EarthquakeDetailResponse>(`/earthquakes/${id}`);
    return response.data.data;
  },

  async sync(params?: SyncParams): Promise<SyncResponse> {
    const response = await api.post<SyncResponse>('/earthquakes/sync', params || {});
    return response.data;
  },
};
