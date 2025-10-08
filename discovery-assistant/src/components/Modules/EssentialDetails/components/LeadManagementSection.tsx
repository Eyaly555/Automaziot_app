import React from 'react';
import { Card, Input, TextArea } from '../../../Base';
import { CheckboxGroup } from '../../../Common/FormFields';
import type { EssentialDetailsModule } from '../../../../types';

interface LeadManagementSectionProps {
  data?: EssentialDetailsModule['leadManagement'];
  onChange: (data: Partial<EssentialDetailsModule['leadManagement']>) => void;
}

const lossReasonOptions = [
  { value: 'no_response', label: 'לא ענו לליד בזמן' },
  { value: 'price', label: 'מחיר גבוה מדי' },
  { value: 'competition', label: 'בחרו במתחרה' },
  { value: 'not_relevant', label: 'הליד לא רלוונטי' },
  { value: 'timing', label: 'טיימינג לא מתאים' },
  { value: 'lost_in_system', label: 'אבד במערכת' }
];

export const LeadManagementSection: React.FC<LeadManagementSectionProps> = ({
  data = {},
  onChange
}) => {
  const updateField = <K extends keyof typeof data>(field: K, value: typeof data[K]) => {
    onChange({ [field]: value });
  };

  return (
    <Card className="border-l-4 border-l-green-500">
      <div className="space-y-4">
        <TextArea
          label="מה קורה היום כשליד חדש נכנס?"
          value={data.whatHappensWhenLeadArrives || ''}
          onChange={(val) => updateField('whatHappensWhenLeadArrives', val)}
          rows={3}
          placeholder="תאר בקצרה את התהליך - למשל: 'הליד נשלח לאימייל, מישהו צריך לראות אותו ולהתקשר...'"
          dir="rtl"
        />

        <Input
          label="מי אחראי על מעקב אחרי לידים חדשים?"
          value={data.whoResponsible || ''}
          onChange={(val) => updateField('whoResponsible', val)}
          placeholder="למשל: איש מכירות ראשי, צוות המכירות..."
          dir="rtl"
        />

        <Input
          label="כמה זמן עובר בממוצע עד יצירת קשר ראשון עם הליד?"
          value={data.timeToFirstContact || ''}
          onChange={(val) => updateField('timeToFirstContact', val)}
          placeholder="למשל: 2 שעות, יום אחד, אותו יום..."
          dir="rtl"
        />

        <TextArea
          label="איך עוקבים אחרי לידים? (באיזו מערכת/שיטה)"
          value={data.leadTrackingMethod || ''}
          onChange={(val) => updateField('leadTrackingMethod', val)}
          rows={2}
          placeholder="למשל: Excel, CRM, נייר, זיכרון..."
          dir="rtl"
        />

        <div>
          <CheckboxGroup
            label="מה הסיבות המרכזיות לאיבוד לידים?"
            options={lossReasonOptions}
            values={data.leadLossReasons || []}
            onChange={(val) => updateField('leadLossReasons', val)}
            columns={2}
          />
        </div>
      </div>
    </Card>
  );
};
