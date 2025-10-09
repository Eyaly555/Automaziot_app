import React, { useState } from 'react';
import { useMeetingStore } from '../../store/useMeetingStore';
import { generateRequirementsDocumentation, validateServiceRequirements } from '../../utils/serviceRequirementsValidation';
import { Card } from '../Common/Card';
import { Button } from '../Base';
import { Download, Eye, EyeOff, FileText, CheckCircle, AlertCircle } from 'lucide-react';

/**
 * Developer Requirements Guide Component
 *
 * Displays comprehensive technical requirements for all purchased services
 * Helps developers understand exactly what data needs to be collected for each service
 */
export const DeveloperRequirementsGuide: React.FC = () => {
  const { currentMeeting } = useMeetingStore();
  const [showDetails, setShowDetails] = useState(false);

  const purchasedServices = currentMeeting?.modules?.proposal?.purchasedServices || [];
  const validation = validateServiceRequirements(
    purchasedServices,
    currentMeeting?.implementationSpec || {}
  );

  const documentation = generateRequirementsDocumentation(purchasedServices);

  const handleDownload = () => {
    const blob = new Blob([documentation], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `requirements-spec-${currentMeeting?.clientName || 'client'}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (purchasedServices.length === 0) {
    return (
      <Card title="אין שירותים שנרכשו" subtitle="לא ניתן ליצור מדריך דרישות">
        <div className="text-center py-8">
          <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">יש להשלים את שלב ההצעה לפני יצירת מדריך דרישות טכניות</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <Card title="מדריך דרישות טכניות למפתחים" subtitle="מפרט מלא של כל השדות לאיסוף עבור כל שירות">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">שירותים שנרכשו:</span>
              <span className="font-semibold text-lg text-blue-600">{purchasedServices.length}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">הושלמו:</span>
              <div className="flex items-center gap-1">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="font-semibold text-green-600">{validation.completedCount}</span>
              </div>
              <span className="text-sm text-gray-600">מתוך {validation.totalCount}</span>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowDetails(!showDetails)}
              icon={showDetails ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            >
              {showDetails ? 'הסתר פרטים' : 'הצג פרטים'}
            </Button>

            <Button
              variant="primary"
              onClick={handleDownload}
              icon={<Download className="w-4 h-4" />}
            >
              הורד מדריך (MD)
            </Button>
          </div>
        </div>

        {/* Completion Status */}
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">סטטוס השלמת דרישות</span>
            <span className={`text-sm font-semibold ${validation.isValid ? 'text-green-600' : 'text-orange-600'}`}>
              {validation.isValid ? '✓ הושלם' : `${validation.missingServices.length} חסרים`}
            </span>
          </div>

          {!validation.isValid && validation.missingServices.length > 0 && (
            <div className="mt-2">
              <div className="text-xs text-orange-700 mb-1">שירותים שטרם הושלמו:</div>
              <div className="flex flex-wrap gap-1">
                {validation.missingServices.map(service => (
                  <span key={service} className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded">
                    {service}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Requirements Preview */}
        {showDetails && (
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-3">תצוגה מקדימה של המדריך</h4>
            <div className="bg-white rounded border p-4 max-h-96 overflow-y-auto">
              <pre className="text-sm whitespace-pre-wrap font-mono text-gray-800">
                {documentation.substring(0, 2000)}
                {documentation.length > 2000 && '\n\n... (המשך בקובץ המלא)'}
              </pre>
            </div>
          </div>
        )}

        {/* Service-by-Service Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {purchasedServices.map(service => {
            const template = require('../../config/serviceRequirementsTemplates').getRequirementsTemplate(service.id);
            const isCompleted = validation.completedCount > 0 && !validation.missingServices.includes(service.nameHe || service.name);

            return (
              <Card
                key={service.id}
                title={service.nameHe || service.name}
                subtitle={`${template?.estimatedTimeMinutes || 0} דקות לאיסוף`}
                className={`border-2 ${isCompleted ? 'border-green-200 bg-green-50' : 'border-orange-200 bg-orange-50'}`}
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    {isCompleted ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-orange-600" />
                    )}
                    <span className={`text-sm font-medium ${isCompleted ? 'text-green-700' : 'text-orange-700'}`}>
                      {isCompleted ? 'הושלם' : 'ממתין לאיסוף'}
                    </span>
                  </div>

                  {template && (
                    <div className="text-xs text-gray-600">
                      <div>סעיפים: {template.sections.length}</div>
                      <div>שדות: {template.sections.reduce((acc, section) => acc + section.fields.length, 0)}</div>
                    </div>
                  )}

                  {template && template.tipsHe.length > 0 && (
                    <div className="text-xs text-blue-600">
                      <div className="font-medium mb-1">טיפים:</div>
                      <ul className="list-disc list-inside space-y-0.5">
                        {template.tipsHe.slice(0, 2).map((tip, index) => (
                          <li key={index}>{tip}</li>
                        ))}
                        {template.tipsHe.length > 2 && (
                          <li>...ועוד {template.tipsHe.length - 2} טיפים</li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>

        {/* Export Options */}
        <Card title="אפשרויות ייצוא" subtitle="ייצוא המדריך בפורמטים שונים למפתחים">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              variant="outline"
              onClick={handleDownload}
              icon={<Download className="w-4 h-4" />}
              className="w-full"
            >
              הורד כ-Markdown
            </Button>

            <Button
              variant="outline"
              onClick={() => {
                navigator.clipboard.writeText(documentation);
                alert('המדריך הועתק ללוח!');
              }}
              icon={<FileText className="w-4 h-4" />}
              className="w-full"
            >
              העתק ללוח
            </Button>

            <Button
              variant="outline"
              onClick={() => {
                const jsonData = {
                  services: purchasedServices,
                  validation,
                  generatedAt: new Date().toISOString()
                };
                const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `requirements-data-${currentMeeting?.clientName || 'client'}.json`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
              }}
              icon={<Download className="w-4 h-4" />}
              className="w-full"
            >
              ייצוא JSON
            </Button>
          </div>
        </Card>
      </Card>
    </div>
  );
};
