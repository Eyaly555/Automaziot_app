import React from 'react';
import { Star } from 'lucide-react';

interface RatingFieldProps {
  label?: string;
  value: number | undefined;
  onChange: (value: number) => void;
  max?: number;
  disabled?: boolean;
  required?: boolean;
  helperText?: string;
  className?: string;
  showValue?: boolean;
}

export const RatingField: React.FC<RatingFieldProps> = ({
  label,
  value = 0,
  onChange,
  max = 5,
  disabled = false,
  required = false,
  helperText,
  className = '',
  showValue = true
}) => {
  const handleClick = (rating: number) => {
    if (!disabled) {
      onChange(rating === value ? 0 : rating);
    }
  };

  return (
    <div className={`space-y-2 ${className}`} dir="rtl">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 mr-1">*</span>}
        </label>
      )}
      <div className="flex items-center gap-2">
        <div className="flex gap-1">
          {Array.from({ length: max }, (_, i) => i + 1).map(rating => (
            <button
              key={rating}
              type="button"
              onClick={() => handleClick(rating)}
              disabled={disabled}
              className={`p-1 transition-colors
                ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:scale-110'}`}
            >
              <Star
                className={`w-6 h-6 transition-colors
                  ${rating <= (value || 0)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-300'}`}
              />
            </button>
          ))}
        </div>
        {showValue && value > 0 && (
          <span className="text-sm text-gray-600">
            {value}/{max}
          </span>
        )}
      </div>
      {helperText && (
        <p className="text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
};