import { Response } from 'express';

export const handleError = (res: Response, error: unknown, statusCode: number): void => {
  if (error instanceof Error) {
    res.status(statusCode).json({ error: error.message });
  } else {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createErrorResponse = (error: unknown) => {
  if (error instanceof Error) {
    return {
      success: false,
      message: error.message,
    };
  }
  return {
    success: false,
    message: 'Internal server error',
  };
};
