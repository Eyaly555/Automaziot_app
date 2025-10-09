# Master Implementation Prompt - Discovery Assistant Services

**Purpose**: Use this prompt template in a new chat session to implement any of the 59 services.

---

## How to Use This Prompt

1. **Copy the entire prompt below** (starting from "IMPLEMENTATION REQUEST")
2. **Modify the variables** in the `[CUSTOMIZE THESE]` section
3. **Paste into a new Claude Code chat**
4. **Start implementation**

---

## IMPLEMENTATION REQUEST

### [CUSTOMIZE THESE - CHANGE FOR EACH SERVICE]

**Service to Implement**: `[SERVICE_ID]` - `[SERVICE_NAME_HEBREW]` ([SERVICE_NAME_ENGLISH])

**Category**: `[CATEGORY]` (Automations / AI Agents / Integrations / System Implementations / Additional Services)

**Research File**: `discovery-assistant/[RESEARCH_FILE_NAME].md`

**Service Number**: `[NUMBER]` (1-59)

---

### Context: Discovery Assistant Codebase

I'm working on the **Discovery Assistant** application - a bilingual (Hebrew/English) React + TypeScript app for automating customer discovery and implementation tracking.

**Project Location**: `C:\Users\eyaly\Desktop\Businesses\eym-group_n8n\internal_app\discovery-assistant`

**Tech Stack**:
- React 19.1.1 + TypeScript 5.8.3
- Vite 7.1.7
- Zustand (state management)
- React Router v7
- Tailwind CSS + shadcn/ui
- Supabase (auth + data)
- Zoho CRM integration

**Key Files to Know**:
- `src/types/index.ts` - Type definitions
- `src/config/servicesDatabase.ts` - All 59 services definitions
- `src/config/wizardSteps.ts` - Wizard configuration
- `src/store/useMeetingStore.ts` - Zustand store
- `CLAUDE.md` - Complete project documentation

**Production URL**: https://automaziot-app.vercel.app/

---

### Your Task

I need you to implement **Service #[NUMBER]: [SERVICE_NAME]** based on the comprehensive technical requirements research that was completed.

**Research Reference**: Read the technical requirements from `discovery-assistant/[RESEARCH_FILE_NAME].md` - specifically the section for service #[NUMBER].

---

### Implementation Requirements

#### 1. **Review the Research** (MANDATORY FIRST STEP)
- Read `discovery-assistant/[RESEARCH_FILE_NAME].md`
- Find service #[NUMBER] in the document
- Review all sections:
  - מה השירות עושה (What the service does)
  - דרישות טכניות (Technical requirements)
  - מערכות שצריך גישה אליהן (Required systems)
  - אינטגרציות נדרשות (Required integrations)
  - Prerequisites (מה צריך להיות מוכן מראש)
  - הערות חשובות (Important notes)

#### 2. **Verify Service Definition**
- Check `src/config/servicesDatabase.ts`
- Confirm the service exists with ID: `[SERVICE_ID]`
- Review the service metadata (name, category, description, pricing)

#### 3. **Create Implementation Specification**

Based on the research, create a detailed implementation spec that includes:

**A. Type Definitions** (`src/types/serviceRequirements.ts` or new file):
- Create TypeScript interface for this service's configuration
- Include all required fields from research (API keys, credentials, settings)
- Add validation types

**B. Configuration Template** (`src/config/serviceTemplates/[SERVICE_ID].ts`):
- Create a template with all required configuration fields
- Include default values where appropriate
- Add field descriptions and validation rules

**C. Requirements Component** (`src/components/Phase2/ServiceRequirements/[ServiceName]Requirements.tsx`):
- Build a form component for gathering service requirements
- Include all fields from the research (API credentials, system access, prerequisites)
- Add validation and helper text
- Support Hebrew/English bilingual labels

**D. Integration Logic** (if applicable):
- API client setup (`src/services/[serviceName]API.ts`)
- Authentication handling
- Rate limiting implementation
- Error handling and retry logic

**E. Documentation**:
- Add implementation notes to the service in `servicesDatabase.ts`
- Create a quick start guide in `discovery-assistant/docs/services/[SERVICE_ID].md`

#### 4. **Implement Features**

Based on the research requirements:

- [ ] Create TypeScript types for service configuration
- [ ] Build configuration template with all required fields
- [ ] Create requirements gathering component (React form)
- [ ] Implement validation logic
- [ ] Add integration with existing Phase 2 workflows
- [ ] Create API client (if service requires external API)
- [ ] Implement authentication (OAuth 2.0, API Keys, etc.)
- [ ] Add rate limiting protection
- [ ] Create error handling and retry logic
- [ ] Add logging and monitoring hooks
- [ ] Write unit tests for validation logic
- [ ] Test integration with Phase 2 ImplementationSpecDashboard

#### 5. **Testing Checklist**

- [ ] TypeScript compiles without errors (`npm run build:typecheck`)
- [ ] All validation rules work correctly
- [ ] Form submits and saves to store
- [ ] Data persists in localStorage
- [ ] Component renders in Hebrew/English
- [ ] Integration with ImplementationSpecDashboard works
- [ ] Error messages are clear and helpful
- [ ] Required fields are properly marked
- [ ] Helper text explains each field clearly

#### 6. **Documentation**

Create documentation that includes:

- **Setup Guide**: How to configure this service
- **Prerequisites Checklist**: What the client needs before implementation
- **API Documentation**: If applicable, how to obtain credentials
- **Common Issues**: Troubleshooting guide based on research notes
- **Testing Instructions**: How to test in sandbox/staging

---

### Special Considerations

**From the Research (Service #[NUMBER])**:

[COPY-PASTE THE KEY POINTS FROM THE RESEARCH HERE]

**Important Notes**:
- [List any critical gotchas from "הערות חשובות" section]
- [Include rate limits if applicable]
- [Include authentication requirements]
- [Include any GDPR/compliance notes]

---

### Deliverables

When you're done, I should have:

1. ✅ **Type definitions** for this service configuration
2. ✅ **Configuration template** with all required fields from research
3. ✅ **Requirements component** (React form) for Phase 2
4. ✅ **Validation logic** for all fields
5. ✅ **API client** (if needed) with auth, rate limiting, error handling
6. ✅ **Integration** with existing Phase 2 workflows
7. ✅ **Tests** for validation and integration
8. ✅ **Documentation** (setup guide, prerequisites, troubleshooting)

---

### Questions to Ask Me

Before you start implementation, please ask me:

1. **Scope Confirmation**: Should I implement the full service with API integration, or just the requirements gathering form for Phase 2?
2. **Priority Features**: Are there specific features from the research that are higher priority?
3. **External Dependencies**: Do we have access to the required systems mentioned in the research (API keys, sandbox environments)?
4. **Timeline**: Is this for immediate use or future planning?

---

### Success Criteria

The implementation is complete when:

- ✅ All technical requirements from the research are captured in the configuration
- ✅ The requirements form is user-friendly and bilingual
- ✅ Validation prevents invalid configurations
- ✅ The service integrates seamlessly with Phase 2 workflows
- ✅ Documentation is clear and complete
- ✅ All tests pass
- ✅ The implementation follows Discovery Assistant code patterns and conventions

---

## Example: How to Use This Template

**For Service #1 (auto-lead-response)**:

```markdown
### [CUSTOMIZE THESE]

**Service to Implement**: `auto-lead-response` - תגובה אוטומטית ללידים (Automatic Lead Response)

**Category**: Automations

**Research File**: `discovery-assistant/AUTOMATIONS_TECHNICAL_REQUIREMENTS.md`

**Service Number**: 1

[... rest of prompt stays the same ...]

**From the Research (Service #1)**:

Key Technical Requirements:
- Webhook endpoint או Form API key
- Email service credentials (SendGrid/Mailgun/SMTP)
- CRM API credentials (Zoho CRM OAuth Token)
- n8n instance with HTTPS endpoint
- Rate limits: SendGrid - 100 emails/day (free), Mailgun - 5,000/month

Important Notes:
- זמן תגובה קריטי - must respond within 2-5 minutes
- Domain verification required to avoid spam filters
- Need fallback mechanism if email service is down
- Forms often don't support webhooks (Wix requires Velo, WordPress needs plugin)
```

---

## Quick Reference: Service Categories

### Automations (1-20)
File: `AUTOMATIONS_TECHNICAL_REQUIREMENTS.md`
- 1-10: Lead & communication automation
- 11-15: Workflow & data automation
- 16-20: Complex automation & SLA tracking

### AI Agents (21-30)
File: `AI_AGENTS_TECHNICAL_REQUIREMENTS.md`
- 21-23: FAQ, lead qualification, sales agents
- 24-27: Service, action, workflow, triage agents
- 28-30: Predictive, full integration, multi-agent

### Integrations (31-40)
File: `INTEGRATIONS_TECHNICAL_REQUIREMENTS.md`
- 31-34: Simple/complex integrations, WhatsApp API
- 35-40: CRM integrations (marketing, accounting, support, calendar, eCommerce, custom)

### System Implementations (41-49)
File: `SYSTEM_IMPLEMENTATION_REQUIREMENTS.md`
- 41-49: CRM, marketing, PM, helpdesk, ERP, eCommerce, analytics, workflow platforms, custom

### Additional Services (50-59)
File: `ADDITIONAL_SERVICES_TECHNICAL_REQUIREMENTS.md`
- 50-54: Data cleanup, migration, dashboards, reports
- 55-59: Training, support, consulting

---

## Pro Tips

1. **Always read the research first** - It contains critical implementation details
2. **Start with the form** - Requirements gathering is the foundation
3. **Use existing patterns** - Look at how other services are implemented
4. **Test as you go** - Don't build everything before testing
5. **Ask questions** - If something in the research is unclear, ask me

---

**Last Updated**: October 8, 2025
**Research Version**: Complete (all 59 services)
**Template Version**: 1.0
