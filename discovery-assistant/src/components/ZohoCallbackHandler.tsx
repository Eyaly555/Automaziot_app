import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useMeetingStore } from '../store/useMeetingStore';

export const ZohoCallbackHandler: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setZohoToken } = useMeetingStore();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      const state = searchParams.get('state');
      const error = searchParams.get('error');

      // Handle OAuth errors
      if (error) {
        setStatus('error');
        setErrorMessage(error === 'access_denied' ?
          'הרשאה נדחתה. נא לאשר גישה כדי להמשיך.' :
          `שגיאה באימות: ${error}`);
        return;
      }

      if (!code || !state) {
        setStatus('error');
        setErrorMessage('פרמטרים חסרים בתגובת האימות');
        return;
      }

      // Validate state to prevent CSRF
      const storedState = sessionStorage.getItem('zoho_auth_state');
      if (state !== storedState) {
        setStatus('error');
        setErrorMessage('אימות נכשל - בעיית אבטחה');
        sessionStorage.removeItem('zoho_pkce_verifier');
        sessionStorage.removeItem('zoho_auth_state');
        return;
      }

      // Get PKCE verifier
      const verifier = sessionStorage.getItem('zoho_pkce_verifier');
      if (!verifier) {
        setStatus('error');
        setErrorMessage('מפתח אימות חסר. נא לנסות שוב.');
        return;
      }

      try {
        // Exchange code for token
        const response = await fetch('/api/zoho/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ code, verifier })
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          throw new Error(errorData?.message || 'החלפת קוד נכשלה');
        }

        const data = await response.json();

        // Store tokens
        const tokenData = {
          accessToken: data.access_token,
          refreshToken: data.refresh_token,
          expiresAt: Date.now() + (data.expires_in * 1000),
          scope: data.scope
        };

        // Save to store and localStorage
        setZohoToken(data.access_token);
        localStorage.setItem('zoho_token_data', JSON.stringify(tokenData));

        // Clean up temporary storage
        sessionStorage.removeItem('zoho_pkce_verifier');
        sessionStorage.removeItem('zoho_auth_state');

        setStatus('success');

        // Redirect back to original Zoho record if available
        const returnUrl = sessionStorage.getItem('zoho_return_url');
        if (returnUrl) {
          console.log('Redirecting back to:', returnUrl);
          sessionStorage.removeItem('zoho_return_url');
          // Use replace to prevent back button issues
          window.location.replace(returnUrl);
        } else {
          setTimeout(() => navigate('/', { replace: true }), 2000);
        }

      } catch (error) {
        console.error('OAuth callback error:', error);
        setStatus('error');
        setErrorMessage(error instanceof Error ? error.message : 'שגיאה בלתי צפויה');
      }
    };

    handleCallback();
  }, [searchParams, navigate, setZohoToken]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        {status === 'processing' && (
          <>
            <div className="flex justify-center mb-4">
              <svg className="animate-spin h-12 w-12 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-center mb-2">מתבצע אימות</h2>
            <p className="text-gray-600 text-center">מחבר את החשבון שלך ל-Zoho CRM...</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="flex justify-center mb-4">
              <svg className="h-12 w-12 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-center mb-2 text-green-600">אומת בהצלחה!</h2>
            <p className="text-gray-600 text-center">החיבור ל-Zoho CRM הושלם. מעביר אותך בחזרה...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="flex justify-center mb-4">
              <svg className="h-12 w-12 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-center mb-2 text-red-600">שגיאה באימות</h2>
            <p className="text-gray-600 text-center mb-4">{errorMessage}</p>
            <div className="flex gap-3">
              <button
                onClick={() => navigate('/')}
                className="flex-1 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
              >
                חזור לאפליקציה
              </button>
              <button
                onClick={() => window.location.reload()}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                נסה שוב
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};