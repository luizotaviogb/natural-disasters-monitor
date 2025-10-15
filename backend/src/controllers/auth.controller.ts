import { Request, Response } from 'express';
import authService from '../services/auth.service';
import { handleError } from '../utils/error.utils';
import { handleValidationErrors } from '../utils/validation.utils';

export class AuthController {
  register = async (req: Request, res: Response): Promise<void> => {
    try {
      if (handleValidationErrors(req, res)) return;

      const { email, password, name } = req.body;
      const result = await authService.register({ email, password, name });

      this.setRefreshTokenCookie(res, result.refreshToken);

      res.status(201).json({
        user: result.user,
        accessToken: result.accessToken,
      });
    } catch (error) {
      handleError(res, error, 400);
    }
  };

  login = async (req: Request, res: Response): Promise<void> => {
    try {
      if (handleValidationErrors(req, res)) return;

      const { email, password } = req.body;
      const result = await authService.login({ email, password });

      this.setRefreshTokenCookie(res, result.refreshToken);

      res.status(200).json({
        user: result.user,
        accessToken: result.accessToken,
      });
    } catch (error) {
      handleError(res, error, 401);
    }
  };

  logout = async (req: Request, res: Response): Promise<void> => {
    try {
      const refreshToken = this.getRefreshTokenFromCookie(req, res);
      if (!refreshToken) return;

      await authService.logout(refreshToken);

      res.clearCookie('refreshToken');
      res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
      handleError(res, error, 400);
    }
  };

  refresh = async (req: Request, res: Response): Promise<void> => {
    try {
      const refreshToken = this.getRefreshTokenFromCookie(req, res, 401);
      if (!refreshToken) return;

      const result = await authService.refresh(refreshToken);

      res.status(200).json({ accessToken: result.accessToken });
    } catch (error) {
      handleError(res, error, 401);
    }
  };

  me = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const user = await authService.getUserById(userId);

      res.status(200).json({ user });
    } catch (error) {
      handleError(res, error, 404);
    }
  };

  private setRefreshTokenCookie = (res: Response, token: string): void => {
    res.cookie('refreshToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  };

  private getRefreshTokenFromCookie = (req: Request, res: Response, statusCode: number = 400): string | null => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      res.status(statusCode).json({ error: 'No refresh token provided' });
      return null;
    }
    return refreshToken;
  };
}

export default new AuthController();