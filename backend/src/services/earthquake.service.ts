import { PrismaClient, Earthquake, AuditAction } from '@prisma/client';
import { usgsService } from './usgs.service';
import { USGSFeature } from '../types/usgs.interfaces';
import {
  EarthquakeFilters,
  EarthquakeListResponse,
  SyncEarthquakesParams,
  SyncResult,
} from '../types/earthquake.interfaces';

const prisma = new PrismaClient();

export class EarthquakeService {
  private transformUSGSToEarthquake(feature: USGSFeature): any {
    const { properties, geometry, id } = feature;
    const [longitude, latitude, depth] = geometry.coordinates;

    return {
      usgsId: id,
      magnitude: properties.mag || 0,
      place: properties.place || 'Unknown',
      time: new Date(properties.time),
      updated: new Date(properties.updated),
      latitude,
      longitude,
      depth: depth || 0,
      magType: properties.magType || null,
      status: properties.status || null,
      tsunamiFlag: properties.tsunami || 0,
      significance: properties.sig || null,
      alert: properties.alert || null,
      felt: properties.felt || null,
      cdi: properties.cdi || null,
      mmi: properties.mmi || null,
      net: properties.net || null,
      code: properties.code || null,
      sources: properties.sources || null,
      types: properties.types || null,
      nst: properties.nst || null,
      dmin: properties.dmin || null,
      rms: properties.rms || null,
      gap: properties.gap || null,
      detailUrl: properties.url || null,
    };
  }

  async syncEarthquakes(params: SyncEarthquakesParams = {}): Promise<SyncResult> {
    const result: SyncResult = {
      success: false,
      total: 0,
      created: 0,
      updated: 0,
      errors: [],
    };

    try {
      const usgsParams: any = {
        minmagnitude: params.minMagnitude || 2.5,
        limit: params.limit || 100,
        orderby: 'time',
      };

      if (params.startTime) {
        usgsParams.starttime = params.startTime.toISOString();
      }
      if (params.endTime) {
        usgsParams.endtime = params.endTime.toISOString();
      }

      const data = await usgsService.fetchEarthquakes(usgsParams);
      result.total = data.features.length;

      for (const feature of data.features) {
        try {
          const earthquakeData = this.transformUSGSToEarthquake(feature);

          const existing = await prisma.earthquake.findUnique({
            where: { usgsId: earthquakeData.usgsId },
          });

          if (existing) {
            await prisma.earthquake.update({
              where: { usgsId: earthquakeData.usgsId },
              data: earthquakeData,
            });

            await prisma.auditLog.create({
              data: {
                earthquakeId: existing.id,
                action: AuditAction.SYNC,
                entityType: 'Earthquake',
                entityId: existing.id,
                changes: { usgsId: earthquakeData.usgsId },
              },
            });

            result.updated++;
          } else {
            const newEarthquake = await prisma.earthquake.create({
              data: earthquakeData,
            });

            await prisma.auditLog.create({
              data: {
                earthquakeId: newEarthquake.id,
                action: AuditAction.CREATE,
                entityType: 'Earthquake',
                entityId: newEarthquake.id,
                changes: { usgsId: earthquakeData.usgsId },
              },
            });

            result.created++;
          }
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Unknown error';
          result.errors.push(`Failed to sync ${feature.id}: ${errorMessage}`);
        }
      }

      result.success = result.errors.length === 0;
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      result.errors.push(`Sync failed: ${errorMessage}`);
      return result;
    }
  }

  async listEarthquakes(filters: EarthquakeFilters = {}): Promise<EarthquakeListResponse> {
    const {
      minMagnitude,
      maxMagnitude,
      startTime,
      endTime,
      minLatitude,
      maxLatitude,
      minLongitude,
      maxLongitude,
      limit = 20,
      offset = 0,
      orderBy = 'time',
      orderDirection = 'desc',
    } = filters;

    const where: any = {};

    if (minMagnitude !== undefined || maxMagnitude !== undefined) {
      where.magnitude = {};
      if (minMagnitude !== undefined) where.magnitude.gte = minMagnitude;
      if (maxMagnitude !== undefined) where.magnitude.lte = maxMagnitude;
    }

    if (startTime || endTime) {
      where.time = {};
      if (startTime) where.time.gte = startTime;
      if (endTime) where.time.lte = endTime;
    }

    if (
      minLatitude !== undefined ||
      maxLatitude !== undefined ||
      minLongitude !== undefined ||
      maxLongitude !== undefined
    ) {
      if (minLatitude !== undefined) {
        where.latitude = { ...where.latitude, gte: minLatitude };
      }
      if (maxLatitude !== undefined) {
        where.latitude = { ...where.latitude, lte: maxLatitude };
      }
      if (minLongitude !== undefined) {
        where.longitude = { ...where.longitude, gte: minLongitude };
      }
      if (maxLongitude !== undefined) {
        where.longitude = { ...where.longitude, lte: maxLongitude };
      }
    }

    const orderByClause: any = {};
    orderByClause[orderBy] = orderDirection;

    const [earthquakes, total] = await Promise.all([
      prisma.earthquake.findMany({
        where,
        orderBy: orderByClause,
        take: limit,
        skip: offset,
        include: {
          images: true,
        },
      }),
      prisma.earthquake.count({ where }),
    ]);

    return {
      earthquakes: earthquakes as any,
      total,
      page: Math.floor(offset / limit) + 1,
      pageSize: limit,
      hasMore: offset + limit < total,
    };
  }

  async getEarthquakeById(id: string): Promise<Earthquake | null> {
    return prisma.earthquake.findUnique({
      where: { id },
      include: {
        images: true,
        auditLogs: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });
  }

  async getEarthquakeByUSGSId(usgsId: string): Promise<Earthquake | null> {
    return prisma.earthquake.findUnique({
      where: { usgsId },
      include: {
        images: true,
      },
    });
  }
}

export const earthquakeService = new EarthquakeService();
