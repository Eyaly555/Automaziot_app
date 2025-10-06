/**
 * Test PDF Generation Script
 * Generates a sample proposal PDF to test Hebrew support
 */

import { generateProposalPDF } from '../src/utils/exportProposalPDF.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Sample data for testing
const testData = {
  clientName: 'ישראל ישראלי',
  clientCompany: 'חברת הטכנולוגיה בע"מ',
  services: [
    {
      id: 'service-1',
      category: 'automations',
      name: 'Lead Management Automation',
      nameHe: 'אוטומציה לניהול לידים',
      description: 'Automate lead capture and routing',
      descriptionHe: 'אוטומציה מלאה לקליטת לידים וניתוב אוטומטי למוכר הרלוונטי',
      basePrice: 15000,
      estimatedDays: 10,
      complexity: 'medium',
      tags: ['crm', 'automation'],
      reasonSuggested: 'Based on your current manual lead management',
      reasonSuggestedHe: 'מזהינו שאתם מנהלים לידים באופן ידני - זה יחסוך לכם 15 שעות שבועיות',
      relevanceScore: 9,
      dataSource: ['leadsAndSales'],
      selected: true,
    },
    {
      id: 'service-2',
      category: 'ai_agents',
      name: 'AI Customer Support Agent',
      nameHe: 'סוכן AI לתמיכה בלקוחות',
      description: 'AI agent for customer support',
      descriptionHe: 'סוכן AI שמטפל בפניות לקוחות באופן אוטומטי 24/7',
      basePrice: 25000,
      estimatedDays: 15,
      complexity: 'complex',
      tags: ['ai', 'support'],
      reasonSuggested: 'High volume of support tickets',
      reasonSuggestedHe: 'זיהינו נפח גבוה של פניות שירות - AI יפתור 70% מהן אוטומטיט',
      relevanceScore: 8,
      dataSource: ['customerService'],
      selected: true,
    },
    {
      id: 'service-3',
      category: 'integrations',
      name: 'Zoho-WhatsApp Integration',
      nameHe: 'אינטגרציה Zoho-WhatsApp',
      description: 'Connect Zoho CRM with WhatsApp Business',
      descriptionHe: 'חיבור אוטומטי בין Zoho CRM לוואטסאפ ביזנס עם סנכרון דו-כיווני',
      basePrice: 12000,
      estimatedDays: 7,
      complexity: 'medium',
      tags: ['integration', 'messaging'],
      reasonSuggested: 'You use both systems separately',
      reasonSuggestedHe: 'אתם משתמשים בשני המערכות בנפרד - נחבר אותם לתקשורת מהירה יותר',
      relevanceScore: 7,
      dataSource: ['systems'],
      selected: true,
      notes: 'כולל הדרכה והטמעה למשתמשים',
    },
  ],
  proposalData: {
    meetingId: 'test-meeting-123',
    generatedAt: new Date(),
    summary: {
      totalServices: 3,
      totalAutomations: 1,
      totalAIAgents: 1,
      totalIntegrations: 1,
      identifiedProcesses: 8,
      potentialMonthlySavings: 18000,
      potentialWeeklySavingsHours: 25,
    },
    proposedServices: [],
    selectedServices: [],
    totalPrice: 52000,
    totalDays: 32,
    expectedROIMonths: 3,
    monthlySavings: 18000,
    customNotes: 'הצעה מותאמת אישית על בסיס הניתוח המעמיק שערכנו',
  },
};

async function generateTestPDF() {
  console.log('🚀 Starting PDF generation test...');

  try {
    console.log('📄 Generating PDF with Hebrew content...');
    const pdfBlob = await generateProposalPDF(testData);

    console.log('✅ PDF generated successfully!');
    console.log(`📊 Size: ${(pdfBlob.size / 1024).toFixed(2)} KB`);

    // Convert Blob to Buffer (Node.js)
    const arrayBuffer = await pdfBlob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Save to file
    const outputPath = path.join(__dirname, '..', 'test-proposal-hebrew.pdf');
    fs.writeFileSync(outputPath, buffer);

    console.log(`💾 PDF saved to: ${outputPath}`);
    console.log('');
    console.log('🎉 SUCCESS! Open the PDF to verify Hebrew support.');
    console.log('✨ Check that:');
    console.log('   - Hebrew text displays correctly');
    console.log('   - Text flows right-to-left (RTL)');
    console.log('   - Tables are aligned properly');
    console.log('   - No garbled characters');

  } catch (error) {
    console.error('❌ Error generating PDF:', error);
    console.error(error.stack);
    process.exit(1);
  }
}

generateTestPDF();
