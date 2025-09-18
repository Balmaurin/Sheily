import React from 'react';

export const Switch = ({ 
  checked, 
  onCheckedChange,
  className = ''
}: {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  className?: string;
}) => (
  <button
    onClick={() => onCheckedChange(!checked)}
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
      checked ? 'bg-cyan-600' : 'bg-gray-600'
    } ${className}`}
  >
    <span
      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
        checked ? 'translate-x-6' : 'translate-x-1'
      }`}
    />
  </button>
);
