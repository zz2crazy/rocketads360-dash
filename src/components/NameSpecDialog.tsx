import React from 'react';
import { X } from 'lucide-react';

interface NameSpecDialogProps {
  isOpen: boolean;
  onClose: () => void;
  specification: string;
}

export function NameSpecDialog({ isOpen, onClose, specification }: NameSpecDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-[32rem] shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Account Name Specification</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="bg-gray-50 rounded-md p-4">
          <p className="text-gray-700 whitespace-pre-wrap">{specification}</p>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}