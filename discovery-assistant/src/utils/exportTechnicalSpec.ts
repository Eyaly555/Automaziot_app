import { TechnicalSpecification } from './technicalSpecGenerator';

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

${spec.systemInventory.map((sys, idx) => `
### ${idx + 1}. ${sys.systemName}

**קטגוריה:** ${sys.category}
${sys.version ? `**גרסה:** ${sys.version}` : ''}
**גישת API:** ${sys.apiAccess}
${sys.recordCount ? `**כמות רשומות:** ${sys.recordCount.toLocaleString()}` : ''}
${sys.monthlyUsers ? `**משתמשים חודשיים:** ${sys.monthlyUsers}` : ''}
**דירוג שביעות רצון:** ${'⭐'.repeat(sys.satisfactionScore)} (${sys.satisfactionScore}/5)
**עדיפות להחלפה:** ${sys.migrationPriority === 'high' ? '🔴 גבוהה' : sys.migrationPriority === 'medium' ? '🟡 בינונית' : sys.migrationPriority === 'low' ? '🟢 נמוכה' : '⚫ אין'}

${sys.painPoints.length > 0 ? `
**נקודות כאב:**
${sys.painPoints.map(p => `- ${p}`).join('\n')}
` : ''}

${sys.criticalFeatures.length > 0 ? `
**תכונות קריטיות בשימוש:**
${sys.criticalFeatures.map(f => `- ${f}`).join('\n')}
` : ''}
`).join('\n---\n')}

---

## מפת אינטגרציות

${spec.integrationMap.length === 0 ? '_אין אינטגרציות מוגדרות_' : ''}

${spec.integrationMap.map((int, idx) => `
### ${idx + 1}. ${int.from} → ${int.to}

- **סוג אינטגרציה:** ${int.type}
- **תדירות:** ${int.frequency}
- **זרימת נתונים:** ${int.type}
- **קריטיות:** ${int.criticality === 'critical' ? '🔴 קריטי' : int.criticality === 'important' ? '🟡 חשוב' : '🟢 רצוי'}
- **מצב נוכחי:** ${int.status === 'working' ? '✅ עובד' : int.status === 'problematic' ? '⚠️ בעייתי' : '❌ חסר'}
${int.notes ? `- **הערות:** ${int.notes}` : ''}
`).join('\n')}

---

## הזדמנויות אוטומציה

${spec.automationOpportunities.map((opp, idx) => `
### ${idx + 1}. ${opp.title} (עדיפות ${opp.priority})

**תיאור:** ${opp.description}

**מערכות מושפעות:**
${opp.affectedSystems.map(s => `- ${s}`).join('\n')}

**חיסכון זמן משוער:** ${opp.estimatedTimeSavings}
**מורכבות:** ${opp.complexity === 'low' ? '🟢 נמוכה' : opp.complexity === 'medium' ? '🟡 בינונית' : '🔴 גבוהה'}

**כלים מומלצים:** ${opp.suggestedTools.join(', ')}
`).join('\n---\n')}

---

## תבניות Workflows ל-n8n

${spec.n8nWorkflows.map((wf, idx) => `
### ${idx + 1}. ${wf.name}

**תיאור:** ${wf.description}

**Trigger:** ${wf.trigger}

**צעדים:**
${wf.nodes.map((node, nodeIdx) => `${nodeIdx + 1}. **${node.type}** - ${node.action}${node.system ? ` (${node.system})` : ''}`).join('\n')}

**מורכבות:** ${wf.estimatedComplexity}
**זמן פיתוח משוער:** ${wf.estimatedHours} שעות

#### קוד n8n Template (JSON)

\`\`\`json
{
  "name": "${wf.name}",
  "nodes": [
    ${wf.nodes.map((node, nodeIdx) => `{
      "parameters": {},
      "name": "${node.type} ${nodeIdx + 1}",
      "type": "${node.type}",
      "position": [${250 + nodeIdx * 200}, 300]
    }`).join(',\n    ')}
  ],
  "connections": {}
}
\`\`\`

> 💡 **הערה:** ניתן לייבא template זה ישירות ל-n8n
`).join('\n---\n')}

---

## דרישות טכניות למערכת

${spec.technicalRequirements.map((req, idx) => `
### ${idx + 1}. ${req.system}

#### Authentication
${req.requirements.authentication.map(auth => `- ${auth}`).join('\n')}

#### Permissions נדרשים
${req.requirements.permissions.map(perm => `- ${perm}`).join('\n')}

#### API Endpoints עיקריים
${req.requirements.endpoints.map(ep => `- \`${ep}\``).join('\n')}

${req.requirements.rateLimit ? `**Rate Limit:** ${req.requirements.rateLimit}` : ''}

${req.requirements.documentation ? `**תיעוד:** ${req.requirements.documentation}` : ''}
`).join('\n---\n')}

---

## תכנית יישום

${spec.implementationPlan.map(phase => `
### Phase ${phase.phase}: ${phase.name}

**משך זמן:** ${phase.duration}

${phase.dependencies.length > 0 ? `**תלויות:** ${phase.dependencies.join(', ')}` : '**תלויות:** אין'}

#### משימות
${phase.tasks.map(task => `- [ ] ${task}`).join('\n')}

#### תוצרים (Deliverables)
${phase.deliverables.map(del => `- ${del}`).join('\n')}
`).join('\n---\n')}

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
${spec.systemInventory.map(sys => `- **${sys.systemName}:** API Key/OAuth credentials`).join('\n')}

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

export const downloadJSON = (spec: TechnicalSpecification, filename: string) => {
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