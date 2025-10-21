import React from 'react';
import { Link } from 'react-router-dom';
import type { Earthquake } from '../../types/earthquake.types';
import { formatRelativeTime, formatMagnitude, formatDepth, getMagnitudeColor, getAlertColor } from '../../utils/formatters';

interface EarthquakeCardProps {
  earthquake: Earthquake;
}

export const EarthquakeCard: React.FC<EarthquakeCardProps> = ({ earthquake }) => {
  return (
    <Link to={`/earthquakes/${earthquake.id}`} className="block">
      <div className="card hover:shadow-lg transition-shadow cursor-pointer">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${getMagnitudeColor(earthquake.magnitude)}`}>
                M {formatMagnitude(earthquake.magnitude)}
              </span>
              {earthquake.alert && (
                <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium border ${getAlertColor(earthquake.alert)}`}>
                  {earthquake.alert.toUpperCase()}
                </span>
              )}
              {earthquake.tsunamiFlag === 1 && (
                <span className="inline-flex items-center px-2 py-1 rounded bg-blue-100 text-blue-800 text-xs font-medium">
                  Tsunami
                </span>
              )}
            </div>

            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {earthquake.place}
            </h3>

            <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
              <div>
                <span className="font-medium">Time:</span> {formatRelativeTime(earthquake.time)}
              </div>
              <div>
                <span className="font-medium">Depth:</span> {formatDepth(earthquake.depth)}
              </div>
              <div>
                <span className="font-medium">Location:</span> {earthquake.latitude.toFixed(3)}°, {earthquake.longitude.toFixed(3)}°
              </div>
              {earthquake.felt !== undefined && earthquake.felt > 0 && (
                <div>
                  <span className="font-medium">Felt:</span> {earthquake.felt} reports
                </div>
              )}
            </div>

            {earthquake.status && (
              <div className="mt-3">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700">
                  Status: {earthquake.status}
                </span>
              </div>
            )}
          </div>

          <div className="ml-4">
            <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </Link>
  );
};
