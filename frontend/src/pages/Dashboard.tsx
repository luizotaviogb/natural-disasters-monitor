import React from 'react';
import { Link } from 'react-router-dom';
import { useEarthquakes } from '../hooks/useEarthquakes';
import { Header } from '../components/layout/Header';
import { Loading } from '../components/common/Loading';
import { useAuth } from '../hooks/useAuth';
import { formatRelativeTime, formatMagnitude, getMagnitudeColor } from '../utils/formatters';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { data, isLoading } = useEarthquakes({
    limit: 5,
    orderBy: 'time',
    orderDirection: 'desc',
  });

  const stats = {
    total: data?.data.total || 0,
    recent: data?.data.earthquakes.filter(e => e.magnitude >= 5.0).length || 0,
    significant: data?.data.earthquakes.filter(e => e.magnitude >= 6.0).length || 0,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.name}!</h1>
          <p className="mt-2 text-gray-600">
            Monitor and analyze global seismic activity
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Earthquakes</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">M 5.0+ (Recent)</p>
                <p className="text-2xl font-bold text-gray-900">{stats.recent}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">M 6.0+ (Recent)</p>
                <p className="text-2xl font-bold text-gray-900">{stats.significant}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
              <Link to="/earthquakes" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                View all →
              </Link>
            </div>

            {isLoading ? (
              <Loading />
            ) : data?.data.earthquakes.length === 0 ? (
              <p className="text-gray-600 text-center py-8">
                No earthquakes found. Try syncing from USGS.
              </p>
            ) : (
              <div className="space-y-4">
                {data?.data.earthquakes.map((earthquake) => (
                  <Link
                    key={earthquake.id}
                    to={`/earthquakes/${earthquake.id}`}
                    className="block hover:bg-gray-50 -mx-6 px-6 py-3 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${getMagnitudeColor(earthquake.magnitude)}`}>
                            M {formatMagnitude(earthquake.magnitude)}
                          </span>
                          <span className="text-sm text-gray-600">
                            {formatRelativeTime(earthquake.time)}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-gray-900">{earthquake.place}</p>
                      </div>
                      <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="card">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Link to="/earthquakes" className="block p-4 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors">
                <h3 className="font-semibold text-primary-900 mb-1">Browse All Earthquakes</h3>
                <p className="text-sm text-primary-700">View and filter all recorded seismic events</p>
              </Link>
              <div className="block p-4 bg-gray-100 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-1">Map View</h3>
                <p className="text-sm text-gray-600">Interactive global earthquake map (Coming soon)</p>
              </div>
              <div className="block p-4 bg-gray-100 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-1">Analytics</h3>
                <p className="text-sm text-gray-600">Detailed analytics and trends (Coming soon)</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
