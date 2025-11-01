/**
 * Airtable Embed Component
 * Displays embedded Airtable table that updates in real-time
 */

import { useEffect } from 'react';

export interface AirtableEmbedProps {
  embedUrl: string;
  title?: string;
  height?: string;
}

/**
 * AirtableEmbed Component
 * Wraps Airtable iframe embed for displaying live tables
 */
export const AirtableEmbed: React.FC<AirtableEmbedProps> = ({
  embedUrl,
  title
}) => {
  // Load Airtable embed script if not already loaded
  useEffect(() => {
    if (!(window as any).airtable) {
      const script = document.createElement('script');
      script.src = 'https://airtable.com/embed.js';
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }
  }, []);

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-800 rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      {title && (
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {title}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            מתעדכנת בזמן אמת
          </p>
        </div>
      )}

      {/* Airtable Embed */}
      <div className="flex-1 overflow-hidden">
        <iframe
          className="airtable-embed w-full h-full border-0"
          src={embedUrl}
          frameBorder="0"
          title={title || 'Airtable Table'}
          allow="camera; microphone; geolocation"
          sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-presentation"
          style={{
            height: '100%',
            width: '100%',
            background: 'transparent'
          }}
        />
      </div>

      {/* Footer Info */}
      <div className="px-6 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-slate-900">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          הטבלה מתעדכנת אוטומטית כאשר סוכן ה-AI יוצר או משנה רשומות
        </p>
      </div>
    </div>
  );
};

export default AirtableEmbed;
