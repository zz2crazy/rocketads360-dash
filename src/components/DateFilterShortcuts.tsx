import React from 'react';
import { startOfToday, endOfToday, startOfYesterday, endOfYesterday, subDays, startOfDay, endOfDay } from 'date-fns';

interface DateFilterShortcutsProps {
  onSelect: (range: { start: string; end: string }) => void;
  className?: string;
}

export function DateFilterShortcuts({ onSelect, className = '' }: DateFilterShortcutsProps) {
  const shortcuts = [
    {
      label: 'Today',
      getRange: () => ({
        start: startOfToday().toISOString().split('T')[0],
        end: endOfToday().toISOString().split('T')[0]
      })
    },
    {
      label: 'Yesterday',
      getRange: () => ({
        start: startOfYesterday().toISOString().split('T')[0],
        end: endOfYesterday().toISOString().split('T')[0]
      })
    },
    {
      label: 'Last 7 Days',
      getRange: () => ({
        start: startOfDay(subDays(new Date(), 6)).toISOString().split('T')[0],
        end: endOfToday().toISOString().split('T')[0]
      })
    },
    {
      label: 'Last 30 Days',
      getRange: () => ({
        start: startOfDay(subDays(new Date(), 29)).toISOString().split('T')[0],
        end: endOfToday().toISOString().split('T')[0]
      })
    }
  ];

  return (
    <select
      onChange={(e) => {
        const shortcut = shortcuts[parseInt(e.target.value)];
        if (shortcut) {
          onSelect(shortcut.getRange());
        }
      }}
      className={`rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${className}`}
    >
      <option value="">Quick Select</option>
      {shortcuts.map(({ label }, index) => (
        <option key={label} value={index}>{label}</option>
      ))}
    </select>
  );
}