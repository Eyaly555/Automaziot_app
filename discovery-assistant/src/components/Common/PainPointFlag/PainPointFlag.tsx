import React, { useState } from 'react';
import { AlertTriangle, X, Flame } from 'lucide-react';
import { useMeetingStore } from '../../../store/useMeetingStore';
import { severityToColor, severityToHebrew } from '../../../utils/formatters';

interface PainPointFlagProps {
  module: string;
  subModule?: string;
  label?: string;
  autoDetect?: boolean;
  condition?: boolean;
}

export const PainPointFlag: React.FC<PainPointFlagProps> = ({
  module,
  subModule,
  label = 'כאב נקודתי',
  autoDetect = false,
  condition = false,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState<
    'low' | 'medium' | 'high' | 'critical'
  >('medium');
  const [potentialHours, setPotentialHours] = useState<number>(0);

  const { addPainPoint } = useMeetingStore();

  const handleAddPainPoint = () => {
    if (description) {
      addPainPoint({
        module,
        subModule,
        severity,
        description,
        potentialHours,
      });
      setDescription('');
      setPotentialHours(0);
      setShowModal(false);
    }
  };

  const isCritical = autoDetect && condition;

  return (
    <>
      <div className="inline-flex items-center gap-2">
        {isCritical && (
          <span className="flex items-center gap-1 px-2 py-1 bg-red-50 text-red-700 rounded text-xs font-medium">
            <Flame className="w-3 h-3" />
            כאב קריטי
          </span>
        )}
        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-orange-700 bg-orange-50 rounded hover:bg-orange-100 transition-colors"
        >
          <AlertTriangle className="w-3 h-3" />
          {label}
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md" dir="rtl">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold">הוסף נקודת כאב</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  תיאור הבעיה
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                  placeholder="תאר את הבעיה ומה ההשפעה שלה..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  חומרת הבעיה
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(['low', 'medium', 'high', 'critical'] as const).map(
                    (level) => (
                      <button
                        key={level}
                        type="button"
                        onClick={() => setSeverity(level)}
                        className={`px-3 py-2 rounded-md text-sm font-medium transition-colors
                        ${
                          severity === level
                            ? severityToColor(level)
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {severityToHebrew(level)}
                      </button>
                    )
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  שעות פוטנציאל חיסכון (בחודש)
                </label>
                <input
                  type="number"
                  value={potentialHours || ''}
                  onChange={(e) =>
                    setPotentialHours(parseInt(e.target.value) || 0)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                  placeholder="0"
                  min="0"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                ביטול
              </button>
              <button
                type="button"
                onClick={handleAddPainPoint}
                disabled={!description}
                className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                הוסף כאב
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
