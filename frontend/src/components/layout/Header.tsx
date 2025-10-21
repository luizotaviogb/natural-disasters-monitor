import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export const Header: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/dashboard" className="flex items-center space-x-2">
              <svg className="w-8 h-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 2 012 2v1a2 2 2 002 2 2 2 2 012 2v2.945M8 3.935V5.5A2.5 2.5 2.5 0 0010.5 8h.5a2 2 2 012 2 2 2 2 012 2v.5a2.5 2.5 2.5 0 002.5 2.5H19.055M3 12l9-9 9 9" />
              </svg>
              <span className="text-xl font-bold text-gray-900">
                Earthquake Monitor
              </span>
            </Link>
          </div>

          {isAuthenticated && (
            <nav className="flex items-center space-x-4">
              <Link
                to="/dashboard"
                className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Dashboard
              </Link>
              <Link
                to="/earthquakes"
                className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Earthquakes
              </Link>

              <div className="flex items-center space-x-3 ml-4 pl-4 border-l border-gray-300">
                <div className="text-sm">
                  <p className="font-medium text-gray-900">{user?.name}</p>
                  <p className="text-gray-500 text-xs">{user?.email}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="btn-secondary text-sm"
                >
                  Logout
                </button>
              </div>
            </nav>
          )}
        </div>
      </div>
    </header>
  );
};
