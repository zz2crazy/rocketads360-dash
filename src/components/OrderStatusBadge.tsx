import React from 'react';
import type { Order } from '../types';

interface OrderStatusBadgeProps {
  status: Order['status'];
}

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  function getStatusColor(status: Order['status']) {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  return (
    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full justify-center ${getStatusColor(status)}`}>
      {status}
    </span>
  );
}