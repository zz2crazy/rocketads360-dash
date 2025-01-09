import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { LoadingSpinner } from './LoadingSpinner';
import { fetchCustomerProfiles } from '../services/supabase/webhook';
import type { Profile } from '../types';

interface AddWebhookDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (clientId: string, webhookUrl: string) => Promise<void>;
}

export function AddWebhookDialog({ isOpen, onClose, onSubmit }: AddWebhookDialogProps) {
  const [clientId, setClientId] = useState('');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [clients, setClients] = useState<Profile[]>([]);
  const [error, setError] = useState('');
  const [urlError, setUrlError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function loadClients() {
      try {
        const profiles = await fetchCustomerProfiles();
        setClients(profiles);
      } catch (err) {
        console.error('Error fetching clients:', err);
      }
    }

    if (isOpen) {
      loadClients();
    }
  }, [isOpen]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    // Clear previous errors
    setError('');
    setUrlError('');

    // Validate URL format
    try {
      new URL(webhookUrl);
    } catch {
      setUrlError('Please enter a valid URL');
      return;
    }

    setIsLoading(true);

    try {
      await onSubmit(clientId, webhookUrl);
      setClientId('');
      setWebhookUrl('');
      onClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create webhook';
      if (message.includes('webhook URL') || message.includes('endpoint')) {
        setUrlError(message);
      } else {
        setError(message);
      }
    } finally {
      setIsLoading(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto outline-none focus:outline-none">
      <div className="relative w-full max-w-md mx-auto my-6">
        <div className="relative flex flex-col w-full bg-white border-0 rounded-lg shadow-lg outline-none focus:outline-none">
          <div className="flex items-start justify-between p-5 border-b border-solid rounded-t border-blueGray-200">
            <h3 className="text-lg font-semibold">Add Webhook</h3>
            <button
              className="float-right p-1 ml-auto bg-transparent border-0 text-black opacity-5 float-right text-3xl leading-none font-semibold outline-none focus:outline-none"
              onClick={onClose}
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="p-4">
            {error && (
              <div className="mb-4 p-2 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Client
              </label>
              <select
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm bg-white"
                required
                disabled={isLoading}
              >
                <option value="">Select a client</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.client_name} ({client.email})
                  </option>
                ))}
              </select>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Webhook URL
              </label>
              <div>
                <input
                  type="url"
                  value={webhookUrl}
                  onChange={(e) => {
                    setWebhookUrl(e.target.value);
                    setUrlError('');
                  }}
                  className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 ${
                    urlError ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
                  }`}
                  required
                  disabled={isLoading}
                  placeholder="https://"
                />
                {urlError && (
                  <p className="mt-1 text-sm text-red-600">{urlError}</p>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <LoadingSpinner size="sm" className="mr-2" />
                    Creating...
                  </span>
                ) : (
                  'Create Webhook'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}