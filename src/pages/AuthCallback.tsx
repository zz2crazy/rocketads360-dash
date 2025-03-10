import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { handleFacebookCallback, storeAccessToken } from '../services/facebook/auth';
import { LoadingSpinner } from '../components/LoadingSpinner';

export default function AuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function handleCallback() {
      try {
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const error = searchParams.get('error');

        if (error) {
          throw new Error(error);
        }

        if (!code || !state) {
          throw new Error('Missing required parameters');
        }

        const response = await handleFacebookCallback(code, state);
        storeAccessToken(response.accessToken, response.expiresIn);
        
        // Return to BM Management
        navigate('/bm-management');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Authentication failed');
        setTimeout(() => navigate('/bm-management'), 3000);
      }
    }

    handleCallback();
  }, [navigate, searchParams]);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <div className="text-red-600 mb-4">
            <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Authentication Failed</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <p className="text-sm text-gray-500">Redirecting back...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <LoadingSpinner size="lg" className="mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Authenticating</h2>
        <p className="text-gray-600">Please wait while we complete the authentication...</p>
      </div>
    </div>
  );
}