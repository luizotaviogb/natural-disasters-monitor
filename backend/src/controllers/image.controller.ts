import { Request, Response } from 'express';
import { imageService } from '../services/image.service';
import { createErrorResponse } from '../utils/error.utils';

export class ImageController {
  async processImage(req: Request, res: Response): Promise<void> {
    try {
      const { earthquakeId } = req.params;
      const { imageUrl, processingType } = req.body;

      if (!imageUrl) {
        res.status(400).json({
          success: false,
          message: 'imageUrl is required',
        });
        return;
      }

      if (!processingType || !['edge', 'fft', '3d'].includes(processingType)) {
        res.status(400).json({
          success: false,
          message: 'processingType must be one of: edge, fft, 3d',
        });
        return;
      }

      const image = await imageService.processImage({
        earthquakeId,
        imageUrl,
        processingType,
      });

      res.status(202).json({
        success: true,
        message: 'Image processing started',
        data: image,
      });
    } catch (error) {
      const errorResponse = createErrorResponse(error);
      res.status(500).json(errorResponse);
    }
  }

  async processAllTypes(req: Request, res: Response): Promise<void> {
    try {
      const { earthquakeId } = req.params;
      const { imageUrl } = req.body;

      if (!imageUrl) {
        res.status(400).json({
          success: false,
          message: 'imageUrl is required',
        });
        return;
      }

      const images = await imageService.processAllTypes(earthquakeId, imageUrl);

      res.status(202).json({
        success: true,
        message: 'Image processing started for all types',
        data: images,
      });
    } catch (error) {
      const errorResponse = createErrorResponse(error);
      res.status(500).json(errorResponse);
    }
  }

  async getImages(req: Request, res: Response): Promise<void> {
    try {
      const { earthquakeId } = req.params;

      const images = await imageService.getImagesByEarthquakeId(earthquakeId);

      res.status(200).json({
        success: true,
        data: images,
      });
    } catch (error) {
      const errorResponse = createErrorResponse(error);
      res.status(500).json(errorResponse);
    }
  }

  async getImage(req: Request, res: Response): Promise<void> {
    try {
      const { imageId } = req.params;

      const image = await imageService.getImageById(imageId);

      if (!image) {
        res.status(404).json({
          success: false,
          message: 'Image not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: image,
      });
    } catch (error) {
      const errorResponse = createErrorResponse(error);
      res.status(500).json(errorResponse);
    }
  }
}

export const imageController = new ImageController();
