import { useState, useEffect } from 'react';
import { useMeetingStore } from '../../../../store/useMeetingStore';
import { Card } from '../../../Common/Card';

interface AutoDocumentMgmtConfig {
  storageProvider: 'google_drive' | 'onedrive' | 'dropbox' | 'box' | 's3';
  folderStructure: string;
  namingConvention: string;
  versionControl: boolean;
  accessControl: boolean;
  autoTagging: boolean;
}

export function AutoDocumentMgmtSpec() {
  const { currentMeeting, updateMeeting } = useMeetingStore();
  const [config, setConfig] = useState<Partial<AutoDocumentMgmtConfig>>({
    storageProvider: 'google_drive',
    folderStructure: '',
    namingConvention: '',
    versionControl: true,
    accessControl: true,
    autoTagging: false,
  });

  useEffect(() => {
    const automations = currentMeeting?.implementationSpec?.automations || [];
    const existing = automations.find(a => a.serviceId === 'auto-document-mgmt');
    if (existing?.requirements) {
      setConfig(existing.requirements);
    }
  }, [currentMeeting]);

  const handleSave = () => {
    if (!currentMeeting) return;

    // קריאת המערך הקיים
    const automations = currentMeeting?.implementationSpec?.automations || [];

    // הסרת רשומה קיימת (אם יש) למניעת כפילויות
    const updated = automations.filter(a => a.serviceId !== 'auto-document-mgmt');

    // הוספת רשומה חדשה/מעודכנת
    updated.push({
      serviceId: 'auto-document-mgmt',
      serviceName: 'ניהול מסמכים אוטומטי',
      requirements: config,
      completedAt: new Date().toISOString()
    });

    updateMeeting({
      implementationSpec: {
        ...currentMeeting.implementationSpec,
        automations: updated,
      },
    });
  };

  return (
    <div className="space-y-6" dir="rtl">
      <Card title="שירות #13: ניהול מסמכים אוטומטי">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">ספק אחסון</label>
            <select value={config.storageProvider} onChange={(e) => setConfig({ ...config, storageProvider: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md">
              <option value="google_drive">Google Drive</option>
              <option value="onedrive">OneDrive</option>
              <option value="dropbox">Dropbox</option>
              <option value="box">Box</option>
              <option value="s3">Amazon S3</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">מבנה תיקיות</label>
            <input type="text" value={config.folderStructure} onChange={(e) => setConfig({ ...config, folderStructure: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="לקוחות/שנה/חודש" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">מוסכמת שמות</label>
            <input type="text" value={config.namingConvention} onChange={(e) => setConfig({ ...config, namingConvention: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="ClientName_YYYYMMDD_Type" />
          </div>
          <div className="space-y-3">
            <label className="flex items-center">
              <input type="checkbox" checked={config.versionControl}
                onChange={(e) => setConfig({ ...config, versionControl: e.target.checked })} className="mr-2" />
              <span className="text-sm">ניהול גרסאות</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" checked={config.accessControl}
                onChange={(e) => setConfig({ ...config, accessControl: e.target.checked })} className="mr-2" />
              <span className="text-sm">בקרת גישה</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" checked={config.autoTagging}
                onChange={(e) => setConfig({ ...config, autoTagging: e.target.checked })} className="mr-2" />
              <span className="text-sm">תיוג אוטומטי</span>
            </label>
          </div>
          <div className="flex justify-end pt-4 border-t">
            <button onClick={handleSave} className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">שמור הגדרות</button>
          </div>
        </div>
      </Card>
    </div>
  );
}
