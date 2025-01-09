import React from 'react';
import { Filter } from 'lucide-react';
import { DateFilterShortcuts } from './DateFilterShortcuts';
import type { Order } from '../types';

interface CustomerOrderFiltersProps {
  dateRange: {
    start: string;
    end: string;
  };
  selectedStatus: string;
  onDateRangeChange: (range: { start: string; end: string }) => void;
  onStatusChange: (status: string) => void;
}

export function CustomerOrderFilters({
  dateRange,
  selectedStatus,
  onDateRangeChange,
  onStatusChange
}: CustomerOrderFiltersProps) {
  return (
    <div className="bg-white p-3 rounded-lg shadow-sm mb-6">
      <div className="flex items-center gap-4">
        <div className="flex items-center text-gray-600">
          <Filter className="h-5 w-5 mr-2" />
          <span className="font-medium">Filters</span>
        </div>

        <div className="flex-1 flex items-center gap-4">
          <DateFilterShortcuts 
            onSelect={onDateRangeChange}
            className="w-32 text-sm"
          />
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => onDateRangeChange({ ...dateRange, start: e.target.value })}
              className="w-36 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
            />
            <span className="text-gray-500">to</span>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => onDateRangeChange({ ...dateRange, end: e.target.value })}
              className="w-36 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
            />
          </div>

          <select
            value={selectedStatus}
            onChange={(e) => onStatusChange(e.target.value)}
            className="w-32 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>
    </div>
  );
}