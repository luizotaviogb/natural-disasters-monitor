export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

export const formatRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInHours < 1) {
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
  }
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
  }
  if (diffInDays < 7) {
    return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
  }
  return formatDate(dateString);
};

export const formatMagnitude = (magnitude: number): string => {
  return magnitude.toFixed(1);
};

export const formatDepth = (depth: number): string => {
  return `${depth.toFixed(1)} km`;
};

export const getMagnitudeColor = (magnitude: number): string => {
  if (magnitude >= 7.0) return 'text-red-700 bg-red-100';
  if (magnitude >= 6.0) return 'text-red-600 bg-red-50';
  if (magnitude >= 5.0) return 'text-orange-600 bg-orange-50';
  if (magnitude >= 4.0) return 'text-yellow-600 bg-yellow-50';
  if (magnitude >= 3.0) return 'text-blue-600 bg-blue-50';
  return 'text-gray-600 bg-gray-50';
};

export const getAlertColor = (alert?: string): string => {
  switch (alert) {
    case 'red':
      return 'text-red-700 bg-red-100 border-red-300';
    case 'orange':
      return 'text-orange-700 bg-orange-100 border-orange-300';
    case 'yellow':
      return 'text-yellow-700 bg-yellow-100 border-yellow-300';
    case 'green':
      return 'text-green-700 bg-green-100 border-green-300';
    default:
      return 'text-gray-700 bg-gray-100 border-gray-300';
  }
};
