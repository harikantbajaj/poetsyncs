import React from 'react';

type Option = { value: string; label: string; };

interface SelectProps { value: string; onChange: (value: string) => void; options: Option[]; className?: string; }

export const Select: React.FC<SelectProps> = ({ value, onChange, options, className }) => (
  <select
	className={`border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${className || ''}`}
	value={value}
	onChange={e => onChange(e.target.value)}
  >
	{options.map(option => (
	  <option key={option.value} value={option.value}>
		{option.label}
	  </option>
	))}
  </select>
);

