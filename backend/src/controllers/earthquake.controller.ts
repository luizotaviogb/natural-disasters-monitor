import { Request, Response } from 'express';
import { earthquakeService } from '../services/earthquake.service';
import { EarthquakeFilters, SyncEarthquakesParams } from '../types/earthquake.interfaces';
import { createErrorResponse } from '../utils/error.utils';

export class EarthquakeController {
  async listEarthquakes(req: Request, res: Response): Promise<void> {
    try {
      const filters: EarthquakeFilters = {
        minMagnitude: req.query.minMagnitude
          ? parseFloat(req.query.minMagnitude as string)
          : undefined,
        maxMagnitude: req.query.maxMagnitude
          ? parseFloat(req.query.maxMagnitude as string)
          : undefined,
        startTime: req.query.startTime ? new Date(req.query.startTime as string) : undefined,
        endTime: req.query.endTime ? new Date(req.query.endTime as string) : undefined,
        minLatitude: req.query.minLatitude
          ? parseFloat(req.query.minLatitude as string)
          : undefined,
        maxLatitude: req.query.maxLatitude
          ? parseFloat(req.query.maxLatitude as string)
          : undefined,
        minLongitude: req.query.minLongitude
          ? parseFloat(req.query.minLongitude as string)
          : undefined,
        maxLongitude: req.query.maxLongitude
          ? parseFloat(req.query.maxLongitude as string)
          : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
        offset: req.query.offset ? parseInt(req.query.offset as string) : 0,
        orderBy: (req.query.orderBy as 'time' | 'magnitude') || 'time',
        orderDirection: (req.query.orderDirection as 'asc' | 'desc') || 'desc',
      };

      const result = await earthquakeService.listEarthquakes(filters);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      const errorResponse = createErrorResponse(error);
      res.status(500).json(errorResponse);
    }
  }

  async getEarthquake(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const earthquake = await earthquakeService.getEarthquakeById(id);

      if (!earthquake) {
        res.status(404).json({
          success: false,
          message: 'Earthquake not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: earthquake,
      });
    } catch (error) {
      const errorResponse = createErrorResponse(error);
      res.status(500).json(errorResponse);
    }
  }

  async syncEarthquakes(req: Request, res: Response): Promise<void> {
    try {
      const params: SyncEarthquakesParams = {
        minMagnitude: req.body.minMagnitude,
        startTime: req.body.startTime ? new Date(req.body.startTime) : undefined,
        endTime: req.body.endTime ? new Date(req.body.endTime) : undefined,
        limit: req.body.limit,
      };

      const result = await earthquakeService.syncEarthquakes(params);

      if (!result.success) {
        res.status(500).json({
          success: false,
          message: 'Sync completed with errors',
          data: result,
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Earthquakes synchronized successfully',
        data: result,
      });
    } catch (error) {
      const errorResponse = createErrorResponse(error);
      res.status(500).json(errorResponse);
    }
  }
}

export const earthquakeController = new EarthquakeController();
