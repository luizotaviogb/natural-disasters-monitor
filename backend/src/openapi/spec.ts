import { Tspec } from 'tspec';
import {
  RegisterRequestDto,
  LoginRequestDto,
  AuthResponseDto,
  RefreshResponseDto,
  UserResponseDto,
  ErrorResponseDto,
  ValidationErrorResponseDto,
  MessageResponseDto,
} from '../types/auth.interfaces';
import {
  SyncEarthquakesParams,
  EarthquakeListResponseDto,
  EarthquakeDetailResponseDto,
  SyncEarthquakesResponseDto,
  EarthquakeErrorResponseDto,
} from '../types/earthquake.interfaces';

export type AuthApiSpec = Tspec.DefineApiSpec<{
  tags: ['Authentication'],
  paths: {
    '/api/auth/register': {
      post: {
        summary: 'Register a new user',
        description: 'Creates a new user account with email and password',
        tags: ['Authentication'],
        body: RegisterRequestDto,
        responses: {
          201: AuthResponseDto,
          400: ErrorResponseDto | ValidationErrorResponseDto,
          500: ErrorResponseDto,
        },
      },
    },
    '/api/auth/login': {
      post: {
        summary: 'Login user',
        description: 'Authenticates a user with email and password',
        tags: ['Authentication'],
        body: LoginRequestDto,
        responses: {
          200: AuthResponseDto,
          400: ValidationErrorResponseDto,
          401: ErrorResponseDto,
          500: ErrorResponseDto,
        },
      },
    },
    '/api/auth/logout': {
      post: {
        summary: 'Logout user',
        description: 'Invalidates the refresh token and logs out the user',
        tags: ['Authentication'],
        responses: {
          200: MessageResponseDto,
          400: ErrorResponseDto,
          500: ErrorResponseDto,
        },
      },
    },
    '/api/auth/refresh': {
      post: {
        summary: 'Refresh access token',
        description: 'Generates a new access token using the refresh token from cookies',
        tags: ['Authentication'],
        responses: {
          200: RefreshResponseDto,
          401: ErrorResponseDto,
          500: ErrorResponseDto,
        },
      },
    },
    '/api/auth/me': {
      get: {
        summary: 'Get current user',
        description: 'Returns the authenticated user information',
        tags: ['Authentication'],
        responses: {
          200: { user: UserResponseDto },
          401: ErrorResponseDto,
          404: ErrorResponseDto,
          500: ErrorResponseDto,
        },
      },
    },
  },
}>;

export type EarthquakeApiSpec = Tspec.DefineApiSpec<{
  tags: ['Earthquakes'],
  paths: {
    '/api/earthquakes': {
      get: {
        summary: 'List earthquakes',
        description: 'Get a paginated list of earthquakes with optional filters',
        tags: ['Earthquakes'],
        query: {
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
        };
        responses: {
          200: EarthquakeListResponseDto;
          401: ErrorResponseDto;
          500: ErrorResponseDto;
        };
      };
    };
    '/api/earthquakes/{id}': {
      get: {
        summary: 'Get earthquake details',
        description: 'Get detailed information about a specific earthquake',
        tags: ['Earthquakes'];
        path: {
          id: string;
        };
        responses: {
          200: EarthquakeDetailResponseDto;
          401: ErrorResponseDto;
          404: EarthquakeErrorResponseDto;
          500: ErrorResponseDto;
        };
      };
    };
    '/api/earthquakes/sync': {
      post: {
        summary: 'Sync earthquakes from USGS',
        description: 'Fetch and synchronize earthquake data from USGS API',
        tags: ['Earthquakes'];
        body: SyncEarthquakesParams;
        responses: {
          200: SyncEarthquakesResponseDto;
          401: ErrorResponseDto;
          500: SyncEarthquakesResponseDto;
        };
      };
    };
  };
}>;
