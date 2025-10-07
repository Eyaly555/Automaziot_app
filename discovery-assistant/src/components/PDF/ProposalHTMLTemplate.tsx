import React from 'react';
import { SelectedService, ProposalData } from '../../types/proposal';
import { COMPANY_BRANDING } from '../../config/companyBranding';

interface ProposalHTMLTemplateProps {
  clientName: string;
  clientCompany?: string;
  services: SelectedService[];
  proposalData: ProposalData;
}

/**
 * Professional HTML Template for PDF Generation
 * Uses browser's native BiDi algorithm for proper Hebrew/English/Numbers rendering
 */
export const ProposalHTMLTemplate = React.forwardRef<HTMLDivElement, ProposalHTMLTemplateProps>(
  ({ clientName, clientCompany, services, proposalData }, ref) => {
    const today = new Date();
    const validUntil = new Date(today);
    validUntil.setDate(validUntil.getDate() + COMPANY_BRANDING.proposalValidity);

    const formatPrice = (price: number): string => {
      return `₪${price.toLocaleString('he-IL')}`;
    };

    const formatHebrewDate = (date: Date): string => {
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    };

    return (
      <div ref={ref} style={{
        width: '210mm',
        minHeight: '297mm',
        margin: '0 auto',
        background: 'white',
        fontFamily: "'Rubik', sans-serif",
        color: '#000',
        direction: 'rtl',
      }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Rubik:wght@300;400;500;600;700&display=swap');

          * {
            box-sizing: border-box;
          }

          .pdf-page {
            width: 210mm;
            min-height: 297mm;
            padding: 20mm;
            page-break-after: always;
            position: relative;
            background: white;
          }

          .pdf-page:last-child {
            page-break-after: auto;
          }

          @media print {
            .pdf-page {
              page-break-after: always;
            }
            body {
              margin: 0;
              padding: 0;
            }
          }

          h1 { font-size: 28px; font-weight: 700; margin: 0; }
          h2 { font-size: 24px; font-weight: 700; margin: 0; }
          h3 { font-size: 18px; font-weight: 600; margin: 0; }
          p { font-size: 11px; margin: 0; line-height: 1.6; }
        `}</style>

        {/* PAGE 1: HEADER & EXECUTIVE SUMMARY */}
        <div className="pdf-page">
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15mm', paddingBottom: '8mm', borderBottom: `2px solid ${COMPANY_BRANDING.primaryColor}` }}>
            <div style={{ textAlign: 'right', flex: 1 }}>
              <h3 style={{ color: COMPANY_BRANDING.primaryColor, marginBottom: '8px' }}>
                {COMPANY_BRANDING.companyNameHe}
              </h3>
              <p style={{ fontSize: '10px', marginBottom: '4px' }}>{COMPANY_BRANDING.address}</p>
              <p style={{ fontSize: '10px', marginBottom: '4px' }}>טלפון: {COMPANY_BRANDING.phone}</p>
              <p style={{ fontSize: '10px' }}>אימייל: {COMPANY_BRANDING.email}</p>
            </div>
            {COMPANY_BRANDING.logoPath && (
              <img src={COMPANY_BRANDING.logoPath} alt="Logo" style={{ width: '40mm', height: 'auto' }} />
            )}
          </div>

          <h1 style={{ textAlign: 'center', color: COMPANY_BRANDING.primaryColor, marginBottom: '10px' }}>
            הצעת מחיר
          </h1>
          <p style={{ textAlign: 'center', color: '#666', fontSize: '12px', marginBottom: '25px' }}>
            פתרונות אוטומציה ובינה מלאכותית מותאמים אישית
          </p>

          {/* Client Box */}
          <div style={{ background: '#f8fafc', border: `2px solid ${COMPANY_BRANDING.primaryColor}`, borderRadius: '8px', padding: '15px 20px', margin: '20px 0' }}>
            <h3 style={{ color: COMPANY_BRANDING.secondaryColor, marginBottom: '8px' }}>
              הצעת מחיר ל: {clientName}
            </h3>
            {clientCompany && (
              <p style={{ marginBottom: '6px', fontSize: '12px' }}>חברה: {clientCompany}</p>
            )}
            <p style={{ marginBottom: '4px', fontSize: '11px' }}>תאריך: {formatHebrewDate(today)}</p>
            <p style={{ color: '#666', fontSize: '11px' }}>
              תוקף ההצעה: עד {formatHebrewDate(validUntil)} ({COMPANY_BRANDING.proposalValidity} ימים)
            </p>
          </div>

          <h2 style={{ color: COMPANY_BRANDING.secondaryColor, marginTop: '30px', marginBottom: '15px' }}>
            תקציר מנהלים
          </h2>
          <p style={{ fontSize: '11px', lineHeight: '1.8' }}>
            לאחר ניתוח מעמיק של תהליכי העבודה שלכם, זיהינו {proposalData.summary.totalServices} פתרונות
            אוטומציה ו-AI. ההשקעה הכוללת: {formatPrice(proposalData.totalPrice)}
            {proposalData.monthlySavings > 0 &&
              `, שיחסכו לכם ${formatPrice(proposalData.monthlySavings)} בחודש עם החזר השקעה תוך ${proposalData.expectedROIMonths} חודשים`}
            .
          </p>
        </div>

        {/* PAGE 2: SERVICES TABLE */}
        <div className="pdf-page">
          <h2 style={{ color: COMPANY_BRANDING.secondaryColor, marginBottom: '10px' }}>פירוט שירותים</h2>
          <p style={{ color: '#666', marginBottom: '20px' }}>להלן סיכום השירותים המוצעים</p>

          <table style={{ width: '100%', borderCollapse: 'collapse', margin: '20px 0' }}>
            <thead>
              <tr>
                <th style={{ background: COMPANY_BRANDING.primaryColor, color: 'white', padding: '12px', textAlign: 'center', fontWeight: '600', border: '1px solid #e5e7eb', width: '10%' }}>#</th>
                <th style={{ background: COMPANY_BRANDING.primaryColor, color: 'white', padding: '12px', textAlign: 'center', fontWeight: '600', border: '1px solid #e5e7eb', width: '45%' }}>שירות</th>
                <th style={{ background: COMPANY_BRANDING.primaryColor, color: 'white', padding: '12px', textAlign: 'center', fontWeight: '600', border: '1px solid #e5e7eb', width: '20%' }}>זמן יישום</th>
                <th style={{ background: COMPANY_BRANDING.primaryColor, color: 'white', padding: '12px', textAlign: 'center', fontWeight: '600', border: '1px solid #e5e7eb', width: '25%' }}>מחיר</th>
              </tr>
            </thead>
            <tbody>
              {services.map((service, index) => (
                <tr key={service.id} style={{ background: index % 2 === 1 ? '#f8fafc' : 'white' }}>
                  <td style={{ padding: '12px', border: '1px solid #e5e7eb', textAlign: 'center' }}>{index + 1}</td>
                  <td style={{ padding: '12px', border: '1px solid #e5e7eb', textAlign: 'right', paddingRight: '12px' }}>{service.nameHe}</td>
                  <td style={{ padding: '12px', border: '1px solid #e5e7eb', textAlign: 'center' }}>{service.customDuration || service.estimatedDays} ימים</td>
                  <td style={{ padding: '12px', border: '1px solid #e5e7eb', textAlign: 'center', fontWeight: '700', color: COMPANY_BRANDING.secondaryColor }}>
                    {formatPrice(service.customPrice || service.basePrice)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* PAGE 3: SERVICE DETAILS */}
        <div className="pdf-page">
          <h2 style={{ color: COMPANY_BRANDING.secondaryColor, marginBottom: '10px' }}>
            פירוט מלא של השירותים
          </h2>
          <p style={{ color: '#666', marginBottom: '20px' }}>כל שירות מותאם במיוחד לצרכים שזיהינו</p>

          {services.map((service, index) => (
            <div key={service.id} style={{ background: '#fafbfc', border: '1px solid #e5e7eb', borderRadius: '6px', padding: '20px', margin: '15px 0' }}>
              <div style={{ color: COMPANY_BRANDING.primaryColor, fontSize: '16px', fontWeight: '700', marginBottom: '12px', paddingBottom: '8px', borderBottom: `2px solid ${COMPANY_BRANDING.primaryColor}` }}>
                {index + 1}. {service.nameHe}
              </div>

              <div style={{ marginBottom: '12px' }}>
                <p style={{ fontWeight: '600', marginBottom: '5px' }}>💡 למה זה רלוונטי לך:</p>
                <p style={{ paddingRight: '15px' }}>{service.reasonSuggestedHe}</p>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <p style={{ fontWeight: '600', marginBottom: '5px' }}>📋 מה זה כולל:</p>
                <p style={{ paddingRight: '15px' }}>{service.descriptionHe}</p>
              </div>

              {service.notes && (
                <div style={{ marginBottom: '12px' }}>
                  <p style={{ color: '#666' }}>💬 הערה: {service.notes}</p>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '15px' }}>
                <p style={{ fontWeight: '700', color: COMPANY_BRANDING.secondaryColor }}>
                  💰 השקעה: {formatPrice(service.customPrice || service.basePrice)}
                </p>
                <p>⏱️ זמן יישום: {service.customDuration || service.estimatedDays} ימים</p>
              </div>
            </div>
          ))}
        </div>

        {/* PAGE 4: FINANCIAL SUMMARY & ROI */}
        <div className="pdf-page">
          <h1 style={{ textAlign: 'center', color: COMPANY_BRANDING.primaryColor, marginBottom: '10px' }}>
            סיכום כספי ו-ROI
          </h1>
          <p style={{ textAlign: 'center', color: '#666', marginBottom: '30px' }}>
            מבט על ההשקעה והתשואה
          </p>

          <div style={{ display: 'flex', justifyContent: 'space-around', background: '#f8fafc', border: `2px solid ${COMPANY_BRANDING.primaryColor}`, borderRadius: '8px', padding: '20px', margin: '20px 0', textAlign: 'center' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '10px', color: '#666', marginBottom: '5px' }}>מספר שירותים</div>
              <div style={{ fontSize: '22px', fontWeight: '700', color: COMPANY_BRANDING.primaryColor }}>{proposalData.summary.totalServices}</div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '10px', color: '#666', marginBottom: '5px' }}>זמן יישום</div>
              <div style={{ fontSize: '22px', fontWeight: '700', color: COMPANY_BRANDING.secondaryColor }}>{proposalData.totalDays} ימים</div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '10px', color: '#666', marginBottom: '5px' }}>השקעה כוללת</div>
              <div style={{ fontSize: '22px', fontWeight: '700', color: COMPANY_BRANDING.primaryColor }}>{formatPrice(proposalData.totalPrice)}</div>
            </div>
          </div>

          {proposalData.monthlySavings > 0 && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-around', margin: '20px 0' }}>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontWeight: '600', marginBottom: '5px' }}>💰 חיסכון חודשי</p>
                  <p style={{ fontSize: '18px', fontWeight: '700', color: '#10b981' }}>
                    {formatPrice(proposalData.monthlySavings)}
                  </p>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontWeight: '600', marginBottom: '5px' }}>📊 החזר השקעה</p>
                  <p style={{ fontSize: '18px', fontWeight: '700', color: '#10b981' }}>
                    {proposalData.expectedROIMonths} חודשים
                  </p>
                </div>
              </div>

              <div style={{ background: COMPANY_BRANDING.primaryColor, color: 'white', padding: '15px', borderRadius: '8px', textAlign: 'center', margin: '20px 0' }}>
                <p style={{ fontSize: '13px', fontWeight: '600', marginBottom: '8px' }}>
                  🎯 תשואה שנתית צפויה
                </p>
                <p style={{ fontSize: '26px', fontWeight: '700' }}>
                  {formatPrice(proposalData.monthlySavings * 12)}
                </p>
              </div>
            </>
          )}

          <h3 style={{ color: COMPANY_BRANDING.secondaryColor, marginTop: '30px', marginBottom: '15px' }}>
            💎 למה כדאי לך לעבוד איתנו?
          </h3>
          <ul style={{ paddingRight: '20px', lineHeight: '1.8' }}>
            <li>פתרון מותאם במדויק לצרכים שלך</li>
            {proposalData.monthlySavings > 0 && <li>ROI מוכח ומדיד</li>}
            <li>יישום מהיר - תוצאות תוך {proposalData.totalDays} ימים</li>
            <li>תמיכה מלאה לאורך כל הדרך</li>
            <li>טכנולוגיה מתקדמת של AI ואוטומציה</li>
          </ul>
        </div>

        {/* PAGE 5: TERMS & TIMELINE */}
        <div className="pdf-page">
          <h2 style={{ color: COMPANY_BRANDING.secondaryColor, marginBottom: '20px' }}>תנאים ולוח זמנים</h2>

          <h3 style={{ marginBottom: '10px' }}>💳 תנאי תשלום:</h3>
          <p style={{ paddingRight: '15px', marginBottom: '20px' }}>• {COMPANY_BRANDING.paymentTermsHe}</p>

          <h3 style={{ marginBottom: '10px' }}>⏱️ לוח זמנים משוער:</h3>
          <ul style={{ paddingRight: '30px', marginBottom: '20px', lineHeight: '1.8' }}>
            <li>משך הפרויקט: {Math.ceil(proposalData.totalDays / 5)} שבועות ({proposalData.totalDays} ימי עבודה)</li>
            <li>עדכוני סטטוס שבועיים</li>
            <li>מעקב צמוד ושקיפות מלאה</li>
          </ul>

          <h3 style={{ marginBottom: '10px' }}>📞 תמיכה:</h3>
          <ul style={{ paddingRight: '30px', marginBottom: '20px', lineHeight: '1.8' }}>
            <li>זמינה בשעות העבודה</li>
            <li>תגובה תוך 24 שעות</li>
          </ul>

          <h3 style={{ marginBottom: '10px' }}>📋 תנאים נוספים:</h3>
          <ul style={{ paddingRight: '30px', fontSize: '10px', color: '#666', lineHeight: '1.8' }}>
            <li>ההצעה תקפה ל-{COMPANY_BRANDING.proposalValidity} ימים מתאריך שליחה</li>
            <li>זכויות יוצרים על הקוד והפתרונות שפותחו שייכים ללקוח</li>
            <li>ביטול ההזמנה לאחר תחילת העבודה כרוך בחיוב יחסי</li>
          </ul>
        </div>

        {/* PAGE 6: NEXT STEPS & SIGNATURE */}
        <div className="pdf-page">
          <h1 style={{ textAlign: 'center', color: COMPANY_BRANDING.primaryColor, marginBottom: '20px' }}>
            🚀 השלב הבא
          </h1>

          <ol style={{ paddingRight: '30px', fontSize: '12px', lineHeight: '2' }}>
            <li>סקירת ההצעה ושאלות הבהרה</li>
            <li>תיאום פגישת קיק-אוף</li>
            <li>חתימה על הסכם</li>
            <li>תשלום מקדמה</li>
            <li>התחלת העבודה!</li>
          </ol>

          <div style={{ background: '#eef2ff', border: `2px solid ${COMPANY_BRANDING.primaryColor}`, borderRadius: '8px', padding: '20px', textAlign: 'center', margin: '30px 0 20px 0' }}>
            <h3 style={{ color: COMPANY_BRANDING.secondaryColor, marginBottom: '12px' }}>
              מוכנים להתחיל? בואו נדבר:
            </h3>
            <p style={{ fontSize: '13px', marginBottom: '5px' }}>📞 {COMPANY_BRANDING.phone}</p>
            <p style={{ fontSize: '13px', marginBottom: '5px' }}>📧 {COMPANY_BRANDING.email}</p>
            <p style={{ fontSize: '13px' }}>🌐 {COMPANY_BRANDING.website}</p>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '40px', paddingTop: '20px', borderTop: '1px solid #ccc' }}>
            <div style={{ textAlign: 'left' }}>
              <p style={{ fontSize: '11px', color: '#666' }}>{formatHebrewDate(today)}</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              {COMPANY_BRANDING.signaturePath && (
                <img
                  src={COMPANY_BRANDING.signaturePath}
                  alt="Signature"
                  style={{ width: '80px', marginBottom: '5px' }}
                />
              )}
              <p style={{ fontWeight: '600', marginBottom: '3px' }}>{COMPANY_BRANDING.signerName}</p>
              <p style={{ fontSize: '10px', color: '#666' }}>
                {COMPANY_BRANDING.signerTitle}, {COMPANY_BRANDING.companyNameHe}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

ProposalHTMLTemplate.displayName = 'ProposalHTMLTemplate';
