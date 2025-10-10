import { useState, useEffect } from 'react';
import { useMeetingStore } from '../../../../store/useMeetingStore';
import { useSmartField } from '../../../../hooks/useSmartField';
import { useAutoSave } from '../../../../hooks/useAutoSave';
import { useBeforeUnload } from '../../../../hooks/useBeforeUnload';
import { CheckCircle, AlertCircle, Info } from 'lucide-react';
import type { TrainingOngoingRequirements } from '../../../../types/additionalServices';
import { Card } from '../../../Common/Card';

export function TrainingOngoingSpec() {
  const { currentMeeting, updateMeeting } = useMeetingStore();

  // Smart field hooks for data access and error handling
  const databaseType = useSmartField<string>({
    fieldId: 'database_type',
    localPath: 'databaseType',
    serviceId: 'training-ongoing',
    autoSave: false
  });

  const alertEmail = useSmartField<string>({
    fieldId: 'alert_email',
    localPath: 'alertEmail',
    serviceId: 'training-ongoing',
    autoSave: false
  });

  const [config, setConfig] = useState<TrainingOngoingRequirements>({
    training: {
      durationMonths: 6,
      hoursPerMonth: 4,
      trainingTopics: [],
      skillLevel: 'intermediate',
      deliveryMethod: 'remote',
      materialsProvided: true,
      assessmentIncluded: false
    },
    support: {
      supportLevel: 'standard',
      responseTime: '24h',
      supportChannels: ['email', 'chat'],
      escalationProcess: true
    },
    frequency: {
      trainingSessions: 'monthly',
      reviewMeetings: 'quarterly',
      progressReports: 'monthly'
    },
    deliverables: {
      trainingMaterials: true,
      progressReports: true,
      certificates: false,
      accessPortal: true
    }
  });

  // Auto-save hook for immediate and debounced saving
  const { saveData, isSaving, saveError } = useAutoSave({
    moduleId: 'training-ongoing',
    immediateFields: ['training', 'support', 'frequency'], // Critical configuration fields
    debounceMs: 1000,
    onError: (error) => {
      console.error('Auto-save error in TrainingOngoingSpec:', error);
    }
  });

  useBeforeUnload(() => {
    // Force save all data when leaving
    const completeConfig = {
      ...config,
      databaseType: databaseType.value,
      alertEmail: alertEmail.value
    };
    saveData(completeConfig);
  });

  // Load existing data
  useEffect(() => {
    const category = currentMeeting?.implementationSpec?.additionalServices || [];
    const existing = category.find((s: any) => s.serviceId === 'training-ongoing');
    if (existing?.requirements) {
      setConfig(existing.requirements as TrainingOngoingRequirements);
    }
  }, [currentMeeting]);

  // Save handler
  const handleSave = async () => {
    const completeConfig = {
      ...config,
      databaseType: databaseType.value,
      alertEmail: alertEmail.value
    };

    await saveData(completeConfig);
  };

  // Helper functions for managing arrays
  const addTrainingTopic = () => {
    setConfig({
      ...config,
      training: {
        ...config.training,
        trainingTopics: [
          ...config.training.trainingTopics,
          {
            topic: '',
            duration: 1,
            skillLevel: 'beginner'
          }
        ]
      }
    });
  };

  const removeTrainingTopic = (index: number) => {
    setConfig({
      ...config,
      training: {
        ...config.training,
        trainingTopics: config.training.trainingTopics.filter((_, i) => i !== index)
      }
    });
  };

  return (
    <div className="space-y-6" dir="rtl">
      <Card title="שירות #56: הדרכה מתמשכת">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4"><div><input type="number" className="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="חודשים" /></div><div><input type="number" className="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="שעות/חודש" /></div></div>
          <div className="flex justify-end pt-4 border-t">
            <button onClick={handleSave} className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">שמור הגדרות</button>
          </div>
        </div>
      </Card>
    </div>
  );
}
