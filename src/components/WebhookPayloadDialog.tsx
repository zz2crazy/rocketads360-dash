import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { LoadingSpinner } from './LoadingSpinner';

interface WebhookPayloadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (config: WebhookPayloadConfig, webhookUrl?: string) => Promise<void>;
  initialConfig?: WebhookPayloadConfig;
  webhookUrl?: string;
  isGlobal?: boolean;
}

export interface WebhookPayloadConfig {
  orderCreated: string;
  orderUpdated: string;
}

import { DEFAULT_MESSAGE_TEMPLATES } from '../services/webhook/types';

export function WebhookPayloadDialog({ 
  isOpen, 
  onClose, 
  onSubmit, 
  initialConfig,
  webhookUrl,
  isGlobal = false 
}: WebhookPayloadDialogProps) {
  const [config, setConfig] = useState<WebhookPayloadConfig>(initialConfig || DEFAULT_MESSAGE_TEMPLATES);
  const [url, setUrl] = useState(webhookUrl || '');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [urlError, setUrlError] = useState('');

  // Update config when initialConfig changes
  useEffect(() => {
    if (initialConfig) {
      setConfig(initialConfig);
    }
    if (webhookUrl) {
      setUrl(webhookUrl);
    }
  }, [initialConfig, webhookUrl]);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    // Clear previous errors
    setError('');
    setUrlError('');

    // Validate URL if not global config
    if (!isGlobal) {
      try {
        new URL(url);
      } catch {
        setUrlError('Please enter a valid URL');
        return;
      }
    }

    setIsLoading(true);

    try {
      await onSubmit(config, !isGlobal ? url : undefined);
      onClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update webhook configuration';
      if (message.includes('webhook URL') || message.includes('endpoint')) {
        setUrlError(message);
      } else {
        setError(message);
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto outline-none focus:outline-none">
      <div className="relative w-full max-w-2xl mx-auto my-6">
        <div className="relative flex flex-col w-full bg-white border-0 rounded-lg shadow-lg outline-none focus:outline-none">
          <div className="flex items-start justify-between p-5 border-b border-solid rounded-t">
            <h3 className="text-lg font-semibold">
              {isGlobal ? 'Global Webhook Configuration' : 'Webhook Configuration'}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {!isGlobal && (
            <div className="px-6 pt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Webhook URL
              </label>
              <div>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => {
                    setUrl(e.target.value);
                    setUrlError('');
                  }}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    urlError ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="https://"
                  required
                />
                {urlError && (
                  <p className="mt-1 text-sm text-red-600">{urlError}</p>
                )}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="p-6">
            {error && (
              <div className="mb-4 p-2 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Order Created Message Template
                </label>
                <textarea
                  value={config.orderCreated}
                  onChange={(e) => setConfig(prev => ({ ...prev, orderCreated: e.target.value }))}
                  className="w-full h-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter message template for new orders"
                  required
                />
                <p className="mt-1 text-sm text-gray-500">
                  Available variables: {'{order_id}'}, {'{client_name}'}, {'{account_count}'}, {'{timezone}'}, {'{timestamp}'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Order Updated Message Template
                </label>
                <textarea
                  value={config.orderUpdated}
                  onChange={(e) => setConfig(prev => ({ ...prev, orderUpdated: e.target.value }))}
                  className="w-full h-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter message template for order updates"
                  required
                />
                <p className="mt-1 text-sm text-gray-500">
                  Available variables: {'{order_id}'}, {'{nickname}'}, {'{previous_status}'}, {'{status}'}, {'{timestamp}'}
                </p>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
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
                    Saving...
                  </span>
                ) : (
                  'Save Configuration'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}