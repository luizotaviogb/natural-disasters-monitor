import { Router } from 'express';
import { earthquakeController } from '../controllers/earthquake.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { validationMiddleware } from '../middlewares/validation.middleware';
import {
  listEarthquakesValidation,
  getEarthquakeValidation,
  syncEarthquakesValidation,
} from '../utils/earthquake.validation';

const router = Router();

router.get(
  '/',
  authMiddleware,
  listEarthquakesValidation,
  validationMiddleware,
  earthquakeController.listEarthquakes.bind(earthquakeController)
);

router.get(
  '/:id',
  authMiddleware,
  getEarthquakeValidation,
  validationMiddleware,
  earthquakeController.getEarthquake.bind(earthquakeController)
);

router.post(
  '/sync',
  authMiddleware,
  syncEarthquakesValidation,
  validationMiddleware,
  earthquakeController.syncEarthquakes.bind(earthquakeController)
);

export default router;
