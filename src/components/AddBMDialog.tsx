import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { LoadingSpinner } from './LoadingSpinner';
import { fetchProviders } from '../services/supabase/provider';
import type { BMProvider } from '../types';

interface AddBMDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (provider: BMProvider, bmId: string) => Promise<void>;
}

export function AddBMDialog({ isOpen, onClose, onSubmit }: AddBMDialogProps) {
  const [providers, setProviders] = useState<BMProvider[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<string>('');
  const [bmId, setBmId] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadProviders();
    }
  }, [isOpen]);

  async function loadProviders() {
    try {
      const data = await fetchProviders();
      setProviders(data.filter(p => p.status === 'active'));
    } catch (err) {
      setError('Failed to load providers');
    }
  }

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const provider = providers.find(p => p.id === selectedProvider);
      if (!provider) {
        throw new Error('Please select a provider');
      }
      await onSubmit(provider, bmId);
      setBmId('');
      setSelectedProvider('');
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add BM account');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Add BM Account</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        {error && (
          <div className="mb-4 p-2 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Provider
            </label>
            <select
              value={selectedProvider}
              onChange={(e) => setSelectedProvider(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            >
              <option value="">Select a provider</option>
              {providers.map((provider) => (
                <option key={provider.id} value={provider.id}>
                  {provider.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              BM ID
            </label>
            <input
              type="text"
              value={bmId}
              onChange={(e) => setBmId(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Enter BM ID"
              required
              disabled={isLoading}
            />
          </div>

          <div className="flex justify-end space-x-3 mt-5">
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
              disabled={isLoading || !bmId || !selectedProvider}
            >
              {isLoading ? (
                <span className="flex items-center">
                  <LoadingSpinner size="sm" className="mr-2" />
                  Adding...
                </span>
              ) : (
                'Add BM'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}