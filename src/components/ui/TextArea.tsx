import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  autoResize?: boolean;
}

export const TextArea: React.FC<TextAreaProps> = ({
  label,
  error,
  className,
  autoResize = true,
  onChange,
  value,
  ...rest
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (autoResize && textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [value, autoResize]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (onChange) {
      onChange(e);
    }
    
    if (autoResize && textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      
      <motion.div
        className="relative"
        initial={false}
        animate={error ? { x: [0, -10, 10, -10, 10, 0] } : {}}
        transition={{ duration: 0.4 }}
      >
        <textarea
          ref={textareaRef}
          className={clsx(
            "w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all resize-none",
            error ? "border-error-500" : "border-gray-300",
            className
          )}
          onChange={handleChange}
          value={value}
          {...rest}
        />
      </motion.div>
      
      {error && (
        <p className="mt-1 text-sm text-error-500">{error}</p>
      )}
    </div>
  );
};