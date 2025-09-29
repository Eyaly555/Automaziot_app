import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useMeetingStore } from '../store/useMeetingStore';
import { useZohoAuth } from '../hooks/useZohoAuth';

export const ZohoConsent: React.FC = () => {
  const [showConsent, setShowConsent] = useState(false);
  const [consent, setConsent] = useState<boolean | null>(null);
  const { setZohoSyncEnabled } = useMeetingStore();
  const { startAuth } = useZohoAuth();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const savedConsent = localStorage.getItem('zoho_sync_consent');
    const hasZohoRecordId = searchParams.has('zohoRecordId');

    if (savedConsent === null && hasZohoRecordId) {
      setShowConsent(true);
    } else {
      setConsent(savedConsent === 'true');
      if (savedConsent === 'true') {
        setZohoSyncEnabled(true);
      }
    }
  }, [searchParams, setZohoSyncEnabled]);

  const handleConsent = (agreed: boolean) => {
    localStorage.setItem('zoho_sync_consent', agreed.toString());
    setConsent(agreed);
    setShowConsent(false);

    // Update store
    setZohoSyncEnabled(agreed);

    // If agreed, start OAuth flow
    if (agreed) {
      startAuth();
    }
  };

  if (!showConsent) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100]">
      <div dir="rtl" className="bg-white rounded-lg p-6 max-w-md shadow-xl">
        <h3 className="text-lg font-semibold mb-3">אישור סנכרון עם Zoho CRM</h3>
        <p className="text-gray-700 mb-4">
          האם ברצונך לסנכרן את נתוני הפגישה עם Zoho CRM?
          זה יאפשר שמירה אוטומטית של ההתקדמות וגישה לנתונים מתוך Zoho.
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => handleConsent(true)}
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
          >
            כן, סנכרן עם Zoho
          </button>
          <button
            onClick={() => handleConsent(false)}
            className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 transition-colors"
          >
            לא, עבוד מקומית בלבד
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-3">
          ניתן לשנות הגדרה זו בכל עת דרך ההגדרות
        </p>
      </div>
    </div>
  );
};