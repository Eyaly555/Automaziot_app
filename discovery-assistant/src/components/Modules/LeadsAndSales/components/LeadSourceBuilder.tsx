import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { Button, Input, Select } from '../../../Base';
import type { LeadSource } from '../../../../types';

interface LeadSourceBuilderProps {
  sources: LeadSource[];
  onChange: (sources: LeadSource[]) => void;
}

const channelOptions = [
  { value: 'website', label: 'אתר אינטרנט' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'google_ads', label: 'Google Ads' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'referral', label: 'המלצות' },
  { value: 'phone', label: 'טלפון' },
  { value: 'email', label: 'אימייל' },
  { value: 'walk_in', label: 'כניסה ישירה' },
  { value: 'other', label: 'אחר' },
];

export const LeadSourceBuilder: React.FC<LeadSourceBuilderProps> = ({
  sources,
  onChange,
}) => {
  const [newChannel, setNewChannel] = useState('');
  const [newVolume, setNewVolume] = useState('');
  const [newQuality, setNewQuality] = useState<number>(3);

  const handleAdd = () => {
    if (!newChannel) return;

    const newSource: LeadSource = {
      channel: newChannel,
      volumePerMonth: newVolume ? parseInt(newVolume) : undefined,
      quality: newQuality as 1 | 2 | 3 | 4 | 5,
    };

    onChange([...sources, newSource]);
    setNewChannel('');
    setNewVolume('');
    setNewQuality(3);
  };

  const handleRemove = (index: number) => {
    onChange(sources.filter((_, i) => i !== index));
  };

  const handleUpdate = (index: number, updates: Partial<LeadSource>) => {
    const updated = sources.map((source, i) =>
      i === index ? { ...source, ...updates } : source
    );
    onChange(updated);
  };

  return (
    <div className="space-y-4" dir="rtl">
      {/* Existing Sources */}
      {sources.length > 0 && (
        <div className="space-y-3">
          {sources.map((source, index) => (
            <div
              key={index}
              className="bg-gray-50 border border-gray-200 rounded-lg p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">
                      מקור
                    </label>
                    <p className="text-sm font-medium">{source.channel}</p>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">
                      נפח חודשי
                    </label>
                    <Input
                      type="number"
                      value={source.volumePerMonth?.toString() || ''}
                      onChange={(val) =>
                        handleUpdate(index, {
                          volumePerMonth: val ? parseInt(val) : undefined,
                        })
                      }
                      placeholder="0"
                      dir="rtl"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">
                      איכות (1-5)
                    </label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <button
                          key={rating}
                          onClick={() =>
                            handleUpdate(index, {
                              quality: rating as 1 | 2 | 3 | 4 | 5,
                            })
                          }
                          className={`px-2 py-1 text-xs rounded border transition-colors ${
                            source.quality === rating
                              ? 'border-blue-600 bg-blue-50 text-blue-700'
                              : 'border-gray-300 hover:border-gray-400'
                          }`}
                        >
                          {rating}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleRemove(index)}
                  className="text-red-500 hover:text-red-700 p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add New Source */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">
          הוסף מקור לידים
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Select
            label="מקור"
            value={newChannel}
            onChange={setNewChannel}
            options={channelOptions}
            placeholder="בחר מקור..."
            dir="rtl"
          />
          <Input
            label="נפח חודשי (אופציונלי)"
            type="number"
            value={newVolume}
            onChange={setNewVolume}
            placeholder="0"
            dir="rtl"
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              איכות (1-5)
            </label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  onClick={() => setNewQuality(rating)}
                  className={`px-2 py-1 text-xs rounded border transition-colors ${
                    newQuality === rating
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  {rating}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-3">
          <Button
            onClick={handleAdd}
            variant="primary"
            size="sm"
            disabled={!newChannel}
          >
            <Plus className="w-4 h-4 ml-2" />
            הוסף מקור
          </Button>
        </div>
      </div>
    </div>
  );
};
