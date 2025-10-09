# Fix Service Component: Document Generation Automation

## What You Need To Do

**Simple job:** Replace the simplified interface with the FULL TypeScript interface from the codebase.

## Service Details
- **Service ID:** `auto-document-generation`
- **Service Number:** #18
- **Service Name (Hebrew):** יצירת מסמכים אוטומטית
- **Category:** Automations → saves to `implementationSpec.automations`
- **Current Coverage:** ~10% (10 out of 90+ fields)
- **Target Coverage:** 95%+ (85+ fields)

## Files To Read

### 1. TypeScript Interface
**File:** `discovery-assistant/src/types/automationServices.ts`
**Line:** 3103
**Search for:** `export interface AutoDocumentGenerationRequirements`
**Action:** Read lines 3103-3300+ completely. Very complex interface with 90+ fields.

**Key sections:**
- `documentGenerationService` - Provider selection (Docmosis/PandaDoc/Google Docs/Carbone.io) with conditional configs
- `templateStorage` - Storage provider (Google Drive/Dropbox/S3/Azure Blob/Local) with conditional configs
- `dataSource` - Primary data source (CRM/ERP/Database/API) with conditional access configs
- `documentTypes` - Document type configurations array
- `deliveryOptions` - Delivery methods (email/CRM/storage/webhook)
- `n8nWorkflow` - n8n configuration
- `documentTracking` - Tracking and versioning

### 2. Current Component
**File:** `discovery-assistant/src/components/Phase2/ServiceRequirements/Automations/AutoDocumentGenerationSpec.tsx`
**Current problem:** Simplified implementation

### 3. Reference Example
**AutoMultiSystemSpec.tsx** (from previous prompts) - Shows conditional config patterns

## Tab Organization (7 tabs)

1. **שירות יצירת מסמכים** (`service`):
   - Provider selection (Docmosis/PandaDoc/Google Docs/Carbone.io/Custom)
   - Conditional config sections:
     - **Docmosis:** API key, endpoint, templates array
     - **PandaDoc:** API key, workspace ID, templates array (id, name, type)
     - **Google Docs:** Client ID, Client Secret, Refresh Token, template folder ID, templates array
     - **Carbone.io:** API key, self-hosted checkbox, endpoint

2. **אחסון תבניות** (`storage`):
   - Storage provider (Google Drive/Dropbox/S3/Azure Blob/Local)
   - Conditional configs:
     - **Google Drive:** Folder ID, service account key
     - **Dropbox:** Access token, folder path
     - **S3:** Bucket name, region, access key ID, secret access key
     - **Azure Blob:** Connection string, container name

3. **מקור נתונים** (`dataSource`):
   - Primary source (CRM/ERP/Database/API)
   - Conditional access configs:
     - **CRM Access:** System, auth method, credentials, data fields array
     - **ERP Access:** System (SAP/Oracle/NetSuite), API endpoint, credentials
     - **Database Access:** Type (PostgreSQL/MySQL/MongoDB), connection string, query
     - **API Access:** Endpoint, method, headers, auth

4. **סוגי מסמכים** (`documentTypes`):
   - Document types array:
     - Document type (contract/invoice/proposal/report/other)
     - Template ID
     - Output format (PDF/DOCX/HTML)
     - Auto-generate trigger
     - Filename pattern
   - Add/remove document types

5. **אפשרויות משלוח** (`delivery`):
   - Email delivery:
     - Enabled checkbox
     - Email provider (SendGrid/Mailgun/SMTP)
     - Credentials
     - Email template (subject, body)
   - CRM attachment:
     - Enabled checkbox
     - CRM system
     - Target module
     - Field name
   - Storage upload:
     - Enabled checkbox
     - Storage provider (same as template storage)
     - Folder path
   - Webhook notification:
     - Enabled checkbox
     - Webhook URL
     - Include document URL checkbox

6. **מעקב וגרסאות** (`tracking`):
   - Document tracking enabled checkbox
   - Version control enabled checkbox
   - Version numbering format
   - Metadata to store array (created_at, created_by, recipient, etc.)
   - Retention policy (days to keep documents)

7. **n8n Workflow** (`n8n`):
   - Instance URL
   - Webhook endpoint
   - HTTPS enabled
   - Error handling (retries, alert email, logging)

## Success Criteria

- [ ] All 90+ fields from interface implemented
- [ ] 7 tabs organizing fields logically
- [ ] Conditional configs for 4 document providers
- [ ] Conditional configs for 4 storage providers
- [ ] Conditional configs for 4 data sources
- [ ] Complex delivery options (email/CRM/storage/webhook)
- [ ] TypeScript compiles with 0 errors

**File to replace:** `discovery-assistant/src/components/Phase2/ServiceRequirements/Automations/AutoDocumentGenerationSpec.tsx`

**Expected size:** ~1,300-1,500 lines
