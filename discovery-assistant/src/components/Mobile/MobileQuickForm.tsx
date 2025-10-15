// discovery-assistant/src/components/Mobile/MobileQuickForm.tsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMeetingStore } from '../../store/useMeetingStore';
import { Button, Card } from '../Base';
import { AISection } from './components/AISection';
import { AutomationSection } from './components/AutomationSection';
import { CRMSection } from './components/CRMSection';
import { mobileToModules, validateMobileData } from '../../utils/mobileDataAdapter';
import { generateProposal } from '../../utils/proposalEngine';
import type { MobileFormData, MobileSectionType } from '../../types/mobile';

export const MobileQuickForm: React.FC = () => {
  const navigate = useNavigate();
  const { currentMeeting, updateModule } = useMeetingStore();
  
  const [formData, setFormData] = useState<MobileFormData>({
    ai_agents: {
      count: '1',
      channels: [],
      domains: []
    },
    automations: {
      processes: [],
      time_wasted: 'under_1h',
      biggest_pain: 'things_fall',
      most_important_process: ''
    },
    crm: {
      exists: 'no',
      data_quality: 'ok'
    }
  });

  const [currentSection, setCurrentSection] = useState<MobileSectionType>('ai');
  const [errors, setErrors] = useState<string[]>([]);

  // Redirect if no meeting
  React.useEffect(() => {
    if (!currentMeeting) {
      navigate('/clients');
    }
  }, [currentMeeting, navigate]);

  // Update section data
  const updateSection = <K extends keyof MobileFormData>(
    section: K,
    updates: Partial<MobileFormData[K]>
  ) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        ...updates
      }
    }));
    setErrors([]); // Clear errors on change
  };

  // Validate current section
  const validateCurrentSection = (): boolean => {
    const newErrors: string[] = [];
    
    if (currentSection === 'ai') {
      if (formData.ai_agents.channels.length === 0) {
        newErrors.push('חובה לבחור לפחות ערוץ אחד');
      }
      if (formData.ai_agents.domains.length === 0) {
        newErrors.push('חובה לבחור לפחות תחום אחד');
      }
    }
    
    if (currentSection === 'automation') {
      if (formData.automations.processes.length === 0) {
        newErrors.push('חובה לבחור לפחות תהליך אחד');
      }
    }
    
    setErrors(newErrors);
    return newErrors.length === 0;
  };

  // Navigation
  const handleNext = () => {
    if (!validateCurrentSection()) {
      return;
    }

    if (currentSection === 'ai') {
      setCurrentSection('automation');
    } else if (currentSection === 'automation') {
      setCurrentSection('crm');
    } else {
      handleSubmit();
    }
  };

  const handlePrevious = () => {
    if (currentSection === 'crm') {
      setCurrentSection('automation');
    } else if (currentSection === 'automation') {
      setCurrentSection('ai');
    }
  };

  // Submit
  const handleSubmit = async () => {
    if (!currentMeeting) {
      navigate('/clients');
      return;
    }

    try {
      // Validate
      const validation = validateMobileData(formData);
      if (!validation.isValid) {
        setErrors(validation.errors);
        return;
      }

      // Convert to full modules
      const fullModules = mobileToModules(formData);
      
      // Save all modules
      Object.entries(fullModules).forEach(([key, value]) => {
        updateModule(key as any, value);
      });
      
      // Generate proposal
      const proposalResult = generateProposal({
        ...currentMeeting,
        modules: fullModules
      });
      
      // Save proposal
      updateModule('proposal', proposalResult);
      
      // Navigate to proposal
      navigate('/module/proposal');
      
    } catch (error) {
      console.error('Error generating proposal:', error);
      setErrors(['אירעה שגיאה ביצירת ההצעה. נסה שוב.']);
    }
  };

  // Calculate progress
  const progress = currentSection === 'ai' ? 33 
    : currentSection === 'automation' ? 66 
    : 100;

  if (!currentMeeting) {
    return null;
  }

  return (
    <div className="mobile-quick-form min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <div className="mobile-header sticky top-0 z-10 bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-xl font-bold text-gray-900">שאלון מהיר</h1>
          
          {/* Progress Bar */}
          <div className="mobile-progress mt-3">
            <div 
              className="mobile-progress-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
          
          <p className="mobile-progress-text mt-2">
            חלק {currentSection === 'ai' ? '1' : currentSection === 'automation' ? '2' : '3'}/3
            {' - '}
            {currentSection === 'ai' && 'סוכני AI'}
            {currentSection === 'automation' && 'אוטומציות עסקיות'}
            {currentSection === 'crm' && 'CRM ואינטגרציות'}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-6 pb-24 max-w-2xl">
        <Card className="mobile-card">
          {currentSection === 'ai' && (
            <AISection
              data={formData.ai_agents}
              onChange={(updates) => updateSection('ai_agents', updates)}
            />
          )}

          {currentSection === 'automation' && (
            <AutomationSection
              data={formData.automations}
              onChange={(updates) => updateSection('automations', updates)}
            />
          )}

          {currentSection === 'crm' && (
            <CRMSection
              data={formData.crm}
              onChange={(updates) => updateSection('crm', updates)}
            />
          )}

          {/* Errors */}
          {errors.length > 0 && (
            <div className="mobile-validation-error mt-6">
              <p className="mobile-validation-error-text font-medium mb-2">
                ⚠️ יש למלא את השדות הבאים:
              </p>
              <ul className="mobile-validation-error-text list-disc list-inside">
                {errors.map((error, idx) => (
                  <li key={idx}>{error}</li>
                ))}
              </ul>
            </div>
          )}
        </Card>
      </div>

      {/* Navigation */}
      <div className="mobile-nav">
        <div className="mobile-nav-buttons">
          {currentSection !== 'ai' && (
            <Button
              onClick={handlePrevious}
              variant="outline"
              size="lg"
              className="mobile-nav-button mobile-nav-button-secondary"
            >
              ← הקודם
            </Button>
          )}
          
          <Button
            onClick={handleNext}
            variant="primary"
            size="lg"
            className="mobile-nav-button mobile-nav-button-primary"
          >
            {currentSection === 'crm' ? 'צור הצעת מחיר →' : 'הבא →'}
          </Button>
        </div>
      </div>
    </div>
  );
};

