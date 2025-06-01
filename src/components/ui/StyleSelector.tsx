import React from 'react';

interface Option {
  value: string;
  label: string;
  description: string;
}

interface StyleSelectorProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  label: string;
}

export const StyleSelector: React.FC<StyleSelectorProps> = ({
  options,
  value,
  onChange,
  label
}) => {
  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-900">
        {label}
      </label>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {options.map((option) => (
          <div
            key={option.value}
            onClick={() => onChange(option.value)}
            className={`cursor-pointer border rounded-lg p-4 transition-all duration-200 ${
              value === option.value
                ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500 ring-opacity-20'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-gray-900">{option.label}</h3>
              <div
                className={`w-4 h-4 rounded-full border-2 transition-colors ${
                  value === option.value
                    ? 'border-blue-500 bg-blue-500'
                    : 'border-gray-300'
                }`}
              >
                {value === option.value && (
                  <div className="w-full h-full rounded-full bg-white scale-50"></div>
                )}
              </div>
            </div>
            <p className="text-sm text-gray-600">{option.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};