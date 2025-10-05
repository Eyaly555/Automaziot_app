import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { Button, Input, Select } from '../../../Base';
import type { ServiceChannel } from '../../../../types';

interface ServiceChannelBuilderProps {
  channels: ServiceChannel[];
  onChange: (channels: ServiceChannel[]) => void;
}

const channelTypeOptions = [
  { value: 'phone', label: 'טלפון' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'email', label: 'אימייל' },
  { value: 'chat', label: 'צ\'אט באתר' },
  { value: 'facebook', label: 'Facebook Messenger' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'sms', label: 'SMS' },
  { value: 'walk_in', label: 'פרונטלי' },
  { value: 'other', label: 'אחר' }
];

export const ServiceChannelBuilder: React.FC<ServiceChannelBuilderProps> = ({ channels, onChange }) => {
  const [newType, setNewType] = useState('');
  const [newVolume, setNewVolume] = useState('');
  const [newResponseTime, setNewResponseTime] = useState('');

  const handleAdd = () => {
    if (!newType) return;

    const newChannel: ServiceChannel = {
      type: newType,
      volumePerDay: newVolume ? parseInt(newVolume) : undefined,
      responseTime: newResponseTime || undefined
    };

    onChange([...channels, newChannel]);
    setNewType('');
    setNewVolume('');
    setNewResponseTime('');
  };

  const handleRemove = (index: number) => {
    onChange(channels.filter((_, i) => i !== index));
  };

  const handleUpdate = (index: number, updates: Partial<ServiceChannel>) => {
    const updated = channels.map((channel, i) =>
      i === index ? { ...channel, ...updates } : channel
    );
    onChange(updated);
  };

  return (
    <div className="space-y-4" dir="rtl">
      {/* Existing Channels */}
      {channels.length > 0 && (
        <div className="space-y-3">
          {channels.map((channel, index) => (
            <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">ערוץ</label>
                    <p className="text-sm font-medium">{channel.type}</p>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">נפח יומי</label>
                    <Input
                      type="number"
                      value={channel.volumePerDay?.toString() || ''}
                      onChange={(val) => handleUpdate(index, { volumePerDay: val ? parseInt(val) : undefined })}
                      placeholder="0"
                      dir="rtl"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">זמן תגובה</label>
                    <Input
                      value={channel.responseTime || ''}
                      onChange={(val) => handleUpdate(index, { responseTime: val })}
                      placeholder="לדוגמה: 5 דקות"
                      dir="rtl"
                    />
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

      {/* Add New Channel */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">הוסף ערוץ שירות</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Select
            label="סוג ערוץ"
            value={newType}
            onChange={setNewType}
            options={channelTypeOptions}
            placeholder="בחר ערוץ..."
            dir="rtl"
          />
          <Input
            label="נפח יומי (אופציונלי)"
            type="number"
            value={newVolume}
            onChange={setNewVolume}
            placeholder="0"
            dir="rtl"
          />
          <Input
            label="זמן תגובה (אופציונלי)"
            value={newResponseTime}
            onChange={setNewResponseTime}
            placeholder="לדוגמה: 5 דקות"
            dir="rtl"
          />
        </div>
        <div className="mt-3">
          <Button
            onClick={handleAdd}
            variant="primary"
            size="sm"
            disabled={!newType}
          >
            <Plus className="w-4 h-4 ml-2" />
            הוסף ערוץ
          </Button>
        </div>
      </div>
    </div>
  );
};
