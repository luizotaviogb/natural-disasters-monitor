import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { imageService } from '../services/imageService';

export const useImages = (earthquakeId: string) => {
  return useQuery({
    queryKey: ['images', earthquakeId],
    queryFn: () => imageService.getImages(earthquakeId),
    enabled: !!earthquakeId,
    refetchInterval: 5000,
  });
};

export const useProcessImage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: imageService.processImage,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['images', variables.earthquakeId] });
    },
  });
};

export const useProcessAllImages = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: imageService.processAllImages,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['images', variables.earthquakeId] });
    },
  });
};
