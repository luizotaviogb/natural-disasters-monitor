import { Router } from 'express';
import { imageController } from '../controllers/image.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.post(
  '/earthquakes/:earthquakeId/process-image',
  authMiddleware,
  imageController.processImage.bind(imageController)
);

router.post(
  '/earthquakes/:earthquakeId/process-all-images',
  authMiddleware,
  imageController.processAllTypes.bind(imageController)
);

router.get(
  '/earthquakes/:earthquakeId/images',
  authMiddleware,
  imageController.getImages.bind(imageController)
);

router.get(
  '/images/:imageId',
  authMiddleware,
  imageController.getImage.bind(imageController)
);

export default router;
