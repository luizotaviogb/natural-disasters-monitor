export interface EarthquakeImage {
  id: string;
  originalUrl?: string;
  processedUrl?: string;
  thumbnailUrl?: string;
  imageType: 'ORIGINAL' | 'PROCESSED_3D' | 'EDGE_DETECTED' | 'FFT_TRANSFORMED';
  processingStatus: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  processingTime?: number;
  metadata?: any;
}

export interface Earthquake {
  id: string;
  usgsId: string;
  magnitude: number;
  place: string;
  time: string;
  updated: string;
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
  images?: EarthquakeImage[];
  createdAt: string;
  updatedAt: string;
}

export interface EarthquakeListResponse {
  success: boolean;
  data: {
    earthquakes: Earthquake[];
    total: number;
    page: number;
    pageSize: number;
    hasMore: boolean;
  };
}

export interface EarthquakeDetailResponse {
  success: boolean;
  data: Earthquake;
}

export interface SyncParams {
  minMagnitude?: number;
  startTime?: string;
  endTime?: string;
  limit?: number;
}

export interface SyncResponse {
  success: boolean;
  message: string;
  data: {
    total: number;
    created: number;
    updated: number;
    errors: string[];
  };
}

export interface EarthquakeFilters {
  minMagnitude?: number;
  maxMagnitude?: number;
  startTime?: string;
  endTime?: string;
  minLatitude?: number;
  maxLatitude?: number;
  minLongitude?: number;
  maxLongitude?: number;
  limit?: number;
  offset?: number;
  orderBy?: 'time' | 'magnitude';
  orderDirection?: 'asc' | 'desc';
}
