import React from 'react';

const LoadingSpinner = () => {
  return (
    <div className="flex items-center justify-center py-4">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-color-accent"></div>
      <p className="ml-3 text-color-text-secondary">Loading...</p>
    </div>
  );
};

export default LoadingSpinner;