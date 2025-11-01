/**
 * Airtable Embed Component
 * Displays embedded Airtable table that updates in real-time
 * Fully optimized for mobile, tablet, and desktop viewports
 */

import React from 'react';

export interface AirtableEmbedProps {
  embedUrl: string;
  title?: string;
  height?: string;
}

/**
 * AirtableEmbed Component
 * Wraps Airtable iframe embed for displaying live tables
 * Mobile-optimized with responsive padding and typography
 */
export const AirtableEmbed: React.FC<AirtableEmbedProps> = ({
  embedUrl,
  title
}) => {

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-800 rounded-lg shadow-lg overflow-hidden">
      {/* Header - Mobile optimized spacing and text sizes */}
      {title && (
        <div className="px-3 py-2 sm:px-6 sm:py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900 dark:text-white truncate">
            {title}
          </h3>
          <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mt-0.5 sm:mt-1">
            מתעדכנת בזמן אמת
          </p>
        </div>
      )}

      {/* Airtable Embed - Responsive iframe */}
      <div className="flex-1 overflow-hidden">
        <iframe
          className="airtable-embed w-full h-full border-0"
          src={embedUrl}
          frameBorder="0"
          title={title || 'Airtable Table'}
          allow="camera; microphone; geolocation"
          sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-presentation"
          loading="lazy"
          style={{
            height: '100%',
            width: '100%',
            background: 'transparent',
            minHeight: '200px'
          }}
        />
      </div>

      {/* Footer Info - Mobile optimized padding */}
      <div className="px-3 py-2 sm:px-6 sm:py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-slate-900">
        <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
          הטבלה מתעדכנת אוטומטית כאשר סוכן ה-AI יוצר או משנה רשומות
        </p>
      </div>
    </div>
  );
};

export default AirtableEmbed;
