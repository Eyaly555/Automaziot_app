import {
  TechnicalSpecification,
  SystemInventoryItem,
  IntegrationMapItem,
  AutomationOpportunity,
  N8NWorkflowTemplate,
  TechnicalRequirement,
  ImplementationPhase,
} from './technicalSpecGenerator';

export const exportAsMarkdown = (spec: TechnicalSpecification): string => {
  return `# מפרט טכני - ${spec.metadata.clientName}

**תאריך יצירה:** ${new Date(spec.metadata.dateGenerated).toLocaleDateString('he-IL')}
**תאריך פגישה:** ${new Date(spec.metadata.meetingDate).toLocaleDateString('he-IL')}
**נוצר על ידי:** ${spec.metadata.generatedBy}

---

## תקציר מנהלים

${spec.executiveSummary.overview}

### סטטיסטיקות
- **מספר מערכות:** ${spec.executiveSummary.systemCount}
- **מספר אינטגרציות:** ${spec.executiveSummary.integrationCount}
- **נקודות כאב קריטיות:** ${spec.executiveSummary.criticalIssuesCount}

---

## רשימת מערכות

${spec.systemInventory
  .map(
    (sys: SystemInventoryItem, idx: number) => `
### ${idx + 1}. ${sys.systemName}

**קטגוריה:** ${sys.category}
${sys.version ? `**גרסה:** ${sys.version}` : ''}
**גישת API:** ${sys.apiAccess}
${sys.recordCount ? `**כמות רשומות:** ${sys.recordCount.toLocaleString()}` : ''}
${sys.monthlyUsers ? `**משתמשים חודשיים:** ${sys.monthlyUsers}` : ''}
**דירוג שביעות רצון:** ${'⭐'.repeat(sys.satisfactionScore)} (${sys.satisfactionScore}/5)
**עדיפות להחלפה:** ${sys.migrationPriority === 'high' ? '🔴 גבוהה' : sys.migrationPriority === 'medium' ? '🟡 בינונית' : sys.migrationPriority === 'low' ? '🟢 נמוכה' : '⚫ אין'}

${
  sys.painPoints.length > 0
    ? `
**נקודות כאב:**
${sys.painPoints.map((p: string) => `- ${p}`).join('\n')}
`
    : ''
}

${
  sys.criticalFeatures.length > 0
    ? `
**תכונות קריטיות בשימוש:**
${sys.criticalFeatures.map((f: string) => `- ${f}`).join('\n')}
`
    : ''
}
`
  )
  .join('\n---\n')}

---

## מפת אינטגרציות

${spec.integrationMap.length === 0 ? '_אין אינטגרציות מוגדרות_' : ''}

${spec.integrationMap
  .map(
    (int: IntegrationMapItem, idx: number) => `
### ${idx + 1}. ${int.from} → ${int.to}

- **סוג אינטגרציה:** ${int.type}
- **תדירות:** ${int.frequency}
- **זרימת נתונים:** ${int.type}
- **קריטיות:** ${int.criticality === 'critical' ? '🔴 קריטי' : int.criticality === 'important' ? '🟡 חשוב' : '🟢 רצוי'}
- **מצב נוכחי:** ${int.status === 'working' ? '✅ עובד' : int.status === 'problematic' ? '⚠️ בעייתי' : '❌ חסר'}
${int.notes ? `- **הערות:** ${int.notes}` : ''}
`
  )
  .join('\n')}

---

## הזדמנויות אוטומציה

${spec.automationOpportunities
  .map(
    (opp: AutomationOpportunity, idx: number) => `
### ${idx + 1}. ${opp.title} (עדיפות ${opp.priority})

**תיאור:** ${opp.description}

**מערכות מושפעות:**
${opp.affectedSystems.map((s: string) => `- ${s}`).join('\n')}

**חיסכון זמן משוער:** ${opp.estimatedTimeSavings}
**מורכבות:** ${opp.complexity === 'low' ? '🟢 נמוכה' : opp.complexity === 'medium' ? '🟡 בינונית' : '🔴 גבוהה'}

**כלים מומלצים:** ${opp.suggestedTools.join(', ')}
`
  )
  .join('\n---\n')}

---

## תבניות Workflows ל-n8n

${spec.n8nWorkflows
  .map(
    (wf: N8NWorkflowTemplate, idx: number) => `
### ${idx + 1}. ${wf.name}

**תיאור:** ${wf.description}

**Trigger:** ${wf.trigger}

**צעדים:**
${wf.nodes.map((node: N8NWorkflowTemplate['nodes'][0], nodeIdx: number) => `${nodeIdx + 1}. **${node.type}** - ${node.action}${node.system ? ` (${node.system})` : ''}`).join('\n')}

**מורכבות:** ${wf.estimatedComplexity}
**זמן פיתוח משוער:** ${wf.estimatedHours} שעות

#### קוד n8n Template (JSON)

\`\`\`json
{
  "name": "${wf.name}",
  "nodes": [
    ${wf.nodes
      .map(
        (node: N8NWorkflowTemplate['nodes'][0], nodeIdx: number) => `{
      "parameters": {},
      "name": "${node.type} ${nodeIdx + 1}",
      "type": "${node.type}",
      "position": [${250 + nodeIdx * 200}, 300]
    }`
      )
      .join(',\n    ')}
  ],
  "connections": {}
}
\`\`\`

> 💡 **הערה:** ניתן לייבא template זה ישירות ל-n8n
`
  )
  .join('\n---\n')}

---

## דרישות טכניות למערכת

${spec.technicalRequirements
  .map(
    (req: TechnicalRequirement, idx: number) => `
### ${idx + 1}. ${req.system}

#### Authentication
${req.requirements.authentication.map((auth: string) => `- ${auth}`).join('\n')}

#### Permissions נדרשים
${req.requirements.permissions.map((perm: string) => `- ${perm}`).join('\n')}

#### API Endpoints עיקריים
${req.requirements.endpoints.map((ep: string) => `- \`${ep}\``).join('\n')}

${req.requirements.rateLimit ? `**Rate Limit:** ${req.requirements.rateLimit}` : ''}

${req.requirements.documentation ? `**תיעוד:** ${req.requirements.documentation}` : ''}
`
  )
  .join('\n---\n')}

---

## תכנית יישום

${spec.implementationPlan
  .map(
    (phase: ImplementationPhase) => `
### Phase ${phase.phase}: ${phase.name}

**משך זמן:** ${phase.duration}

${phase.dependencies.length > 0 ? `**תלויות:** ${phase.dependencies.join(', ')}` : '**תלויות:** אין'}

#### משימות
${phase.tasks.map((task: string) => `- [ ] ${task}`).join('\n')}

#### תוצרים (Deliverables)
${phase.deliverables.map((del: string) => `- ${del}`).join('\n')}
`
  )
  .join('\n---\n')}

---

## הערות חשובות למפתחים

### נקודות שימו לב
1. **Error Handling:** כל workflow חייב לכלול error handling מתאים
2. **Logging:** הוסיפו logging מפורט לכל שלב קריטי
3. **Testing:** בדקו כל workflow בסביבת development לפני העברה לפרודקשן
4. **Rate Limits:** שימו לב ל-rate limits של כל API
5. **Security:** אל תשמרו credentials ב-code - השתמשו ב-environment variables

### Best Practices
- השתמשו ב-retry logic לבקשות API
- הוסיפו timeout לכל בקשה
- שמרו logs במשך לפחות 30 יום
- הגדירו monitoring ו-alerts לכל workflow קריטי
- תעדו כל שינוי ב-workflows

---

## נספחים

### A. רשימת Credentials נדרשים
${spec.systemInventory.map((sys: SystemInventoryItem) => `- **${sys.systemName}:** API Key/OAuth credentials`).join('\n')}

### B. כלים מומלצים
- **n8n:** אוטומציה ו-workflows
- **Postman:** בדיקת API endpoints
- **Sentry/LogRocket:** error tracking
- **GitHub:** version control
- **Docker:** containerization (אופציונלי)

### C. קישורים שימושיים
- [n8n Documentation](https://docs.n8n.io/)
- [Automaziot.ai Knowledge Base](https://www.automaziot.ai)

---

**מסמך זה נוצר אוטומטית על ידי Automaziot Discovery Assistant**
**לשאלות ותמיכה: support@automaziot.ai**
`;
};

export const downloadMarkdown = (markdown: string, filename: string) => {
  const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const downloadJSON = (
  spec: TechnicalSpecification,
  filename: string
) => {
  const json = JSON.stringify(spec, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// ============================================================================
// PDF EXPORT FUNCTIONS
// ============================================================================

import jsPDF from 'jspdf';
import type { Meeting, PainPoint, SelectedService } from '../types';
import type { DetailedSystemSpec, IntegrationFlow } from '../types/phase2';
import type { DevelopmentTask } from '../types/phase3';

/**
 * Export Discovery phase to PDF
 */
export async function exportDiscoveryPDF(meeting: Meeting): Promise<void> {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 20;
  let y = margin;

  // Helper to add new page if needed
  const checkPageBreak = (needed: number) => {
    if (y + needed > pageHeight - margin) {
      pdf.addPage();
      y = margin;
      return true;
    }
    return false;
  };

  // Helper to add text with proper RTL support
  const addRTLText = (
    text: string,
    x: number,
    yPos: number,
    options?: Record<string, unknown>
  ) => {
    pdf.text(text, x, yPos, { align: 'right', ...options });
  };

  // Page 1: Cover
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(24);
  pdf.text('דוח גילוי עסקי', pageWidth / 2, 50, { align: 'center' });
  pdf.text('Discovery Report', pageWidth / 2, 60, { align: 'center' });

  pdf.setFontSize(18);
  pdf.text(meeting.clientName, pageWidth / 2, 80, { align: 'center' });

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(12);
  pdf.text(
    new Date(meeting.date).toLocaleDateString('he-IL'),
    pageWidth / 2,
    95,
    { align: 'center' }
  );
  pdf.text('Automaziot Discovery Assistant', pageWidth / 2, 110, {
    align: 'center',
  });

  // Page 2: Executive Summary
  pdf.addPage();
  y = margin;

  pdf.setFontSize(18);
  pdf.setFont('helvetica', 'bold');
  addRTLText('סיכום מנהלים', pageWidth - margin, y);
  y += 15;

  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');

  // Business info
  if (meeting.modules.overview) {
    const overview = meeting.modules.overview;
    addRTLText(
      `סוג עסק: ${overview.businessType || 'לא צוין'}`,
      pageWidth - margin,
      y
    );
    y += 7;
    addRTLText(
      `מספר עובדים: ${meeting.modules?.operations?.hr?.employeeCount || 'לא צוין'}`,
      pageWidth - margin,
      y
    );
    y += 7;
    if (overview.mainChallenge) {
      addRTLText(
        `אתגר מרכזי: ${overview.mainChallenge}`,
        pageWidth - margin,
        y
      );
      y += 7;
    }
  }

  y += 10;

  // Pain points summary
  const painPoints = meeting.painPoints || [];
  pdf.setFont('helvetica', 'bold');
  addRTLText('נקודות כאב מזוהות', pageWidth - margin, y);
  y += 10;

  pdf.setFont('helvetica', 'normal');
  addRTLText(`סה"כ נקודות כאב: ${painPoints.length}`, pageWidth - margin, y);
  y += 7;

  const criticalCount = painPoints.filter(
    (p: PainPoint) => p.severity === 'critical' || p.severity === 'high'
  ).length;
  addRTLText(`קריטי/גבוה: ${criticalCount}`, pageWidth - margin, y);
  y += 7;

  const totalSavings = painPoints.reduce(
    (sum: number, p: PainPoint) => sum + (p.potentialSaving || 0),
    0
  );
  if (totalSavings > 0) {
    addRTLText(
      `חיסכון חודשי פוטנציאלי: ₪${totalSavings.toLocaleString()}`,
      pageWidth - margin,
      y
    );
    y += 7;
  }

  y += 10;

  // Module completion
  pdf.setFont('helvetica', 'bold');
  addRTLText('התקדמות מודולים:', pageWidth - margin, y);
  y += 10;

  pdf.setFont('helvetica', 'normal');
  const moduleNames: Record<string, string> = {
    overview: 'סקירה כללית',
    leadsAndSales: 'לידים ומכירות',
    customerService: 'שירות לקוחות',
    operations: 'תפעול',
    reporting: 'דיווח',
    aiAgents: 'סוכני AI',
    systems: 'מערכות',
    roi: 'ROI',
    proposal: 'הצעת שירות',
  };

  Object.keys(meeting.modules).forEach((key: string) => {
    checkPageBreak(10);
    const name = moduleNames[key] || key;
    addRTLText(`${name}: השלמה`, pageWidth - margin, y);
    y += 7;
  });

  // Page 3: ROI Summary
  pdf.addPage();
  y = margin;

  pdf.setFontSize(18);
  pdf.setFont('helvetica', 'bold');
  addRTLText('ניתוח ROI', pageWidth - margin, y);
  y += 15;

  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');

  if (meeting.modules.roi) {
    const roi = meeting.modules.roi;

    if (roi.currentCosts) {
      addRTLText('עלויות נוכחיות:', pageWidth - margin, y);
      y += 10;
      addRTLText(
        `שעות ידניות בשבוע: ${roi.currentCosts.manualHours || 0}`,
        pageWidth - margin,
        y
      );
      y += 7;
      addRTLText(
        `עלות לשעה: ₪${roi.currentCosts.hourlyCost || 0}`,
        pageWidth - margin,
        y
      );
      y += 7;
      // Fix: Ensure arithmetic operations use numbers with explicit coercion
      const manualHours = Number(roi.currentCosts.manualHours) || 0;
      const hourlyCost = Number(roi.currentCosts.hourlyCost) || 0;
      const monthlyCost = manualHours * hourlyCost * 4.33;
      addRTLText(
        `עלות חודשית: ₪${Math.round(monthlyCost).toLocaleString()}`,
        pageWidth - margin,
        y
      );
      y += 15;
    }

    if (roi.timeSavings) {
      addRTLText('חיסכון צפוי:', pageWidth - margin, y);
      y += 10;
      addRTLText(
        `פוטנציאל אוטומציה: ${roi.timeSavings.automationPotential || 0}%`,
        pageWidth - margin,
        y
      );
      y += 15;
    }

    if (roi.investment) {
      addRTLText('השקעה:', pageWidth - margin, y);
      y += 10;
      addRTLText(
        `טווח השקעה: ${roi.investment.range || 'לא צוין'}`,
        pageWidth - margin,
        y
      );
      y += 7;
    }
  }

  // Page 4: Proposed Services
  if (meeting.modules.proposal?.selectedServices) {
    pdf.addPage();
    y = margin;

    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    addRTLText('שירותים מוצעים', pageWidth - margin, y);
    y += 15;

    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');

    meeting.modules.proposal.selectedServices.forEach(
      (service: SelectedService, index: number) => {
        checkPageBreak(25);

        pdf.setFont('helvetica', 'bold');
        addRTLText(`${index + 1}. ${service.name}`, pageWidth - margin, y);
        y += 8;

        pdf.setFont('helvetica', 'normal');
        addRTLText(`קטגוריה: ${service.category}`, pageWidth - margin, y);
        y += 7;

        if (service.basePrice || service.customPrice) {
          const price = service.customPrice ?? service.basePrice;
          addRTLText(`מחיר: ₪${price.toLocaleString()}`, pageWidth - margin, y);
          y += 7;
        }

        if (service.estimatedDays || service.customDuration) {
          const days = service.customDuration ?? service.estimatedDays;
          addRTLText(`ימי עבודה: ${days}`, pageWidth - margin, y);
          y += 7;
        }

        y += 5;
      }
    );
  }

  // Save PDF
  const timestamp = new Date().toISOString().split('T')[0];
  pdf.save(
    `Discovery_Report_${meeting.clientName.replace(/\s+/g, '_')}_${timestamp}.pdf`
  );
}

/**
 * Export Implementation Spec phase to PDF
 */
export async function exportImplementationSpecPDF(
  meeting: Meeting
): Promise<void> {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 20;
  let y = margin;

  // Helper to add new page if needed
  const checkPageBreak = (needed: number) => {
    if (y + needed > pageHeight - margin) {
      pdf.addPage();
      y = margin;
      return true;
    }
    return false;
  };

  // Cover page
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(24);
  pdf.text('Implementation Specification', pageWidth / 2, 50, {
    align: 'center',
  });
  pdf.text('מפרט יישום טכני', pageWidth / 2, 65, { align: 'center' });

  pdf.setFontSize(16);
  pdf.text(meeting.clientName, pageWidth / 2, 85, { align: 'center' });

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(12);
  pdf.text(
    new Date(meeting.date).toLocaleDateString('en-US'),
    pageWidth / 2,
    100,
    { align: 'center' }
  );

  if (!meeting.implementationSpec) {
    pdf.addPage();
    pdf.text('No implementation specification data available', margin, margin);
    const timestamp = new Date().toISOString().split('T')[0];
    pdf.save(
      `Implementation_Spec_${meeting.clientName.replace(/\s+/g, '_')}_${timestamp}.pdf`
    );
    return;
  }

  // Systems section
  if (
    meeting.implementationSpec.systems &&
    meeting.implementationSpec.systems.length > 0
  ) {
    pdf.addPage();
    y = margin;

    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Systems Overview', margin, y);
    y += 15;

    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');

    meeting.implementationSpec.systems.forEach(
      (system: DetailedSystemSpec, idx: number) => {
        checkPageBreak(30);

        pdf.setFont('helvetica', 'bold');
        pdf.text(`${idx + 1}. ${system.systemName}`, margin, y);
        y += 8;

        pdf.setFont('helvetica', 'normal');
        pdf.text(
          `Authentication: ${system.authentication?.method || 'N/A'}`,
          margin + 5,
          y
        );
        y += 6;

        if (system.authentication?.apiEndpoint) {
          pdf.text(
            `API Endpoint: ${system.authentication.apiEndpoint}`,
            margin + 5,
            y
          );
          y += 6;
        }

        pdf.text(`Modules: ${system.modules?.length || 0}`, margin + 5, y);
        y += 6;

        if (system.dataMigration?.required) {
          pdf.text(
            `Migration Required: Yes (${system.dataMigration.recordCount || 0} records)`,
            margin + 5,
            y
          );
          y += 6;
        }

        y += 5;
      }
    );
  }

  // Integrations section
  if (
    meeting.implementationSpec.integrations &&
    meeting.implementationSpec.integrations.length > 0
  ) {
    pdf.addPage();
    y = margin;

    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Integration Flows', margin, y);
    y += 15;

    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');

    meeting.implementationSpec.integrations.forEach(
      (flow: IntegrationFlow, idx: number) => {
        checkPageBreak(25);

        pdf.setFont('helvetica', 'bold');
        pdf.text(`${idx + 1}. ${flow.name}`, margin, y);
        y += 8;

        pdf.setFont('helvetica', 'normal');
        pdf.text(`${flow.sourceSystem} → ${flow.targetSystem}`, margin + 5, y);
        y += 6;

        pdf.text(`Trigger: ${flow.trigger?.type || 'N/A'}`, margin + 5, y);
        y += 6;

        pdf.text(`Frequency: ${flow.frequency || 'N/A'}`, margin + 5, y);
        y += 6;

        pdf.text(`Steps: ${flow.steps?.length || 0}`, margin + 5, y);
        y += 10;
      }
    );
  }

  // Save PDF
  const timestamp = new Date().toISOString().split('T')[0];
  pdf.save(
    `Implementation_Spec_${meeting.clientName.replace(/\s+/g, '_')}_${timestamp}.pdf`
  );
}

/**
 * Export Development phase to PDF
 */
export async function exportDevelopmentPDF(meeting: Meeting): Promise<void> {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 20;
  let y = margin;

  // Helper to add new page if needed
  const checkPageBreak = (needed: number) => {
    if (y + needed > pageHeight - margin) {
      pdf.addPage();
      y = margin;
      return true;
    }
    return false;
  };

  // Cover page
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(24);
  pdf.text('Development Progress Report', pageWidth / 2, 50, {
    align: 'center',
  });

  pdf.setFontSize(16);
  pdf.text(meeting.clientName, pageWidth / 2, 70, { align: 'center' });

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(12);
  pdf.text(new Date().toLocaleDateString('en-US'), pageWidth / 2, 85, {
    align: 'center',
  });

  if (!meeting.developmentTracking) {
    pdf.addPage();
    pdf.text('No development tracking data available', margin, margin);
    const timestamp = new Date().toISOString().split('T')[0];
    pdf.save(
      `Development_Report_${meeting.clientName.replace(/\s+/g, '_')}_${timestamp}.pdf`
    );
    return;
  }

  const tasks = meeting.developmentTracking.tasks || [];

  // Summary page
  pdf.addPage();
  y = margin;

  pdf.setFontSize(18);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Summary', margin, y);
  y += 15;

  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(
    (t: DevelopmentTask) => t.status === 'done'
  ).length;
  const inProgressTasks = tasks.filter(
    (t: DevelopmentTask) => t.status === 'in_progress'
  ).length;
  const blockedTasks = tasks.filter(
    (t: DevelopmentTask) => t.status === 'blocked'
  ).length;

  pdf.text(`Total Tasks: ${totalTasks}`, margin, y);
  y += 8;
  pdf.text(
    `Completed: ${completedTasks} (${Math.round((completedTasks / (totalTasks || 1)) * 100)}%)`,
    margin,
    y
  );
  y += 8;
  pdf.text(`In Progress: ${inProgressTasks}`, margin, y);
  y += 8;
  pdf.text(`Blocked: ${blockedTasks}`, margin, y);
  y += 15;

  const totalEstimated = tasks.reduce(
    (sum: number, t: DevelopmentTask) => sum + t.estimatedHours,
    0
  );
  const totalActual = tasks.reduce(
    (sum: number, t: DevelopmentTask) => sum + t.actualHours,
    0
  );

  pdf.text(`Total Estimated Hours: ${totalEstimated}h`, margin, y);
  y += 8;
  pdf.text(`Total Actual Hours: ${totalActual}h`, margin, y);
  y += 8;

  if (totalEstimated > 0) {
    const variance = totalActual - totalEstimated;
    const variancePercent = Math.round((variance / totalEstimated) * 100);
    pdf.text(`Variance: ${variance}h (${variancePercent}%)`, margin, y);
    y += 15;
  }

  // Tasks by status
  pdf.setFont('helvetica', 'bold');
  pdf.text('Tasks by Status', margin, y);
  y += 10;

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);

  const statusGroups = {
    Done: tasks.filter((t: DevelopmentTask) => t.status === 'done'),
    'In Progress': tasks.filter(
      (t: DevelopmentTask) => t.status === 'in_progress'
    ),
    'In Review': tasks.filter((t: DevelopmentTask) => t.status === 'in_review'),
    Blocked: tasks.filter((t: DevelopmentTask) => t.status === 'blocked'),
    Todo: tasks.filter((t: DevelopmentTask) => t.status === 'todo'),
  };

  Object.entries(statusGroups).forEach(
    ([status, statusTasks]: [string, DevelopmentTask[]]) => {
      if (statusTasks.length > 0) {
        checkPageBreak(15 + statusTasks.length * 6);

        pdf.setFont('helvetica', 'bold');
        pdf.text(`${status} (${statusTasks.length})`, margin, y);
        y += 8;

        pdf.setFont('helvetica', 'normal');
        statusTasks.slice(0, 10).forEach((task: DevelopmentTask) => {
          pdf.text(`- ${task.title}`, margin + 5, y, {
            maxWidth: pageWidth - margin * 2 - 5,
          });
          y += 6;
        });

        if (statusTasks.length > 10) {
          pdf.text(`... and ${statusTasks.length - 10} more`, margin + 5, y);
          y += 6;
        }

        y += 5;
      }
    }
  );

  // Save PDF
  const timestamp = new Date().toISOString().split('T')[0];
  pdf.save(
    `Development_Report_${meeting.clientName.replace(/\s+/g, '_')}_${timestamp}.pdf`
  );
}
