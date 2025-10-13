/**
 * Zoho API Service for Frontend
 * This service calls the backend API endpoints that handle Zoho authentication
 */

const API_BASE = '/api/zoho';

/**
 * Test Zoho connection
 */
export async function testZohoConnection(): Promise<{ success: boolean; organization?: any; message?: string }> {
  try {
    const response = await fetch(`${API_BASE}/test`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to test Zoho connection:', error);
    return { success: false, message: 'Failed to connect to Zoho' };
  }
}

/**
 * Get Discovery data from Zoho record
 */
export async function getDiscoveryFromZoho(recordId: string): Promise<{ success: boolean; discoveryData?: any; message?: string }> {
  try {
    const response = await fetch(`${API_BASE}/get-discovery?recordId=${recordId}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch discovery data: ${response.statusText}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to get discovery data from Zoho:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to fetch discovery data'
    };
  }
}

/**
 * Sync meeting data with Zoho CRM
 */
export async function syncMeetingWithZoho(meeting: any, recordId?: string): Promise<{ success: boolean; recordId?: string; message?: string }> {
  try {
    const response = await fetch(`${API_BASE}/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        meeting,
        recordId,
        module: meeting.zohoIntegration?.module || 'Potentials1'
      })
    });

    if (!response.ok) {
      throw new Error(`Sync failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to sync with Zoho:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to sync with Zoho'
    };
  }
}

/**
 * Get deal from Zoho
 */
export async function getZohoDeal(dealId: string): Promise<any> {
  try {
    const response = await fetch(`${API_BASE}/deals?dealId=${dealId}`);
    if (!response.ok) {
      throw new Error(`Failed to get deal: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Failed to get Zoho deal:', error);
    throw error;
  }
}

/**
 * Update deal in Zoho
 */
export async function updateZohoDeal(dealId: string, data: any): Promise<any> {
  try {
    const response = await fetch(`${API_BASE}/deals?dealId=${dealId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error(`Failed to update deal: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Failed to update Zoho deal:', error);
    throw error;
  }
}

/**
 * Create deal in Zoho
 */
export async function createZohoDeal(data: any): Promise<any> {
  try {
    const response = await fetch(`${API_BASE}/deals`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error(`Failed to create deal: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Failed to create Zoho deal:', error);
    throw error;
  }
}

/**
 * NEW: Get list of potentials (clients) from Zoho
 */
export async function getZohoPotentialsList(filters: any = {}): Promise<any> {
  try {
    const params = new URLSearchParams(filters);
    const response = await fetch(`${API_BASE}/potentials/list?${params}`);

    if (!response.ok) {
      throw new Error(`Failed to get potentials list: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Failed to get Zoho potentials list:', error);
    throw error;
  }
}

/**
 * NEW: Get full potential (client) data with meeting data
 */
export async function getZohoPotentialFull(recordId: string): Promise<any> {
  try {
    const response = await fetch(`${API_BASE}/potentials/${recordId}/full`);

    if (!response.ok) {
      throw new Error(`Failed to get potential full data: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Failed to get Zoho potential full data:', error);
    throw error;
  }
}

/**
 * NEW: Sync full meeting data to Zoho
 */
export async function syncFullMeetingToZoho(meeting: any, recordId?: string): Promise<any> {
  try {
    const response = await fetch(`${API_BASE}/potentials/sync-full`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        meeting,
        recordId,
        module: 'Potentials1'
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to sync full meeting: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Failed to sync full meeting to Zoho:', error);
    throw error;
  }
}

/**
 * NEW: Update phase in Zoho potential
 */
export async function updateZohoPotentialPhase(recordId: string, phase: string, status: string, notes?: string): Promise<any> {
  try {
    const response = await fetch(`${API_BASE}/potentials/${recordId}/phase`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ phase, status, notes })
    });

    if (!response.ok) {
      throw new Error(`Failed to update phase: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Failed to update Zoho potential phase:', error);
    throw error;
  }
}

/**
 * NEW: Search potentials by query
 */
export async function searchZohoPotentials(query: string): Promise<any> {
  try {
    const response = await fetch(`${API_BASE}/potentials/search?q=${encodeURIComponent(query)}`);

    if (!response.ok) {
      throw new Error(`Failed to search potentials: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Failed to search Zoho potentials:', error);
    throw error;
  }
}

/**
 * NEW: Create a note in Zoho CRM
 * Attaches a note to a specific record (e.g., Potential, Contact, Lead)
 * 
 * @param recordId - The parent record ID to attach the note to
 * @param title - Note title
 * @param content - Note content (supports plain text and HTML)
 * @param module - The module name (default: 'Potentials1')
 * @returns Promise with note creation result
 * 
 * @example
 * ```typescript
 * await createZohoNote(
 *   '4876876000000623001',
 *   'סיכום שיחת גילוי',
 *   'תוכן הסיכום...',
 *   'Potentials1'
 * );
 * ```
 */
export async function createZohoNote(
  recordId: string,
  title: string,
  content: string,
  module: string = 'Potentials1'
): Promise<any> {
  try {
    const response = await fetch(`${API_BASE}/notes/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        recordId,
        title,
        content,
        module
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to create note: ${response.statusText}`);
    }
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Failed to create Zoho note:', error);
    throw error;
  }
}