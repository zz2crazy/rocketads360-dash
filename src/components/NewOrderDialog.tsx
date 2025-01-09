import React, { useState } from 'react';
import { X } from 'lucide-react';
import { LoadingSpinner } from './LoadingSpinner';
import { TIMEZONES } from '../types';
import { ConfirmDialog } from './ConfirmDialog';

interface NewOrderDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (accountCount: number, timezone: string) => Promise<void>;
}

export function NewOrderDialog({ isOpen, onClose, onSubmit }: NewOrderDialogProps) {
  const [accountCount, setAccountCount] = useState(1);
  const [inputValue, setInputValue] = useState('1');
  const [accountNameSpec, setAccountNameSpec] = useState('');
  const [inputError, setInputError] = useState('');
  const [timezone, setTimezone] = useState(TIMEZONES[12]); // Default to GMT+00:00
  const [error, setError] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  if (!isOpen) return null;

  function handleAccountCountChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setInputValue(value);
    setInputError('');

    if (value === '') { 
      setInputError('Please enter a number');
      return;
    }
    
    const num = parseInt(value, 10);
    
    if (isNaN(num)) {
      setInputError('Please enter a valid number');
    } else if (num <= 0) {
      setInputError('Number must be greater than 0');
    } else {
      setAccountCount(num);
      setInputError('');
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (inputError) {
      return;
    }
    setShowConfirm(true);
  }

  async function handleConfirm() {
    setShowConfirm(false);
    setError('');
    setIsCreating(true);

    try {
      await onSubmit(accountCount, timezone, accountNameSpec);
      setAccountCount(1);
      setTimezone(TIMEZONES[12]);
      setAccountNameSpec('');
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create order');
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <>
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">Create New Order</h3>
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
                Number of Accounts
              </label>
              <input
                type="number"
                min="1"
                value={inputValue}
                onChange={handleAccountCountChange}
                className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 ${
                  inputError 
                    ? 'border-red-300 focus:border-red-500 text-red-900 placeholder-red-300'
                    : 'border-gray-300 focus:border-blue-500'
                }`}
                required
                disabled={isCreating}
              />
              {inputError && (
                <p className="mt-1 text-sm text-red-600">{inputError}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Timezone
              </label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
                disabled={isCreating}
              >
                {TIMEZONES.map((tz) => (
                  <option key={tz} value={tz}>
                    {tz}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Account Name Specification (Optional)
              </label>
              <textarea
                value={accountNameSpec}
                onChange={(e) => setAccountNameSpec(e.target.value)}
                maxLength={300}
                placeholder="Enter Name specification for your order (Optional)"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 h-20"
              />
              <p className="mt-1 text-sm text-gray-500">
                {accountNameSpec.length}/300 characters
              </p>
            </div>

            <div className="flex justify-end space-x-3 mt-5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                disabled={isCreating}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                disabled={isCreating || !!inputError}
              >
                {isCreating ? (
                  <span className="flex items-center">
                    <LoadingSpinner size="sm" className="mr-2" />
                    Creating...
                  </span>
                ) : (
                  'Create Order'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showConfirm}
        title="Confirm Order Creation"
        message={
          <div className="space-y-2">
            <p>Please confirm the order details:</p>
            <ul className="text-left text-sm space-y-1">
              <li>• Number of accounts: <span className="font-medium">{accountCount}</span></li>
              <li>• Timezone: <span className="font-medium">{timezone}</span></li>
              {accountNameSpec && (
                <li>
                  <span>• Account Name Specification:</span>
                  <div className="mt-1 p-2 bg-gray-50 rounded text-gray-700 text-sm whitespace-pre-wrap">
                    {accountNameSpec}
                  </div>
                </li>
              )}
            </ul>
          </div>
        }
        onConfirm={handleConfirm}
        onCancel={() => setShowConfirm(false)}
      />
      
      {isCreating && (
        <div className="fixed inset-0 bg-gray-600/50 backdrop-blur-sm flex items-center justify-center z-[60]">
          <div className="bg-white p-8 rounded-lg shadow-lg text-center">
            <LoadingSpinner size="lg" className="mb-4" />
            <p className="text-gray-600">Creating your order...</p>
          </div>
        </div>
      )}
    </>
  );
}