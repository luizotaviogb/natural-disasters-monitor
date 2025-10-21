import { body, query, param } from 'express-validator';

export const listEarthquakesValidation = [
  query('minMagnitude')
    .optional()
    .isFloat({ min: 0, max: 10 })
    .withMessage('Minimum magnitude must be between 0 and 10'),
  query('maxMagnitude')
    .optional()
    .isFloat({ min: 0, max: 10 })
    .withMessage('Maximum magnitude must be between 0 and 10'),
  query('startTime')
    .optional()
    .isISO8601()
    .withMessage('Start time must be a valid ISO 8601 date'),
  query('endTime')
    .optional()
    .isISO8601()
    .withMessage('End time must be a valid ISO 8601 date'),
  query('minLatitude')
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage('Minimum latitude must be between -90 and 90'),
  query('maxLatitude')
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage('Maximum latitude must be between -90 and 90'),
  query('minLongitude')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('Minimum longitude must be between -180 and 180'),
  query('maxLongitude')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('Maximum longitude must be between -180 and 180'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('offset')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Offset must be a non-negative integer'),
  query('orderBy')
    .optional()
    .isIn(['time', 'magnitude'])
    .withMessage('Order by must be either "time" or "magnitude"'),
  query('orderDirection')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Order direction must be either "asc" or "desc"'),
];

export const getEarthquakeValidation = [
  param('id').isUUID().withMessage('Invalid earthquake ID'),
];

export const syncEarthquakesValidation = [
  body('minMagnitude')
    .optional()
    .isFloat({ min: 0, max: 10 })
    .withMessage('Minimum magnitude must be between 0 and 10'),
  body('startTime')
    .optional()
    .isISO8601()
    .withMessage('Start time must be a valid ISO 8601 date'),
  body('endTime')
    .optional()
    .isISO8601()
    .withMessage('End time must be a valid ISO 8601 date'),
  body('limit')
    .optional()
    .isInt({ min: 1, max: 1000 })
    .withMessage('Limit must be between 1 and 1000'),
];
