import React from 'react';

/**
 * Loading State Components
 * Unified loading states across the application
 */

export const LoadingState: React.FC<{ message?: string }> = ({ message }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4" />
      <p className="text-gray-600">{message || 'טוען...'}</p>
    </div>
  );
};

export const SkeletonCard: React.FC = () => {
  return (
    <div className="animate-pulse bg-white rounded-lg p-6 shadow">
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-4" />
      <div className="h-4 bg-gray-200 rounded w-1/2" />
    </div>
  );
};

export const SkeletonList: React.FC<{ items?: number }> = ({ items = 3 }) => {
  return (
    <div className="space-y-4">
      {Array.from({ length: items }).map((_, index) => (
        <div
          key={index}
          className="animate-pulse bg-white rounded-lg p-4 shadow"
        >
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-2" />
          <div className="h-3 bg-gray-200 rounded w-3/4 mb-1" />
          <div className="h-3 bg-gray-200 rounded w-1/2" />
        </div>
      ))}
    </div>
  );
};
