// File: src/components/ui/Badge.tsx
import React from 'react';

interface BadgeProps {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  className?: string;
  children: React.ReactNode;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  disabled?: boolean;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  size?: 'sm' | 'md' | 'lg';
}

export const Badge: React.FC<BadgeProps> = ({ 
  variant = 'default', 
  className = '', 
  children,
  leftIcon,
  rightIcon,
  onClick,
  disabled = false,
  size = 'md'
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'secondary':
        return 'bg-gray-100 text-gray-800';
      case 'destructive':
        return 'bg-red-500 text-white';
      case 'outline':
        return 'border border-gray-300 text-gray-700 bg-transparent';
      default:
        return 'bg-blue-600 text-white hover:bg-blue-700';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-3 py-1.5 text-sm';
      case 'lg':
        return 'px-6 py-3 text-lg';
      default:
        return 'px-4 py-2 text-base';
    }
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${getVariantClasses()} ${getSizeClasses()} ${className}`}
    >
      {leftIcon}
      {children}
      {rightIcon}
    </button>
  );
};