import { Router, Request, Response } from 'express';
import authRoutes from './auth.routes';

const router = Router();

router.get('/', (_req: Request, res: Response) => {
  res.json({
    message: 'Natural Disasters Monitor API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      api: '/api',
      auth: '/api/auth'
    }
  });
});

router.use('/auth', authRoutes);

export default router;
