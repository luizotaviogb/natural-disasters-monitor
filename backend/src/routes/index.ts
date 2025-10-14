import { Router, Request, Response } from 'express';

const router = Router();

router.get('/', (_req: Request, res: Response) => {
  res.json({
    message: 'Natural Disasters Monitor API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      api: '/api'
    }
  });
});

export default router;
