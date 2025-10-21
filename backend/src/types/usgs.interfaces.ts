export interface USGSFeatureCollection {
  type: 'FeatureCollection';
  metadata: USGSMetadata;
  features: USGSFeature[];
  bbox?: number[];
}

export interface USGSMetadata {
  generated: number;
  url: string;
  title: string;
  status: number;
  api: string;
  count: number;
}

export interface USGSFeature {
  type: 'Feature';
  properties: USGSProperties;
  geometry: USGSGeometry;
  id: string;
}

export interface USGSProperties {
  mag: number | null;
  place: string;
  time: number;
  updated: number;
  tz?: number | null;
  url: string;
  detail: string;
  felt?: number | null;
  cdi?: number | null;
  mmi?: number | null;
  alert?: string | null;
  status: string;
  tsunami: number;
  sig: number;
  net: string;
  code: string;
  ids: string;
  sources: string;
  types: string;
  nst?: number | null;
  dmin?: number | null;
  rms?: number | null;
  gap?: number | null;
  magType: string;
  type: string;
  title: string;
}

export interface USGSGeometry {
  type: 'Point';
  coordinates: [number, number, number];
}

export interface USGSQueryParams {
  format?: 'geojson';
  starttime?: string;
  endtime?: string;
  minmagnitude?: number;
  maxmagnitude?: number;
  mindepth?: number;
  maxdepth?: number;
  minlatitude?: number;
  maxlatitude?: number;
  minlongitude?: number;
  maxlongitude?: number;
  latitude?: number;
  longitude?: number;
  maxradius?: number;
  maxradiuskm?: number;
  limit?: number;
  offset?: number;
  orderby?: 'time' | 'time-asc' | 'magnitude' | 'magnitude-asc';
  catalog?: string;
  contributor?: string;
  updatedafter?: string;
  alertlevel?: 'green' | 'yellow' | 'orange' | 'red';
  eventtype?: string;
  reviewstatus?: 'automatic' | 'reviewed';
}
