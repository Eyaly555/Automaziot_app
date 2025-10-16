import React, { useState } from 'react';
import { generateProposalPDF } from '../utils/exportProposalPDF';
import { downloadProposalPDF } from '../utils/downloadProposalPDF';
import { SelectedService, ProposalData } from '../types/proposal';

/**
 * PDF Test Page - Mirrors Production Exactly
 * Uses the same generateProposalPDF function as ProposalModule
 */
export const PDFTestPage: React.FC = () => {
  const [status, setStatus] = useState<
    'idle' | 'loading' | 'success' | 'error'
  >('idle');
  const [message, setMessage] = useState<string>('');

  // Sample test data - EXACT structure as production
  const testServices: SelectedService[] = [
    {
      id: '1',
      nameHe: 'אוטומציה של תהליכי מכירות',
      nameEn: 'Sales Process Automation',
      descriptionHe:
        'אוטומציה מלאה של תהליכי המכירות כולל ניהול לידים, מעקב הצעות מחיר, ואוטומציה של תהליכי אישור.',
      descriptionEn:
        'Full automation of sales processes including lead management, quote tracking, and approval workflow automation.',
      reasonSuggestedHe:
        'זיהינו שתהליך המכירות שלכם כולל עבודה ידנית רבה בהעתקת נתונים בין מערכות. אוטומציה תחסוך כ-15 שעות עבודה שבועיות.',
      reasonSuggestedEn:
        'We identified that your sales process involves significant manual work copying data between systems. Automation will save approximately 15 hours of work per week.',
      basePrice: 18000,
      estimatedDays: 14,
      category: 'automations',
      relevanceScore: 9,
      complexity: 'medium',
      name: 'Sales Process Automation',
      description: 'Full sales automation',
      reasonSuggested: 'Manual data entry in sales process',
      selected: true,
    },
    {
      id: '2',
      nameHe: 'אינטגרציה מלאה עם Zoho CRM',
      nameEn: 'Full Zoho CRM Integration',
      descriptionHe:
        'חיבור דו-כיווני בין כל המערכות שלכם ל-Zoho CRM, סנכרון אוטומטי של נתונים, ויצירת דשבורד ניהולי מתקדם.',
      descriptionEn:
        'Bi-directional connection between all your systems and Zoho CRM, automatic data synchronization, and advanced management dashboard creation.',
      reasonSuggestedHe:
        'אתם כבר משתמשים ב-Zoho CRM אבל המידע מפוצל בין מספר מערכות. אינטגרציה תיצור מקור אמת אחד ותשפר את שקיפות הנתונים.',
      reasonSuggestedEn:
        'You are already using Zoho CRM but information is scattered across multiple systems. Integration will create a single source of truth and improve data transparency.',
      basePrice: 12000,
      estimatedDays: 10,
      category: 'integrations',
      relevanceScore: 8,
      complexity: 'medium',
      name: 'Zoho CRM Integration',
      description: 'Full CRM integration',
      reasonSuggested: 'Data scattered across systems',
      selected: true,
    },
    {
      id: '3',
      nameHe: 'פיתוח AI Agent לשירות לקוחות',
      nameEn: 'Customer Service AI Agent Development',
      descriptionHe:
        'בניית סוכן AI חכם שמטפל בפניות לקוחות, עונה על שאלות נפוצות, ומעביר פניות מורכבות לנציגי שירות אנושיים.',
      descriptionEn:
        'Building a smart AI agent that handles customer inquiries, answers frequently asked questions, and routes complex issues to human service representatives.',
      reasonSuggestedHe:
        'נפח הפניות שלכם גדל ב-40% בשנה האחרונה. AI Agent יטפל ב-60-70% מהפניות הבסיסיות ויאפשר לצוות להתמקד בבעיות מורכבות.',
      reasonSuggestedEn:
        'Your inquiry volume has grown 40% in the past year. An AI Agent will handle 60-70% of basic inquiries and allow the team to focus on complex issues.',
      basePrice: 25000,
      estimatedDays: 21,
      category: 'ai_agents',
      relevanceScore: 9,
      complexity: 'complex',
      name: 'AI Customer Service Agent',
      description: 'Smart customer service AI',
      reasonSuggested: 'Growing support volume',
      notes: 'כולל 3 חודשי תמיכה והדרכה',
      selected: true,
    },
    {
      id: '4',
      nameHe: 'דשבורד BI ודוחות אוטומטיים',
      nameEn: 'BI Dashboard and Automated Reports',
      descriptionHe:
        'בניית דשבורד ניהולי מתקדם עם ויזואליזציות בזמן אמת ויצירה אוטומטית של דוחות שבועיים וחודשיים.',
      descriptionEn:
        'Building an advanced management dashboard with real-time visualizations and automatic generation of weekly and monthly reports.',
      reasonSuggestedHe:
        'כרגע אתם מייצרים דוחות באופן ידני מ-5 מקורות נתונים שונים. אוטומציה תחסוך 8 שעות בשבוע ותמנע טעויות אנוש.',
      reasonSuggestedEn:
        'Currently you generate reports manually from 5 different data sources. Automation will save 8 hours per week and prevent human errors.',
      basePrice: 16000,
      estimatedDays: 12,
      category: 'automations',
      relevanceScore: 7,
      complexity: 'medium',
      name: 'BI Dashboard',
      description: 'Business intelligence dashboard',
      reasonSuggested: 'Manual reporting process',
      selected: true,
    },
  ];

  // Calculate totals - EXACT same logic as production
  const totalPrice = testServices.reduce(
    (sum, s) => sum + (s.customPrice || s.basePrice),
    0
  );
  const totalDays = testServices.reduce(
    (sum, s) => sum + (s.customDuration || s.estimatedDays),
    0
  );

  const testProposalData: ProposalData = {
    meetingId: 'test-meeting-001',
    generatedAt: new Date(),
    summary: {
      totalServices: testServices.length,
      totalAutomations: 2,
      totalAIAgents: 1,
      totalIntegrations: 1,
      identifiedProcesses: 12,
      potentialMonthlySavings: 12000,
      potentialWeeklySavingsHours: 23,
    },
    proposedServices: testServices,
    selectedServices: testServices,
    totalPrice: totalPrice,
    totalDays: totalDays,
    monthlySavings: 12000,
    expectedROIMonths: Math.ceil(totalPrice / 12000),
  };

  const handleGeneratePDF = async () => {
    try {
      setStatus('loading');
      setMessage('⏳ פותח חלון הדפסה...');

      // Call EXACT same function as production
      await generateProposalPDF({
        clientName: 'דני כהן',
        clientCompany: 'חברת בדיקה בע"מ',
        services: testServices,
        proposalData: testProposalData,
      });

      setStatus('success');
      setMessage(
        '✅ חלון ההדפסה נפתח! בחר "Save as PDF" או "שמור כ-PDF" כדי לשמור את הקובץ'
      );
    } catch (error: any) {
      setStatus('error');
      setMessage(`❌ שגיאה: ${error.message}`);
      console.error('PDF generation error:', error);
    }
  };

  const handleDownloadPDF = async () => {
    try {
      setStatus('loading');
      setMessage('⏳ יוצר PDF להורדה...');

      await downloadProposalPDF({
        clientName: 'דני כהן',
        clientCompany: 'חברת בדיקה בע"מ',
        services: testServices,
        proposalData: testProposalData,
      });

      setStatus('success');
      setMessage('✅ PDF הורד בהצלחה!');
    } catch (error: any) {
      setStatus('error');
      setMessage(`❌ שגיאה: ${error.message}`);
      console.error('PDF download error:', error);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#f1f5f9',
        padding: '40px 20px',
      }}
    >
      <div
        style={{
          maxWidth: '900px',
          margin: '0 auto',
          padding: '40px',
          background: 'white',
          borderRadius: '16px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
        }}
      >
        <h1
          style={{
            textAlign: 'center',
            color: '#1e40af',
            marginBottom: '15px',
            fontSize: '36px',
          }}
        >
          📄 בדיקת יצירת PDF
        </h1>
        <p
          style={{
            textAlign: 'center',
            color: '#64748b',
            marginBottom: '40px',
            fontSize: '16px',
          }}
        >
          פונקציה זהה ל-100% לזו שבייצור - ProposalModule
        </p>

        {/* Info Box */}
        <div
          style={{
            background: '#eff6ff',
            border: '2px solid #3b82f6',
            borderRadius: '12px',
            padding: '25px',
            marginBottom: '30px',
          }}
        >
          <h3
            style={{ color: '#1e40af', marginBottom: '15px', fontSize: '20px' }}
          >
            ✨ מה כולל המסמך?
          </h3>
          <ul
            style={{
              color: '#1e40af',
              fontSize: '14px',
              lineHeight: '2',
              paddingRight: '25px',
            }}
          >
            <li>כותרות ומידע החברה בעברית</li>
            <li>4 שירותים לדוגמה עם תיאורים מפורטים</li>
            <li>טבלת שירותים מסודרת</li>
            <li>סיכום כספי ו-ROI</li>
            <li>תנאים ולוח זמנים</li>
            <li>6 עמודים מעוצבים מקצועית</li>
            <li>
              <strong>
                תמיכה מלאה ב-BiDi: עברית RTL + אנגלית LTR + מספרים נכון
              </strong>
            </li>
          </ul>
        </div>

        {/* Main Action Buttons */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '15px',
          }}
        >
          <button
            onClick={handleGeneratePDF}
            disabled={status === 'loading'}
            style={{
              padding: '20px',
              fontSize: '18px',
              fontWeight: 'bold',
              background:
                status === 'loading'
                  ? '#94a3b8'
                  : 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              cursor: status === 'loading' ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              transition: 'all 0.3s ease',
            }}
          >
            {status === 'loading' ? '⏳ פותח...' : '🖨️ פתח להדפסה'}
          </button>

          <button
            onClick={handleDownloadPDF}
            disabled={status === 'loading'}
            style={{
              padding: '20px',
              fontSize: '18px',
              fontWeight: 'bold',
              background:
                status === 'loading'
                  ? '#94a3b8'
                  : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              cursor: status === 'loading' ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              transition: 'all 0.3s ease',
            }}
          >
            {status === 'loading' ? '⏳ מוריד...' : '⬇️ הורד PDF ישירות'}
          </button>
        </div>

        {/* Instructions */}
        <div
          style={{
            marginTop: '30px',
            padding: '20px',
            background: '#fef3c7',
            borderRadius: '8px',
            border: '2px solid #fbbf24',
          }}
        >
          <h4
            style={{ color: '#92400e', marginBottom: '12px', fontSize: '16px' }}
          >
            📝 שתי אפשרויות:
          </h4>

          <div style={{ marginBottom: '15px' }}>
            <p
              style={{
                color: '#92400e',
                fontWeight: 'bold',
                fontSize: '14px',
                marginBottom: '8px',
              }}
            >
              🖨️ אפשרות 1: פתח להדפסה (מומלץ)
            </p>
            <ol
              style={{
                color: '#78350f',
                fontSize: '13px',
                lineHeight: '1.8',
                paddingRight: '25px',
                marginTop: '5px',
              }}
            >
              <li>לחץ על הכפתור "פתח להדפסה"</li>
              <li>ייפתח חלון חדש עם תצוגה מקדימה של המסמך</li>
              <li>החלון ייפתח אוטומטית את דיאלוג ההדפסה</li>
              <li>בחר "Save as PDF" או "שמור כ-PDF"</li>
              <li>בחר מיקום לשמירה ולחץ "שמור"</li>
            </ol>
          </div>

          <div>
            <p
              style={{
                color: '#92400e',
                fontWeight: 'bold',
                fontSize: '14px',
                marginBottom: '8px',
              }}
            >
              ⬇️ אפשרות 2: הורדה ישירה
            </p>
            <ol
              style={{
                color: '#78350f',
                fontSize: '13px',
                lineHeight: '1.8',
                paddingRight: '25px',
                marginTop: '5px',
              }}
            >
              <li>לחץ על הכפתור "הורד PDF ישירות"</li>
              <li>הקובץ ייוצר ויורד אוטומטית למחשב שלך</li>
              <li>לא נדרש דיאלוג הדפסה - הורדה ישירה לתיקיית ההורדות</li>
            </ol>
          </div>

          <div
            style={{
              marginTop: '15px',
              padding: '10px',
              background: '#fed7aa',
              borderRadius: '6px',
            }}
          >
            <p style={{ color: '#7c2d12', fontSize: '12px', margin: 0 }}>
              <strong>💡 טיפ:</strong> הדפדפן משתמש באלגוריתם BiDi מובנה - עברית
              תהיה RTL, אנגלית LTR, ומספרים יופיעו במקום הנכון
            </p>
          </div>
        </div>

        {/* Status Message */}
        {message && (
          <div
            style={{
              marginTop: '25px',
              padding: '20px',
              borderRadius: '8px',
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
              border: `2px solid ${status === 'success' ? '#10b981' : status === 'error' ? '#ef4444' : '#3b82f6'}`,
              fontSize: '15px',
              fontWeight: '600',
              textAlign: 'center',
            }}
          >
            {message}
          </div>
        )}

        {/* Test Data Info */}
        <div
          style={{
            marginTop: '30px',
            padding: '20px',
            background: '#f8fafc',
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
          }}
        >
          <h4
            style={{ color: '#334155', marginBottom: '12px', fontSize: '15px' }}
          >
            📊 נתוני הבדיקה:
          </h4>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '10px',
            }}
          >
            <div>
              <ul
                style={{
                  color: '#64748b',
                  fontSize: '13px',
                  lineHeight: '1.8',
                  paddingRight: '25px',
                }}
              >
                <li>{testServices.length} שירותים</li>
                <li>סה"כ: ₪{totalPrice.toLocaleString('he-IL')}</li>
                <li>זמן: {totalDays} ימים</li>
              </ul>
            </div>
            <div>
              <ul
                style={{
                  color: '#64748b',
                  fontSize: '13px',
                  lineHeight: '1.8',
                  paddingRight: '25px',
                }}
              >
                <li>
                  חיסכון: ₪
                  {testProposalData.monthlySavings.toLocaleString('he-IL')}/חודש
                </li>
                <li>ROI: {testProposalData.expectedROIMonths} חודשים</li>
                <li>תוכן BiDi מעורב ✓</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Technical Info */}
        <div
          style={{
            marginTop: '20px',
            padding: '15px',
            background: '#f0fdf4',
            borderRadius: '8px',
            border: '1px solid #86efac',
          }}
        >
          <h4
            style={{ color: '#166534', marginBottom: '10px', fontSize: '14px' }}
          >
            🔧 מידע טכני:
          </h4>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '15px',
            }}
          >
            <div>
              <p
                style={{
                  color: '#166534',
                  fontSize: '13px',
                  fontWeight: 'bold',
                  marginBottom: '8px',
                }}
              >
                🖨️ שיטת הדפסה:
              </p>
              <ul
                style={{
                  color: '#166534',
                  fontSize: '11px',
                  lineHeight: '1.6',
                  paddingRight: '20px',
                  margin: 0,
                }}
              >
                <li>
                  קובץ: <code>exportProposalPDF.ts</code>
                </li>
                <li>
                  פונקציה: <code>generateProposalPDF()</code>
                </li>
                <li>שיטה: Browser Print Dialog</li>
                <li>BiDi: Native browser rendering</li>
              </ul>
            </div>
            <div>
              <p
                style={{
                  color: '#166534',
                  fontSize: '13px',
                  fontWeight: 'bold',
                  marginBottom: '8px',
                }}
              >
                ⬇️ שיטת הורדה:
              </p>
              <ul
                style={{
                  color: '#166534',
                  fontSize: '11px',
                  lineHeight: '1.6',
                  paddingRight: '20px',
                  margin: 0,
                }}
              >
                <li>
                  קובץ: <code>downloadProposalPDF.ts</code>
                </li>
                <li>
                  פונקציה: <code>downloadProposalPDF()</code>
                </li>
                <li>ספריה: html2pdf.js</li>
                <li>BiDi: Native browser rendering</li>
              </ul>
            </div>
          </div>
          <p
            style={{
              color: '#166534',
              fontSize: '11px',
              marginTop: '10px',
              margin: 0,
            }}
          >
            <strong>פונט:</strong> Rubik (Google Fonts) |{' '}
            <strong>תמיכה:</strong> עברית מלאה + BiDi אוטומטי
          </p>
        </div>
      </div>
    </div>
  );
};
