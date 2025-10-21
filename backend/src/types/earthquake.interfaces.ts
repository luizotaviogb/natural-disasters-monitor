export interface EarthquakeFilters {
  minMagnitude?: number;
  maxMagnitude?: number;
  startTime?: Date;
  endTime?: Date;
  minLatitude?: number;
  maxLatitude?: number;
  minLongitude?: number;
  maxLongitude?: number;
  limit?: number;
  offset?: number;
  orderBy?: 'time' | 'magnitude';
  orderDirection?: 'asc' | 'desc';
}

export interface EarthquakeListResponse {
  earthquakes: EarthquakeDetail[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface EarthquakeDetail {
  id: string;
  usgsId: string;
  magnitude: number;
  place: string;
  time: Date;
  updated: Date;
  latitude: number;
  longitude: number;
  depth: number;
  magType?: string;
  status?: string;
  tsunamiFlag: number;
  significance?: number;
  alert?: string;
  felt?: number;
  cdi?: number;
  mmi?: number;
  detailUrl?: string;
  images?: EarthquakeImageDetail[];
  createdAt: Date;
  updatedAt: Date;
}

export interface EarthquakeImageDetail {
  id: string;
  originalUrl?: string;
  processedUrl?: string;
  thumbnailUrl?: string;
  imageType: string;
  processingStatus: string;
  processingTime?: number;
  metadata?: any;
}

export interface SyncEarthquakesParams {
  minMagnitude?: number;
  startTime?: Date;
  endTime?: Date;
  limit?: number;
}

export interface SyncResult {
  success: boolean;
  total: number;
  created: number;
  updated: number;
  errors: string[];
}

export interface EarthquakeListResponseDto {
  success: boolean;
  data: EarthquakeListResponse;
}

export interface EarthquakeDetailResponseDto {
  success: boolean;
  data: EarthquakeDetail;
}

export interface SyncEarthquakesResponseDto {
  success: boolean;
  message: string;
  data: SyncResult;
}

export interface EarthquakeErrorResponseDto {
  success: boolean;
  message: string;
}
