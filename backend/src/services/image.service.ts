import { PrismaClient, ImageType, ProcessingStatus, AuditAction } from '@prisma/client';
import { cliExecutor, ProcessingType } from '../utils/cli-executor';
import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';

const prisma = new PrismaClient();

export interface ProcessImageParams {
  earthquakeId: string;
  imageUrl: string;
  processingType: ProcessingType;
}

export class ImageService {
  async fetchRandomImage(): Promise<string> {
    const width = 800;
    const height = 600;
    const imageUrl = `https://picsum.photos/${width}/${height}?random=${Date.now()}`;

    try {
      const response = await axios.head(imageUrl);
      return response.request.res.responseUrl || imageUrl;
    } catch (error) {
      return imageUrl;
    }
  }

  async createOriginalImage(earthquakeId: string, imageUrl?: string): Promise<any> {
    const finalImageUrl = imageUrl || (await this.fetchRandomImage());

    const image = await prisma.earthquakeImage.create({
      data: {
        earthquakeId,
        originalUrl: finalImageUrl,
        imageType: ImageType.ORIGINAL,
        processingStatus: ProcessingStatus.COMPLETED,
        metadata: {
          source: imageUrl ? 'provided' : 'random',
          fetchedAt: new Date().toISOString(),
        },
      },
    });

    await prisma.auditLog.create({
      data: {
        earthquakeId,
        action: AuditAction.PROCESS_IMAGE,
        entityType: 'EarthquakeImage',
        entityId: image.id,
        changes: { imageType: ImageType.ORIGINAL, status: ProcessingStatus.COMPLETED },
      },
    });

    return image;
  }

  async processImage(params: ProcessImageParams): Promise<any> {
    const { earthquakeId, imageUrl, processingType } = params;

    const earthquake = await prisma.earthquake.findUnique({
      where: { id: earthquakeId },
    });

    if (!earthquake) {
      throw new Error('Earthquake not found');
    }

    const imageTypeMap: Record<ProcessingType, ImageType> = {
      edge: ImageType.EDGE_DETECTED,
      fft: ImageType.FFT_TRANSFORMED,
      '3d': ImageType.PROCESSED_3D,
    };

    const imageType = imageTypeMap[processingType];
    const outputFilename = `${earthquakeId}_${processingType}_${Date.now()}.jpg`;

    const image = await prisma.earthquakeImage.create({
      data: {
        earthquakeId,
        originalUrl: imageUrl,
        imageType,
        processingStatus: ProcessingStatus.PROCESSING,
        metadata: {
          processingType,
          startedAt: new Date().toISOString(),
        },
      },
    });

    await prisma.auditLog.create({
      data: {
        earthquakeId,
        action: AuditAction.PROCESS_IMAGE,
        entityType: 'EarthquakeImage',
        entityId: image.id,
        changes: { imageType, status: ProcessingStatus.PROCESSING },
      },
    });

    cliExecutor.processImageInBackground(
      imageUrl,
      outputFilename,
      processingType,
      async (result) => {
        if (result.success) {
          await prisma.earthquakeImage.update({
            where: { id: image.id },
            data: {
              processedUrl: `/processed/${outputFilename}`,
              thumbnailUrl: `/processed/${outputFilename}`,
              processingStatus: ProcessingStatus.COMPLETED,
              processingTime: result.processingTime,
              metadata: {
                ...result.metadata,
                completedAt: new Date().toISOString(),
              },
            },
          });

          await prisma.auditLog.create({
            data: {
              earthquakeId,
              action: AuditAction.PROCESS_IMAGE,
              entityType: 'EarthquakeImage',
              entityId: image.id,
              changes: {
                status: ProcessingStatus.COMPLETED,
                processingTime: result.processingTime,
              },
            },
          });
        } else {
          await prisma.earthquakeImage.update({
            where: { id: image.id },
            data: {
              processingStatus: ProcessingStatus.FAILED,
              metadata: {
                error: result.error,
                failedAt: new Date().toISOString(),
              },
            },
          });

          await prisma.auditLog.create({
            data: {
              earthquakeId,
              action: AuditAction.PROCESS_IMAGE,
              entityType: 'EarthquakeImage',
              entityId: image.id,
              changes: {
                status: ProcessingStatus.FAILED,
                error: result.error,
              },
            },
          });
        }
      }
    );

    return image;
  }

  async getImagesByEarthquakeId(earthquakeId: string): Promise<any[]> {
    return prisma.earthquakeImage.findMany({
      where: { earthquakeId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getImageById(imageId: string): Promise<any> {
    return prisma.earthquakeImage.findUnique({
      where: { id: imageId },
      include: {
        earthquake: {
          select: {
            id: true,
            usgsId: true,
            place: true,
            magnitude: true,
          },
        },
      },
    });
  }

  private async downloadImageToLocal(imageUrl: string, earthquakeId: string): Promise<string> {
    const dataPath = process.env.CLI_DATA_PATH || '/data';
    const downloadsDir = path.join(dataPath, 'downloads');
    await fs.mkdir(downloadsDir, { recursive: true });

    const filename = `${earthquakeId}_source_${Date.now()}.jpg`;
    const localPath = path.join(downloadsDir, filename);

    console.log(`Downloading image from ${imageUrl} to ${localPath}...`);

    const response = await axios.get(imageUrl, {
      responseType: 'arraybuffer',
      timeout: 30000,
      maxRedirects: 5,
    });

    await fs.writeFile(localPath, response.data);
    console.log(`Image downloaded successfully to ${localPath}`);

    return localPath;
  }

  async processAllTypes(earthquakeId: string, imageUrl: string): Promise<any[]> {
    let localImagePath: string;

    try {
      localImagePath = await this.downloadImageToLocal(imageUrl, earthquakeId);
    } catch (error) {
      console.error('Failed to download image:', error);
      throw new Error(`Failed to download image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    const types: ProcessingType[] = ['edge', 'fft', '3d'];
    const results = [];

    for (const type of types) {
      const result = await this.processImage({
        earthquakeId,
        imageUrl: localImagePath,
        processingType: type,
      });
      results.push(result);
    }

    return results;
  }
}

export const imageService = new ImageService();
