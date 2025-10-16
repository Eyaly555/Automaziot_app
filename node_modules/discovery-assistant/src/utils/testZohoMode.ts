/**
 * Test utility for Zoho integration without real credentials
 * Usage: Append ?testZoho=true to your URL to simulate Zoho mode
 */

export const isTestZohoMode = () => {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('testZoho') === 'true';
};

export const getTestZohoParams = () => {
  if (!isTestZohoMode()) return null;

  return {
    zohoRecordId: 'TEST-' + Date.now(),
    companyName: 'Test Company Ltd.',
    email: 'test@example.com',
    phone: '+972-50-1234567',
    budgetRange: '100,000 - 500,000 ₪',
    requestedServices: 'CRM Integration, Process Automation, AI Agents',
    additionalNotes: 'This is a test mode for Zoho integration',
  };
};

export const simulateZohoAuth = () => {
  // Generate a fake token for testing
  const fakeToken = 'test_token_' + Math.random().toString(36).substr(2, 9);
  console.log('🧪 Test Mode: Simulating Zoho authentication');
  console.log('🔑 Fake token generated:', fakeToken);
  return fakeToken;
};

export const testZohoSync = (data: any) => {
  console.log('🧪 Test Mode: Simulating sync to Zoho');
  console.log('📤 Data that would be sent:', data);
  return Promise.resolve({
    success: true,
    message: 'Test sync completed',
  });
};
