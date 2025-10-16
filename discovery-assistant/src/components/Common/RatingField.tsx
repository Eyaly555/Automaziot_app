import React from 'react';
import { Star } from 'lucide-react';

interface RatingFieldProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  max?: number;
  required?: boolean;
  helperText?: string;
  showLabels?: boolean;
}

export const RatingField: React.FC<RatingFieldProps> = ({
  label,
  value,
  onChange,
  max = 5,
  required = false,
  helperText,
  showLabels = true,
}) => {
  const labels = ['נמוך מאוד', 'נמוך', 'בינוני', 'גבוה', 'גבוה מאוד'];

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 mr-1">*</span>}
      </label>

      <div className="flex items-center gap-3">
        <div className="flex gap-1">
          {[...Array(max)].map((_, index) => {
            const ratingValue = index + 1;
            return (
              <button
                key={index}
                type="button"
                onClick={() => onChange(ratingValue)}
                className={`p-1 transition-all duration-200 transform hover:scale-110 ${
                  ratingValue <= value ? 'text-yellow-400' : 'text-gray-300'
                }`}
                aria-label={`דירוג ${ratingValue} מתוך ${max}`}
              >
                <Star
                  className={`w-8 h-8 ${
                    ratingValue <= value ? 'fill-current' : ''
                  }`}
                />
              </button>
            );
          })}
        </div>

        {showLabels && value > 0 && (
          <span
            className={`text-sm font-medium ${
              value <= 2
                ? 'text-red-600'
                : value === 3
                  ? 'text-yellow-600'
                  : 'text-green-600'
            }`}
          >
            {labels[value - 1]}
          </span>
        )}
      </div>

      {helperText && <p className="text-sm text-gray-500">{helperText}</p>}
    </div>
  );
};
