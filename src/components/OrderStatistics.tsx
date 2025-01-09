import React from 'react';
import type { TimezoneStats } from '../types';

interface OrderStatisticsProps {
  totalOrders: number;
  pendingOrders: number;
  processingOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  totalAccountsProvided: number;
  timezoneStats: TimezoneStats[];
}

export function OrderStatistics({
  totalOrders,
  pendingOrders,
  processingOrders,
  completedOrders,
  cancelledOrders,
  totalAccountsProvided,
  timezoneStats
}: OrderStatisticsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      <div className="card p-4">
        <h3 className="text-xl font-semibold text-foreground mb-6">Order Status Overview</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="stat-card from-blue-50 to-indigo-50">
            <p className="text-sm text-gray-600">Total Orders</p>
            <p className="text-2xl font-bold text-primary mt-1">{totalOrders}</p>
          </div>
          <div className="stat-card from-amber-50 to-yellow-50">
            <p className="text-sm text-amber-600">Pending</p>
            <p className="text-2xl font-bold text-amber-700 mt-1">{pendingOrders}</p>
          </div>
          <div className="stat-card from-blue-50 to-sky-50">
            <p className="text-sm text-blue-600">Processing</p>
            <p className="text-2xl font-bold text-blue-700 mt-1">{processingOrders}</p>
          </div>
          <div className="stat-card from-emerald-50 to-green-50">
            <p className="text-sm text-green-600">Completed</p>
            <p className="text-2xl font-bold text-green-700 mt-1">{completedOrders}</p>
          </div>
          <div className="stat-card from-rose-50 to-red-50">
            <p className="text-sm text-red-600">Cancelled</p>
            <p className="text-2xl font-bold text-red-700 mt-1">{cancelledOrders}</p>
          </div>
          <div className="stat-card from-violet-50 to-purple-50">
            <p className="text-sm text-violet-600">Total Ad Accounts Served</p>
            <p className="text-2xl font-bold text-violet-700 mt-1">{totalAccountsProvided}</p>
          </div>
        </div>
      </div>

      <div className="card p-4">
        <h3 className="text-xl font-semibold text-primary mb-2">
          Ad Accounts Needed by Timezone
          <span className="block text-sm font-normal text-gray-600 mt-1">
            From pending orders
          </span>
        </h3>
        <div className="space-y-4">
          {timezoneStats.map(({ timezone, total }) => (
            <div key={timezone} className="flex items-center">
              <span className="flex-1 text-sm text-gray-700">{timezone}</span>
              <span className="ml-2 px-3 py-1 text-sm font-medium bg-primary/10 text-primary rounded-full">
                {total}
              </span>
            </div>
          ))}
          {timezoneStats.length === 0 && (
            <p className="text-sm text-gray-500 italic text-center py-4">No pending orders</p>
          )}
        </div>
      </div>
    </div>
  );
}