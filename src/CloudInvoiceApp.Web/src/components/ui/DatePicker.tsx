import React from 'react';

interface DatePickerProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export const DatePicker: React.FC<DatePickerProps> = ({ 
  value, 
  onChange,
  className = ""
}) => {
  // Format the date to YYYY-MM-DD
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '';
    return date.toISOString().split('T')[0];
  };

  return (
    <input
      type="date"
      value={formatDate(value)}
      onChange={(e) => onChange(new Date(e.target.value).toISOString())}
      className={`border border-gray-300 rounded-md px-2 py-1 ${className}`}
    />
  );
};
