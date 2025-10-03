# Export Usage Guide

## Quick Start

The Discovery Assistant now includes comprehensive export functionality accessible from every dashboard. This guide shows you how to use each export format effectively.

---

## Accessing the Export Menu

### From Any Dashboard

Look for the **"ייצוא" (Export)** button in the top toolbar:

```
┌─────────────────────────────────────┐
│  📊 Dashboard        [ייצוא ▼]      │
└─────────────────────────────────────┘
```

Click the button to open the export menu dropdown.

---

## Export Formats by Phase

### Phase 1: Discovery (גילוי)

Available exports when in Discovery phase:

#### PDF Exports
- **דוח גילוי (Discovery Report)** - Professional Hebrew PDF report
  - Use for: Client presentations, management reviews
  - Includes: Pain points, ROI analysis, service recommendations
  - Format: Multi-page, RTL Hebrew text

#### Excel Exports
- **נתוני גילוי (Discovery Data)** - Multi-sheet workbook
  - Use for: Data analysis, financial planning, reporting
  - Sheets: Overview, Pain Points, ROI, Services, Systems
  - Format: .xlsx with formatted tables

#### JSON Exports (Expand submenu)
- **גיבוי מלא (Full Backup)** - Complete meeting data
  - Use for: Backup, data migration, API integration
  - Contains: All meeting data including custom fields

- **נתוני גילוי (Discovery Data)** - Discovery phase only
  - Use for: Sharing discovery results without other phases

- **מלאי מערכות (Systems Inventory)** - Systems catalog
  - Use for: IT planning, system review

- **ניתוח ROI (ROI Analysis)** - Financial analysis
  - Use for: Budget proposals, ROI presentations

- **נקודות כאב (Pain Points)** - Pain points summary
  - Use for: Prioritization, solution planning

#### Text Exports
- **Markdown** - Technical documentation format
  - Use for: Developer handoff, documentation systems

- **Text** - Plain text format
  - Use for: Email, simple sharing

- **העתק ללוח (Copy to Clipboard)** - Quick copy
  - Use for: Pasting into emails, chat apps

---

### Phase 2: Implementation Spec (מפרט יישום)

All Discovery exports PLUS:

#### PDF Exports
- **מפרט טכני (Technical Spec)** - English technical document
  - Use for: Developer handoff, implementation planning
  - Includes: System specs, integrations, AI agents
  - Format: Multi-page with technical details

#### Excel Exports
- **מפרט יישום (Implementation Spec)** - Technical workbook
  - Use for: Project planning, resource allocation
  - Sheets: Systems, Integrations, AI Agents, Overview
  - Format: .xlsx with detailed specifications

#### JSON Exports (Additional)
- **מפרט יישום (Implementation Spec)** - Phase 2 data
  - Use for: API integration, backup

- **תבניות n8n (n8n Workflows)** - Workflow templates
  - Use for: Importing into n8n automation platform
  - Format: n8n-compatible JSON

---

### Phase 3: Development (פיתוח)

All previous exports PLUS:

#### PDF Exports
- **דוח התקדמות (Progress Report)** - Development status report
  - Use for: Stakeholder updates, sprint reviews
  - Includes: Task statistics, completion rates, blockers
  - Format: Multi-page with metrics

#### Excel Exports
- **משימות פיתוח (Development Tasks)** - Task management workbook
  - Use for: Project tracking, resource planning
  - Sheets: Tasks, Sprints, Blockers, Tasks by System
  - Format: .xlsx with complete task data

#### CSV Exports
- **ייבוא ל-Jira (Jira Import)** - Jira-compatible format
  - Use for: Importing tasks into Jira
  - Format: CSV with Jira field mapping
  - Includes: Story points, priorities, status

- **ייבוא ל-GitHub (GitHub Import)** - GitHub Issues format
  - Use for: Creating GitHub issues in bulk
  - Format: CSV with markdown descriptions

- **משימות כלליות (Generic Tasks)** - Universal CSV
  - Use for: Excel, Google Sheets, other tools
  - Format: Standard CSV with all fields

- **סיכום ספרינטים (Sprint Summary)** - Sprint metrics
  - Use for: Sprint retrospectives, velocity tracking

- **חסמים (Blockers)** - Blocker tracking
  - Use for: Risk management, impediment log

#### JSON Exports (Additional)
- **פיתוח (Development)** - Phase 3 data
  - Use for: API integration, backup

- **משימות (Tasks)** - Task list with full details
  - Use for: Custom reporting, automation

---

## Export Workflows

### For Client Presentations

**Goal**: Create professional presentation materials

1. **Generate Discovery Report PDF**
   - Click "ייצוא" → PDF → "דוח גילוי"
   - Opens `Discovery_ClientName_2025-01-03.pdf`

2. **Export ROI Analysis to Excel**
   - Click "ייצוא" → Excel → "נתוני גילוי"
   - Open in Excel, go to "ROI Analysis" sheet
   - Create charts for visual presentation

3. **Copy Summary to Email**
   - Click "ייצוא" → טקסט → "העתק ללוח"
   - Paste into email body
   - Attach PDF and Excel files

### For Developer Handoff

**Goal**: Provide complete technical documentation

1. **Export Technical Spec PDF**
   - Navigate to Phase 2 dashboard
   - Click "ייצוא" → PDF → "מפרט טכני"

2. **Export Implementation Spec to Excel**
   - Click "ייצוא" → Excel → "מפרט יישום"
   - Share with technical team

3. **Export n8n Workflow Templates**
   - Click "ייצוא" → JSON → (expand) → "תבניות n8n"
   - Import into n8n platform

4. **Export Systems Inventory**
   - Click "ייצוא" → JSON → (expand) → "מלאי מערכות"
   - Share with DevOps/IT team

### For Project Management

**Goal**: Set up project tracking in Jira/GitHub

1. **Export Tasks to Jira CSV**
   - Navigate to Phase 3 dashboard
   - Click "ייצוא" → CSV → "ייבוא ל-Jira"
   - Import into Jira project

2. **OR Export to GitHub Issues**
   - Click "ייצוא" → CSV → "ייבוא ל-GitHub"
   - Use GitHub import tool

3. **Export Sprint Summary**
   - Click "ייצוא" → CSV → "סיכום ספרינטים"
   - Track in Excel/Google Sheets

4. **Monitor Blockers**
   - Click "ייצוא" → CSV → "חסמים"
   - Manage in spreadsheet or PM tool

### For Backup and Recovery

**Goal**: Regular data backups

1. **Full Meeting Backup**
   - Click "ייצוא" → JSON → (expand) → "גיבוי מלא"
   - Save to secure location
   - Name: `Backup_ClientName_YYYY-MM-DD.json`

2. **Weekly Backup Schedule**
   - End of each week: Export full backup
   - Store in: Cloud storage, version control, network drive
   - Keep: Last 4 weeks of backups

3. **Phase-Specific Backups**
   - After completing Discovery: Export "נתוני גילוי"
   - After completing Phase 2: Export "מפרט יישום"
   - After completing Phase 3: Export "פיתוח"

---

## File Naming Conventions

All exports follow consistent naming:

```
[Type]_[ClientName]_[Date].[extension]

Examples:
Discovery_Acme_Corp_2025-01-03.pdf
Implementation_Spec_Acme_Corp_2025-01-03.xlsx
Jira_Import_Acme_Corp_2025-01-03.csv
Meeting_Full_Acme_Corp_2025-01-03.json
```

This ensures:
- Easy identification
- Chronological sorting
- No name conflicts

---

## Tips and Best Practices

### Excel Exports
- **Freeze Top Row**: For easier navigation
- **Apply Filters**: To sort and filter data
- **Create Charts**: ROI and progress data visualize well
- **Format Numbers**: Currency and percentages

### PDF Exports
- **Print Settings**: Use "Fit to Page" for best results
- **Combine PDFs**: Use PDF merger to create comprehensive reports
- **Add Headers/Footers**: Add company branding in PDF editor

### CSV Exports
- **UTF-8 Encoding**: Ensure proper character display
- **Date Format**: Check date format matches your region
- **Test Import**: Always test import with sample data first

### JSON Exports
- **Validation**: Use online JSON validators
- **Version Control**: Track changes with git
- **Backup Rotation**: Keep multiple versions
- **Documentation**: Add notes about export purpose

---

## Troubleshooting

### Export Fails with Error

**Problem**: Alert shows "שגיאה בייצוא הקובץ"

**Solutions**:
1. Check browser console for detailed error
2. Ensure meeting has required data
3. Try different export format
4. Clear browser cache and retry
5. Update browser to latest version

### File Download Doesn't Start

**Problem**: No download prompt appears

**Solutions**:
1. Check browser download settings
2. Disable popup blockers
3. Try different browser
4. Check disk space

### Excel File Won't Open

**Problem**: Excel shows compatibility error

**Solutions**:
1. Update Microsoft Office/LibreOffice
2. Try opening in Google Sheets
3. Check file isn't corrupted (download again)

### Hebrew Text Shows as Squares

**Problem**: PDF shows □□□ instead of Hebrew

**Solutions**:
1. Install Hebrew fonts on system
2. Use Excel export instead (better Hebrew support)
3. Future update will include embedded fonts

### CSV Import Fails in Jira

**Problem**: Jira rejects CSV import

**Solutions**:
1. Check Jira import settings
2. Verify field mapping matches
3. Remove any custom fields Jira doesn't have
4. Test with single task first

---

## Keyboard Shortcuts

While the export menu is open:

- **Esc** - Close menu
- **Tab** - Navigate options
- **Enter** - Select highlighted option
- **Arrow Keys** - Navigate (future enhancement)

---

## Export Limits

Current technical limits:

| Format | Max Records | Max File Size | Generation Time |
|--------|-------------|---------------|-----------------|
| PDF | No limit | ~10 MB | 2-5 seconds |
| Excel | 65,000 rows/sheet | ~20 MB | 1-3 seconds |
| CSV | No limit | ~50 MB | 1-2 seconds |
| JSON | No limit | ~100 MB | < 1 second |

For very large datasets:
- Consider splitting into multiple files
- Use CSV format (most efficient)
- Export phase-specific data instead of full backup

---

## Security Considerations

### Sensitive Data
- Exports may contain sensitive client information
- Use secure channels for sharing (encrypted email, secure file transfer)
- Don't share JSON backups publicly

### Access Control
- Store exports in access-controlled locations
- Use password-protected archives for sensitive data
- Follow company data retention policies

### GDPR Compliance
- JSON exports may contain personal data
- Handle according to data protection regulations
- Document export activities for audit trail

---

## Integration Examples

### Jira Integration

```bash
# 1. Export tasks to Jira CSV
# Click: ייצוא → CSV → ייבוא ל-Jira

# 2. In Jira:
# - Go to Project → Import
# - Select CSV import
# - Upload file
# - Map fields:
#   - Summary → Summary
#   - Issue Type → Type
#   - Priority → Priority
#   - Description → Description
# - Review and import
```

### GitHub Integration

```bash
# 1. Export tasks to GitHub CSV
# Click: ייצוא → CSV → ייבוא ל-GitHub

# 2. Use GitHub CLI or web interface:
gh issue create --title "..." --body "..." --label "..."

# Or use GitHub's bulk import feature
```

### n8n Integration

```bash
# 1. Export n8n workflows
# Click: ייצוא → JSON → תבניות n8n

# 2. In n8n:
# - Go to Workflows
# - Click Import from File
# - Select exported JSON
# - Configure credentials
# - Activate workflow
```

---

## Support

For export-related issues:

1. Check this guide first
2. Review browser console for errors
3. Try different export format
4. Contact support with:
   - Export format attempted
   - Error message (if any)
   - Browser and version
   - Meeting ID (without sensitive data)

---

## Version History

**v1.0** (2025-01-03)
- Initial export implementation
- PDF, Excel, CSV, JSON formats
- Phase-aware export options
- Jira and GitHub integration

**Future Versions**
- v1.1: Word/PowerPoint exports
- v1.2: Cloud storage integration
- v1.3: Scheduled/automated exports
- v1.4: Custom export templates
