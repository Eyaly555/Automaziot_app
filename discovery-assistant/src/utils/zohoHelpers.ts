/**
 * Zoho Integration Helper Functions
 * Provides consistent utilities for Zoho CRM integration
 */

import { Meeting } from '../types';

/**
 * Generate consistent localStorage key for Zoho record
 */
export const getZohoStorageKey = (recordId: string): string => {
  if (!recordId) throw new Error('Record ID is required');
  return `discovery_zoho_${recordId}`;
};

/**
 * Validate Zoho parameters from URL
 */
export const validateZohoParams = (params: any): boolean => {
  if (!params?.zohoRecordId) return false;

  // Validate record ID format (should be alphanumeric with possible dashes/underscores)
  const recordIdPattern = /^[a-zA-Z0-9_-]+$/;
  if (!recordIdPattern.test(params.zohoRecordId)) {
    console.error('Invalid Zoho record ID format');
    return false;
  }

  return true;
};

/**
 * Sanitize data before sending to Zoho
 * Removes sensitive or unnecessary fields
 */
export const sanitizeZohoData = (meeting: Meeting): any => {
  const sanitized = { ...meeting };

  // Remove sensitive fields
  delete sanitized.wizardState;

  // Remove any null or undefined values
  const clean = (obj: any): any => {
    Object.keys(obj).forEach(key => {
      if (obj[key] === null || obj[key] === undefined) {
        delete obj[key];
      } else if (typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
        clean(obj[key]);
      }
    });
    return obj;
  };

  return clean(sanitized);
};

/**
 * Format Zoho API errors into user-friendly messages
 */
export const formatZohoError = (error: any): string => {
  if (!error) return 'שגיאה לא ידועה';

  // Handle specific Zoho error codes
  if (error.code === 'INVALID_TOKEN') {
    return 'אסימון הגישה אינו תקף. נא להתחבר מחדש.';
  }
  if (error.code === 'NO_PERMISSION') {
    return 'אין הרשאה לבצע פעולה זו ב-Zoho CRM.';
  }
  if (error.code === 'INVALID_DATA') {
    return 'הנתונים שנשלחו אינם תקינים.';
  }
  if (error.code === 'MANDATORY_NOT_FOUND') {
    return 'חסרים שדות חובה לעדכון הרשומה.';
  }
  if (error.message?.includes('Network')) {
    return 'בעיית תקשורת. נא לבדוק את החיבור לאינטרנט.';
  }
  if (error.message?.includes('timeout')) {
    return 'הבקשה ארכה זמן רב מדי. נא לנסות שוב.';
  }

  // Default message
  return error.message || 'שגיאה בחיבור ל-Zoho CRM';
};

/**
 * Calculate sync priority based on data changes
 */
export const getSyncPriority = (meeting: Meeting): 'high' | 'medium' | 'low' => {
  if (!meeting.zohoIntegration?.lastSyncTime) {
    return 'high'; // Never synced
  }

  const lastSync = new Date(meeting.zohoIntegration.lastSyncTime);
  const timeSinceSync = Date.now() - lastSync.getTime();
  const hoursSinceSync = timeSinceSync / (1000 * 60 * 60);

  if (hoursSinceSync > 24) {
    return 'high'; // Not synced in over 24 hours
  }
  if (hoursSinceSync > 1) {
    return 'medium'; // Not synced in over an hour
  }

  return 'low'; // Recently synced
};

/**
 * Check if data has meaningful changes worth syncing
 */
export const hasSignificantChanges = (oldData: any, newData: any): boolean => {
  // Skip if no old data
  if (!oldData) return true;

  // Deep comparison excluding timestamp fields
  const normalize = (obj: any): any => {
    const normalized = { ...obj };
    delete normalized.updatedAt;
    delete normalized.lastSyncTime;
    delete normalized.createdAt;
    return JSON.stringify(normalized);
  };

  return normalize(oldData) !== normalize(newData);
};

/**
 * Build Zoho API URL
 */
export const buildZohoApiUrl = (module: string, recordId?: string, action?: string): string => {
  const baseUrl = import.meta.env.VITE_ZOHO_API_BASE || 'https://www.zohoapis.com/crm/v8';
  let url = `${baseUrl}/${module}`;

  if (recordId) {
    url += `/${recordId}`;
  }
  if (action) {
    url += `/${action}`;
  }

  return url;
};

/**
 * Parse Zoho field mapping configuration
 */
export const getFieldMapping = () => {
  return {
    // Meeting fields to Zoho fields
    clientName: 'Company_s_Name',
    email: 'Email',
    phone: 'Phone',
    budget: 'Budget_Range',
    services: 'Requested_Services',
    notes: 'Additional_Notes',
    progress: 'Discovery_Completion',
    lastUpdate: 'Discovery_Last_Update',
    data: 'Discovery_Progress'
  };
};

/**
 * Check if running in test mode
 */
export const isTestMode = (): boolean => {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('testZoho') === 'true';
};

/**
 * Get test mode indicator
 */
export const getTestModeIndicator = (): string => {
  return isTestMode() ? ' (מצב בדיקה)' : '';
};

/**
 * Validate Zoho OAuth scope
 */
export const validateScope = (scope: string, requiredScopes: string[]): boolean => {
  if (!scope) return false;

  const grantedScopes = scope.split(',').map(s => s.trim());
  return requiredScopes.every(required => grantedScopes.includes(required));
};

/**
 * Format meeting data for Zoho CRM
 */
export const formatForZoho = (meeting: Meeting): any => {
  const fieldMapping = getFieldMapping();
  const formattedData: any = {};

  // Calculate progress from phase and status (since Meeting doesn't have progress property)
  const calculateProgress = (): number => {
    const phaseProgress: Record<string, number> = {
      'discovery': 25,
      'implementation_spec': 50,
      'development': 75,
      'completed': 100
    };
    return phaseProgress[meeting.phase] || 0;
  };

  // Map basic fields
  // formattedData[fieldMapping.clientName] = meeting.clientName; // Removed as per user request
  formattedData[fieldMapping.progress] = `${calculateProgress()}%`;
  formattedData[fieldMapping.lastUpdate] = new Date().toISOString();

  // Add contact info if available
  // Removed as per user request to not update these fields
  // if (meeting.zohoIntegration?.contactInfo) {
  //   formattedData[fieldMapping.email] = meeting.zohoIntegration.contactInfo.email;
  //   formattedData[fieldMapping.phone] = meeting.zohoIntegration.contactInfo.phone;
  // }

  // Compress and store full meeting data
  formattedData[fieldMapping.data] = JSON.stringify(sanitizeZohoData(meeting));

  return formattedData;
};

/**
 * Calculate data size for Zoho field limits
 */
export const calculateDataSize = (data: any): number => {
  return JSON.stringify(data).length;
};

/**
 * Chunk large data for Zoho
 */
export const chunkData = (data: any, maxSize: number = 30000): any[] => {
  const stringified = JSON.stringify(data);

  if (stringified.length <= maxSize) {
    return [data];
  }

  // Split into chunks
  // This is a simplified version - in production, you'd want smarter chunking
  const chunks: any[] = [];
  const modules = Object.keys(data.modules || {});

  for (const module of modules) {
    chunks.push({
      ...data,
      modules: { [module]: data.modules[module] },
      _chunk: chunks.length + 1
    });
  }

  return chunks;
};