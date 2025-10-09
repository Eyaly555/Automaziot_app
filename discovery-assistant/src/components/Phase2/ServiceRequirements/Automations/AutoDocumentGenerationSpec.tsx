import React, { useState, useEffect } from 'react';
import { useMeetingStore } from '../../../../store/useMeetingStore';
import { Card } from '../../../Common/Card';

interface AutoDocumentGenerationConfig {
  documentType: 'proposal' | 'invoice' | 'contract' | 'report' | 'custom';
  templateFormat: 'pdf' | 'docx' | 'html' | 'excel';
  dataSource: 'crm' | 'form' | 'database' | 'api';
  signatureEnabled: boolean;
  automatedDelivery: boolean;
}

export function AutoDocumentGenerationSpec() {
  const { currentMeeting, updateMeeting } = useMeetingStore();
  const [config, setConfig] = useState<Partial<AutoDocumentGenerationConfig>>({
    documentType: 'proposal',
    templateFormat: 'pdf',
    dataSource: 'crm',
    signatureEnabled: false,
    automatedDelivery: true,
  });

  useEffect(() => {
    const automations = currentMeeting?.implementationSpec?.automations || [];
    const existing = automations.find(a => a.serviceId === 'auto-document-generation');
    if (existing?.requirements) {
      setConfig(existing.requirements);
    }
  }, [currentMeeting]);

  const handleSave = () => {
    if (!currentMeeting) return;

    // קריאת המערך הקיים
    const automations = currentMeeting?.implementationSpec?.automations || [];

    // הסרת רשומה קיימת (אם יש) למניעת כפילויות
    const updated = automations.filter(a => a.serviceId !== 'auto-document-generation');

    // הוספת רשומה חדשה/מעודכנת
    updated.push({
      serviceId: 'auto-document-generation',
      serviceName: 'יצירת מסמכים אוטומטית',
      requirements: config,
      completedAt: new Date().toISOString()
    });

    updateMeeting(currentMeeting.id, {
      implementationSpec: {
        ...currentMeeting.implementationSpec,
        automations: updated,
      },
    });
  };

  return (
    <div className="space-y-6" dir="rtl">
      <Card title="שירות #12: יצירת מסמכים אוטומטית">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">סוג מסמך</label>
              <select value={config.documentType} onChange={(e) => setConfig({ ...config, documentType: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md">
                <option value="proposal">הצעת מחיר</option>
                <option value="invoice">חשבונית</option>
                <option value="contract">חוזה</option>
                <option value="report">דוח</option>
                <option value="custom">מותאם אישית</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">פורמט</label>
              <select value={config.templateFormat} onChange={(e) => setConfig({ ...config, templateFormat: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md">
                <option value="pdf">PDF</option>
                <option value="docx">Word (DOCX)</option>
                <option value="html">HTML</option>
                <option value="excel">Excel</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">מקור נתונים</label>
            <select value={config.dataSource} onChange={(e) => setConfig({ ...config, dataSource: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md">
              <option value="crm">CRM</option>
              <option value="form">טופס</option>
              <option value="database">מסד נתונים</option>
              <option value="api">API</option>
            </select>
          </div>
          <div className="space-y-3">
            <label className="flex items-center">
              <input type="checkbox" checked={config.signatureEnabled}
                onChange={(e) => setConfig({ ...config, signatureEnabled: e.target.checked })} className="mr-2" />
              <span className="text-sm">חתימה דיגיטלית</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" checked={config.automatedDelivery}
                onChange={(e) => setConfig({ ...config, automatedDelivery: e.target.checked })} className="mr-2" />
              <span className="text-sm">משלוח אוטומטי</span>
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
