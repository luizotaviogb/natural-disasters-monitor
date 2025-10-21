import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { earthquakeService } from '../services/earthquakeService';
import type { EarthquakeFilters, SyncParams } from '../types/earthquake.types';

export const useEarthquakes = (filters?: EarthquakeFilters) => {
  return useQuery({
    queryKey: ['earthquakes', filters],
    queryFn: () => earthquakeService.list(filters),
  });
};

export const useEarthquake = (id: string) => {
  return useQuery({
    queryKey: ['earthquake', id],
    queryFn: () => earthquakeService.getById(id),
    enabled: !!id,
  });
};

export const useSyncEarthquakes = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params?: SyncParams) => earthquakeService.sync(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['earthquakes'] });
    },
  });
};
