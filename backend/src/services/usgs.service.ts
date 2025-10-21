import { USGSFeatureCollection, USGSQueryParams } from '../types/usgs.interfaces';

const USGS_BASE_URL = 'https://earthquake.usgs.gov/fdsnws/event/1/query';

export class USGSService {
  private buildQueryString(params: USGSQueryParams): string {
    const queryParams = new URLSearchParams();

    queryParams.append('format', params.format || 'geojson');

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && key !== 'format') {
        queryParams.append(key, value.toString());
      }
    });

    return queryParams.toString();
  }

  async fetchEarthquakes(params: USGSQueryParams = {}): Promise<USGSFeatureCollection> {
    try {
      const queryString = this.buildQueryString(params);
      const url = `${USGS_BASE_URL}?${queryString}`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`USGS API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json() as USGSFeatureCollection;
      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to fetch earthquakes from USGS: ${error.message}`);
      }
      throw new Error('Failed to fetch earthquakes from USGS: Unknown error');
    }
  }

  async fetchRecentEarthquakes(
    minMagnitude: number = 2.5,
    limit: number = 100
  ): Promise<USGSFeatureCollection> {
    const params: USGSQueryParams = {
      format: 'geojson',
      minmagnitude: minMagnitude,
      limit,
      orderby: 'time',
    };

    return this.fetchEarthquakes(params);
  }

  async fetchEarthquakesByDateRange(
    startTime: Date,
    endTime: Date,
    minMagnitude?: number,
    limit: number = 100
  ): Promise<USGSFeatureCollection> {
    const params: USGSQueryParams = {
      format: 'geojson',
      starttime: startTime.toISOString(),
      endtime: endTime.toISOString(),
      minmagnitude: minMagnitude,
      limit,
      orderby: 'time',
    };

    return this.fetchEarthquakes(params);
  }

  async fetchEarthquakesByLocation(
    latitude: number,
    longitude: number,
    radiusKm: number,
    minMagnitude?: number,
    limit: number = 100
  ): Promise<USGSFeatureCollection> {
    const params: USGSQueryParams = {
      format: 'geojson',
      latitude,
      longitude,
      maxradiuskm: radiusKm,
      minmagnitude: minMagnitude,
      limit,
      orderby: 'time',
    };

    return this.fetchEarthquakes(params);
  }
}

export const usgsService = new USGSService();
