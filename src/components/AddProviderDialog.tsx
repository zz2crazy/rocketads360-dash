import React, { useState } from 'react';
import { X } from 'lucide-react';
import { LoadingSpinner } from './LoadingSpinner';

interface AddProviderDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string) => Promise<void>;
}

export function AddProviderDialog({ isOpen, onClose, onSubmit }: AddProviderDialogProps) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await onSubmit(name);
      setName('');
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create provider');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Add Provider</h3>
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
              Provider Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Enter provider name"
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
              disabled={isLoading || !name.trim()}
            >
              {isLoading ? (
                <span className="flex items-center">
                  <LoadingSpinner size="sm" className="mr-2" />
                  Creating...
                </span>
              ) : (
                'Create Provider'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}