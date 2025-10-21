import { Router, Request, Response } from 'express';
import authRoutes from './auth.routes';
import earthquakeRoutes from './earthquake.routes';
import imageRoutes from './image.routes';

const router = Router();

router.get('/', (_req: Request, res: Response) => {
  res.json({
    message: 'Natural Disasters Monitor API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      api: '/api',
      auth: '/api/auth',
      earthquakes: '/api/earthquakes',
      images: '/api/images'
    }
  });
});

router.use('/auth', authRoutes);
router.use('/', imageRoutes);
router.use('/earthquakes', earthquakeRoutes);

export default router;
