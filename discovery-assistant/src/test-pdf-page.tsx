import React, { useState } from 'react';
import { generateProposalPDF } from './utils/exportProposalPDF';
import { SelectedService, ProposalData } from './types/proposal';

export const TestPDFPage: React.FC = () => {
  const [status, setStatus] = useState<
    'idle' | 'loading' | 'success' | 'error'
  >('idle');
  const [message, setMessage] = useState<string>('');

  const handleTest = async () => {
    try {
      setStatus('loading');
      setMessage('יוצר PDF...');

      // Test data
      const services: SelectedService[] = [
        {
          id: '1',
          nameHe: 'אוטומציה של תהליכים',
          nameEn: 'Process Automation',
          descriptionHe: 'אוטומציה מלאה של תהליכי העבודה',
          descriptionEn: 'Full automation of work processes',
          reasonSuggestedHe: 'חיסכון בזמן ובעלויות',
          reasonSuggestedEn: 'Save time and costs',
          basePrice: 15000,
          estimatedDays: 14,
        },
        {
          id: '2',
          nameHe: 'אינטגרציה עם Zoho',
          nameEn: 'Zoho Integration',
          descriptionHe: 'חיבור מלא למערכת Zoho CRM',
          descriptionEn: 'Full integration with Zoho CRM',
          reasonSuggestedHe: 'ניהול לקוחות יעיל יותר',
          reasonSuggestedEn: 'More efficient customer management',
          basePrice: 8000,
          estimatedDays: 7,
        },
        {
          id: '3',
          nameHe: 'פיתוח AI Agent',
          nameEn: 'AI Agent Development',
          descriptionHe: 'סוכן AI חכם לשירות לקוחות',
          descriptionEn: 'Smart AI agent for customer service',
          reasonSuggestedHe: 'שיפור שירות הלקוחות',
          reasonSuggestedEn: 'Improve customer service',
          basePrice: 12000,
          estimatedDays: 10,
        },
      ];

      const proposalData: ProposalData = {
        totalPrice: 35000,
        totalDays: 31,
        monthlySavings: 8000,
        expectedROIMonths: 5,
        summary: {
          totalServices: 3,
        },
      };

      const pdfBlob = await generateProposalPDF({
        clientName: 'דני כהן',
        clientCompany: 'חברת בדיקה בע"מ',
        services,
        proposalData,
      });

      // Download the PDF
      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'test-hebrew-proposal.pdf';
      a.click();
      URL.revokeObjectURL(url);

      setStatus('success');
      setMessage('✅ PDF נוצר בהצלחה והורד!');
    } catch (error: any) {
      setStatus('error');
      setMessage(`❌ שגיאה: ${error.message}`);
      console.error('PDF generation error:', error);
    }
  };

  return (
    <div
      style={{
        maxWidth: '600px',
        margin: '50px auto',
        padding: '30px',
        background: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      }}
    >
      <h1 style={{ textAlign: 'center', color: '#2563eb' }}>
        🔬 בדיקת יצירת PDF עברי
      </h1>

      <p>בדיקה זו תיצור PDF עם:</p>
      <ul>
        <li>✅ פונט Rubik שתומך בעברית</li>
        <li>✅ RTL עם setR2L(true)</li>
        <li>✅ 3 שירותים לדוגמה</li>
        <li>✅ טבלאות ותוכן מלא</li>
      </ul>

      <button
        onClick={handleTest}
        disabled={status === 'loading'}
        style={{
          width: '100%',
          padding: '12px 24px',
          fontSize: '16px',
          fontWeight: 'bold',
          background: status === 'loading' ? '#94a3b8' : '#3b82f6',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: status === 'loading' ? 'not-allowed' : 'pointer',
        }}
      >
        {status === 'loading' ? '⏳ טוען...' : '�� הרץ בדיקה'}
      </button>

      {message && (
        <div
          style={{
            marginTop: '20px',
            padding: '15px',
            borderRadius: '6px',
            background:
              status === 'success'
                ? '#d1fae5'
                : status === 'error'
                  ? '#fee2e2'
                  : '#dbeafe',
            color:
              status === 'success'
                ? '#065f46'
                : status === 'error'
                  ? '#991b1b'
                  : '#1e40af',
            border: `1px solid ${status === 'success' ? '#10b981' : status === 'error' ? '#ef4444' : '#3b82f6'}`,
          }}
        >
          {message}
        </div>
      )}
    </div>
  );
};
