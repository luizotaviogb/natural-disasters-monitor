import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useEarthquake } from '../hooks/useEarthquakes';
import { Loading } from '../components/common/Loading';
import { Header } from '../components/layout/Header';
import { formatDate, formatMagnitude, formatDepth, getMagnitudeColor, getAlertColor } from '../utils/formatters';

export const EarthquakeDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { data: earthquake, isLoading, error } = useEarthquake(id!);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <Loading />
      </div>
    );
  }

  if (error || !earthquake) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg">
            Earthquake not found or error loading data.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link to="/earthquakes" className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-6">
          <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to list
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="card">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <span className={`inline-flex items-center px-4 py-2 rounded-full text-lg font-bold ${getMagnitudeColor(earthquake.magnitude)}`}>
                      Magnitude {formatMagnitude(earthquake.magnitude)}
                    </span>
                    {earthquake.alert && (
                      <span className={`inline-flex items-center px-3 py-1 rounded text-sm font-medium border ${getAlertColor(earthquake.alert)}`}>
                        Alert: {earthquake.alert.toUpperCase()}
                      </span>
                    )}
                  </div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {earthquake.place}
                  </h1>
                  <p className="text-gray-600">
                    {formatDate(earthquake.time)}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Coordinates</h3>
                  <p className="text-lg font-semibold text-gray-900">
                    {earthquake.latitude.toFixed(4)}°, {earthquake.longitude.toFixed(4)}°
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Depth</h3>
                  <p className="text-lg font-semibold text-gray-900">{formatDepth(earthquake.depth)}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Magnitude Type</h3>
                  <p className="text-lg font-semibold text-gray-900">{earthquake.magType || 'N/A'}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Status</h3>
                  <p className="text-lg font-semibold text-gray-900 capitalize">{earthquake.status || 'N/A'}</p>
                </div>
              </div>

              {(earthquake.felt || earthquake.significance) && (
                <div className="border-t pt-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Impact</h2>
                  <div className="grid grid-cols-2 gap-4">
                    {earthquake.felt && (
                      <div>
                        <p className="text-sm text-gray-600">Felt Reports</p>
                        <p className="text-2xl font-bold text-primary-600">{earthquake.felt}</p>
                      </div>
                    )}
                    {earthquake.significance && (
                      <div>
                        <p className="text-sm text-gray-600">Significance</p>
                        <p className="text-2xl font-bold text-primary-600">{earthquake.significance}</p>
                      </div>
                    )}
                    {earthquake.cdi && (
                      <div>
                        <p className="text-sm text-gray-600">CDI (Intensity)</p>
                        <p className="text-2xl font-bold text-primary-600">{earthquake.cdi.toFixed(1)}</p>
                      </div>
                    )}
                    {earthquake.mmi && (
                      <div>
                        <p className="text-sm text-gray-600">MMI (Intensity)</p>
                        <p className="text-2xl font-bold text-primary-600">{earthquake.mmi.toFixed(1)}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="card">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Additional Info</h2>
              <dl className="space-y-3 text-sm">
                <div>
                  <dt className="text-gray-600">USGS ID</dt>
                  <dd className="font-mono text-xs text-gray-900 mt-1">{earthquake.usgsId}</dd>
                </div>
                <div>
                  <dt className="text-gray-600">Last Updated</dt>
                  <dd className="text-gray-900 mt-1">{formatDate(earthquake.updated)}</dd>
                </div>
                <div>
                  <dt className="text-gray-600">Tsunami Warning</dt>
                  <dd className="text-gray-900 mt-1">{earthquake.tsunamiFlag === 1 ? 'Yes' : 'No'}</dd>
                </div>
                {earthquake.detailUrl && (
                  <div>
                    <dt className="text-gray-600">USGS Details</dt>
                    <dd className="mt-1">
                      <a
                        href={earthquake.detailUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-600 hover:text-primary-700 hover:underline"
                      >
                        View on USGS →
                      </a>
                    </dd>
                  </div>
                )}
              </dl>
            </div>

            <div className="card">
              <h2 className="text-xl font-bold text-gray-900 mb-4">3D Visualization</h2>
              <div className="bg-gray-100 rounded-lg h-48 flex items-center justify-center">
                <p className="text-gray-500 text-sm text-center px-4">
                  3D visualization will appear here once<br/>images are processed
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
