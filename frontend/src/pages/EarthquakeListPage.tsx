import React, { useState, useEffect, useRef } from 'react';
import { useEarthquakes, useSyncEarthquakes } from '../hooks/useEarthquakes';
import { EarthquakeCard } from '../components/earthquakes/EarthquakeCard';
import { Loading } from '../components/common/Loading';
import { Header } from '../components/layout/Header';
import { Pagination } from '../components/common/Pagination';

export const EarthquakeListPage: React.FC = () => {
  const [minMagnitude, setMinMagnitude] = useState<number>(2.5);
  const [limit, setLimit] = useState<number>(20);
  const [page, setPage] = useState<number>(1);
  const contentRef = useRef<HTMLDivElement>(null);

  const offset = (page - 1) * limit;

  const { data, isLoading, error, refetch } = useEarthquakes({
    minMagnitude,
    limit,
    offset,
    orderBy: 'time',
    orderDirection: 'desc',
  });

  const syncMutation = useSyncEarthquakes();

  useEffect(() => {
    setPage(1);
  }, [minMagnitude, limit]);

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [page]);

  const handleSync = async () => {
    try {
      await syncMutation.mutateAsync({ minMagnitude: 2.5, limit: 100 });
      await refetch();
    } catch (error: any) {
      console.error('Sync failed:', error);
      if (error.code === 'ECONNABORTED') {
        alert('Sync request timed out. The sync may still be processing on the server. Please try refreshing in a few moments.');
      } else {
        alert('Sync failed. Please try again.');
      }
    }
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div ref={contentRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Earthquakes</h1>
            <p className="mt-2 text-gray-600">
              Recent seismic activity from around the world
            </p>
          </div>

          <button
            onClick={handleSync}
            disabled={syncMutation.isPending}
            className="btn-primary"
          >
            {syncMutation.isPending ? 'Syncing...' : 'Sync from USGS'}
          </button>
        </div>

        <div className="mb-6 flex gap-4 items-end">
          <div>
            <label htmlFor="minMagnitude" className="label">
              Minimum Magnitude
            </label>
            <select
              id="minMagnitude"
              className="input"
              value={minMagnitude}
              onChange={(e) => setMinMagnitude(Number(e.target.value))}
            >
              <option value={0}>All</option>
              <option value={2.5}>2.5+</option>
              <option value={4.0}>4.0+</option>
              <option value={5.0}>5.0+</option>
              <option value={6.0}>6.0+</option>
            </select>
          </div>

          <div>
            <label htmlFor="limit" className="label">
              Results per page
            </label>
            <select
              id="limit"
              className="input"
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>

        {syncMutation.isSuccess && (
          <div className="mb-6 bg-green-50 border border-green-300 text-green-700 px-4 py-3 rounded-lg">
            <div className="font-semibold">Sync successful!</div>
            <div>Created: {syncMutation.data.data.created}, Updated: {syncMutation.data.data.updated}</div>
            {syncMutation.data.data.created > 0 && (
              <div className="text-sm mt-1">Images are being generated in the background.</div>
            )}
          </div>
        )}

        {isLoading ? (
          <Loading />
        ) : error ? (
          <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg">
            Error loading earthquakes. Please try again.
          </div>
        ) : data?.data.earthquakes.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No earthquakes found. Try syncing from USGS.</p>
          </div>
        ) : (
          <>
            <div className={`space-y-4 transition-opacity duration-200 ${isLoading ? 'opacity-50' : 'opacity-100'}`}>
              {data?.data.earthquakes.map((earthquake) => (
                <EarthquakeCard key={earthquake.id} earthquake={earthquake} />
              ))}
            </div>

            {isLoading && (
              <div className="mt-4 text-center">
                <Loading />
              </div>
            )}

            {data && data.data.total > 0 && (
              <Pagination
                currentPage={page}
                totalItems={data.data.total}
                itemsPerPage={limit}
                onPageChange={handlePageChange}
                hasMore={data.data.hasMore}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};
