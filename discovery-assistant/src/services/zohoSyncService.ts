import { Meeting } from '../types';

interface ZohoConfig {
  apiBase: string;
  accessToken: string;
  module: string;
  discoveryField: string;
}

class ZohoSyncService {
  private config: ZohoConfig = {
    apiBase: import.meta.env.VITE_ZOHO_API_BASE || 'https://www.zohoapis.com/crm/v2',
    accessToken: import.meta.env.VITE_ZOHO_ACCESS_TOKEN || '',
    module: 'Potentials1',
    discoveryField: 'Discovery_Progress'
  };

  private compressData(meeting: Meeting): string {
    // Remove unnecessary fields for storage
    const compressed = {
      ...meeting,
      // Exclude large or redundant fields
      wizardState: undefined
    };
    return JSON.stringify(compressed);
  }

  private decompressData(data: string): Meeting | null {
    try {
      return JSON.parse(data);
    } catch (e) {
      console.error('Failed to parse Zoho data:', e);
      return null;
    }
  }

  async syncToZoho(meeting: Meeting, token: string): Promise<boolean> {
    if (!meeting.zohoIntegration?.recordId) {
      throw new Error('No Zoho record ID found');
    }

    const compressedData = this.compressData(meeting);

    // Check if data is too large (Zoho has field size limits)
    if (compressedData.length > 30000) {
      console.warn('Meeting data too large, truncating...');
      // Implement truncation strategy
    }

    const requestBody = {
      data: [{
        id: meeting.zohoIntegration.recordId,
        [this.config.discoveryField]: compressedData,
        Discovery_Last_Update: new Date().toISOString(),
        Discovery_Completion: `${this.calculateProgress(meeting)}%`
      }]
    };

    try {
      const apiUrl = `${this.config.apiBase}/${this.config.module}/${meeting.zohoIntegration.recordId}`;
      const response = await fetch(apiUrl, {
        method: 'PUT',
        headers: {
          'Authorization': `Zoho-oauthtoken ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (response.status === 401) {
        throw new Error('Authentication failed - needsRefresh');
      }

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Zoho API error: ${JSON.stringify(error)}`);
      }

      return true;
    } catch (error) {
      console.error('Sync to Zoho failed:', error);

      // Store failed sync for retry
      this.storeFailedSync(meeting);

      throw error;
    }
  }

  async loadFromZoho(recordId: string, token: string): Promise<Meeting | null> {
    try {
      const apiUrl = `${this.config.apiBase}/${this.config.module}/${recordId}?fields=${this.config.discoveryField}`;
      const response = await fetch(apiUrl, {
        headers: {
          'Authorization': `Zoho-oauthtoken ${token}`
        }
      });

      if (response.status === 401) {
        throw new Error('Authentication failed - needsRefresh');
      }

      if (!response.ok) {
        if (response.status === 404) {
          console.log('No Zoho record found');
          return null;
        }
        throw new Error(`Zoho API error: ${response.status}`);
      }

      const result = await response.json();
      const discoveryData = result.data?.[0]?.[this.config.discoveryField];

      if (!discoveryData) return null;

      return this.decompressData(discoveryData);
    } catch (error) {
      console.error('Load from Zoho failed:', error);
      return null;
    }
  }

  // Calculate meeting progress
  private calculateProgress(meeting: Meeting): number {
    const modules = ['overview', 'leadsAndSales', 'customerService', 'operations', 'reporting', 'aiAgents', 'systems', 'roi', 'planning'];
    let filledModules = 0;

    modules.forEach(moduleName => {
      const module = meeting.modules[moduleName as keyof Meeting['modules']];
      if (module && Object.keys(module).length > 0) {
        // Check if module has meaningful data
        const hasData = Object.values(module).some(value =>
          value !== undefined && value !== null && value !== '' &&
          !(Array.isArray(value) && value.length === 0)
        );
        if (hasData) filledModules++;
      }
    });

    return Math.round((filledModules / modules.length) * 100);
  }

  // Retry mechanism for failed syncs
  private storeFailedSync(meeting: Meeting) {
    const failedSyncs = JSON.parse(localStorage.getItem('zoho_failed_syncs') || '[]');
    failedSyncs.push({
      meeting,
      timestamp: new Date().toISOString(),
      retryCount: 0
    });
    localStorage.setItem('zoho_failed_syncs', JSON.stringify(failedSyncs));
  }

  async retryFailedSyncs(token: string) {
    const failedSyncs = JSON.parse(localStorage.getItem('zoho_failed_syncs') || '[]');
    const stillFailed = [];

    for (const sync of failedSyncs) {
      try {
        await this.syncToZoho(sync.meeting, token);
      } catch (e) {
        sync.retryCount++;
        if (sync.retryCount < 3) {
          stillFailed.push(sync);
        }
      }
    }

    localStorage.setItem('zoho_failed_syncs', JSON.stringify(stillFailed));
  }

  // Validate Zoho connection
  async validateConnection(): Promise<boolean> {
    try {
      const response = await fetch(
        `${this.config.apiBase}/users?type=CurrentUser`,
        {
          headers: {
            'Authorization': `Zoho-oauthtoken ${this.config.accessToken}`
          }
        }
      );
      return response.ok;
    } catch {
      return false;
    }
  }
}

export const zohoSyncService = new ZohoSyncService();