import api from './api';

export interface ProcessImageParams {
  earthquakeId: string;
  imageUrl: string;
  processingType: 'edge' | 'fft' | '3d';
}

export interface ProcessAllImagesParams {
  earthquakeId: string;
  imageUrl: string;
}

export const imageService = {
  async getImages(earthquakeId: string) {
    const response = await api.get(`/earthquakes/${earthquakeId}/images`);
    return response.data;
  },

  async processImage(params: ProcessImageParams) {
    const { earthquakeId, imageUrl, processingType } = params;
    const response = await api.post(`/earthquakes/${earthquakeId}/process-image`, {
      imageUrl,
      processingType,
    });
    return response.data;
  },

  async processAllImages(params: ProcessAllImagesParams) {
    const { earthquakeId, imageUrl } = params;
    const response = await api.post(`/earthquakes/${earthquakeId}/process-all-images`, {
      imageUrl,
    });
    return response.data;
  },

  async getImage(imageId: string) {
    const response = await api.get(`/images/${imageId}`);
    return response.data;
  },
};
