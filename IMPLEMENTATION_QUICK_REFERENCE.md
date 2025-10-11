# Quick Reference - Save Fix Implementation

## Quick File Locations

### Files to Modify
1. `discovery-assistant/src/store/useMeetingStore.ts` - Add `updateImplementationSpec()`
2. `discovery-assistant/src/hooks/useAutoSave.ts` - Complete rewrite
3. `discovery-assistant/src/components/Phase2/ServiceRequirements/Automations/*.tsx` - 25 files
4. `discovery-assistant/src/components/Phase2/ServiceRequirements/AIAgents/*.tsx` - 12 files  
5. `discovery-assistant/src/components/Phase2/ServiceRequirements/Integrations/*.tsx` - 10 files
6. `discovery-assistant/src/components/Phase2/ServiceRequirements/SystemImplementations/*.tsx` - 9 files
7. `discovery-assistant/src/components/Phase2/ServiceRequirements/AdditionalServices/*.tsx` - 10 files
8. `discovery-assistant/src/components/Phase3/TaskEditor.tsx` - Remove useAutoSave

**Total: 69 files to modify**

---

## Quick Search & Replace Patterns

### For Automations Components
**Find**: `moduleId: 'SERVICE_NAME'`
**Replace**: `serviceId: 'SERVICE_NAME', category: 'automations'`

### For AI Agents Components  
**Find**: `moduleId: 'SERVICE_NAME'`
**Replace**: `serviceId: 'SERVICE_NAME', category: 'aiAgentServices'`

### For Integrations Components
**Find**: `moduleId: 'SERVICE_NAME'`
**Replace**: `serviceId: 'SERVICE_NAME', category: 'integrations'`

### For System Implementations Components
**Find**: `moduleId: 'SERVICE_NAME'`
**Replace**: `serviceId: 'SERVICE_NAME', category: 'systemImplementations'`

### For Additional Services Components
**Find**: `moduleId: 'SERVICE_NAME'`
**Replace**: `serviceId: 'SERVICE_NAME', category: 'additionalServices'`

---

## Service ID Mapping Cheat Sheet

### Automations (category: 'automations')
```
AutoLeadWorkflowSpec → 'auto-lead-workflow'
AutoCRMUpdateSpec → 'auto-crm-update'
AutoFormToCrmSpec → 'auto-form-to-crm'
AutoLeadResponseSpec → 'auto-lead-response'
AutoNotificationsSpec → 'auto-notifications'
AutoEmailTemplatesSpec → 'auto-email-templates'
AutoSmsWhatsappSpec → 'auto-sms-whatsapp'
AutoWelcomeEmailSpec → 'auto-welcome-email'
AutoAppointmentRemindersSpec → 'auto-appointment-reminders'
AutoDataSyncSpec → 'auto-data-sync'
AutoSystemSyncSpec → 'auto-system-sync'
AutoDocumentGenerationSpec → 'auto-document-generation'
AutoDocumentMgmtSpec → 'auto-document-mgmt'
AutoReportsSpec → 'auto-reports'
AutoTeamAlertsSpec → 'auto-team-alerts'
AutoApprovalWorkflowSpec → 'auto-approval-workflow'
AutoComplexLogicSpec → 'auto-complex-logic'
AutoCustomSpec → 'auto-custom'
AutoEndToEndSpec → 'auto-end-to-end'
AutoMeetingSchedulerSpec → 'auto-meeting-scheduler'
AutoMultiSystemSpec → 'auto-multi-system'
AutoServiceWorkflowSpec → 'auto-service-workflow'
AutoSlaTrackingSpec → 'auto-sla-tracking'
AutoSmartFollowupSpec → 'auto-smart-followup'
```

### AI Agents (category: 'aiAgentServices')
```
AIFullIntegrationSpec → 'ai-full-integration'
AIComplexWorkflowSpec → 'ai-complex-workflow'
AIPredictiveSpec → 'ai-predictive'
AILeadQualifierSpec → 'ai-lead-qualifier'
AISalesAgentSpec → 'ai-sales-agent'
AIServiceAgentSpec → 'ai-service-agent'
AITriageSpec → 'ai-triage'
AIFAQBotSpec → 'ai-faq-bot'
AIActionAgentSpec → 'ai-action-agent'
AIBrandedSpec → 'ai-branded'
AIFormAssistantSpec → 'ai-form-assistant'
AIMultiAgentSpec → 'ai-multi-agent'
```

### Integrations (category: 'integrations')
```
IntComplexSpec → 'int-complex'
IntEcommerceSpec → 'int-ecommerce'
IntCrmMarketingSpec → 'int-crm-marketing'
IntCrmSupportSpec → 'int-crm-support'
IntCrmAccountingSpec → 'int-crm-accounting'
IntCalendarSpec → 'int-calendar'
IntCustomSpec → 'int-custom'
IntegrationSimpleSpec → 'integration-simple'
IntegrationComplexSpec → 'integration-complex'
WhatsappApiSetupSpec → 'whatsapp-api-setup'
```

### System Implementations (category: 'systemImplementations')
```
ImplCrmSpec → 'impl-crm'
ImplErpSpec → 'impl-erp'
ImplEcommerceSpec → 'impl-ecommerce'
ImplAnalyticsSpec → 'impl-analytics'
ImplMarketingAutomationSpec → 'impl-marketing-automation'
ImplHelpdeskSpec → 'impl-helpdesk'
ImplProjectManagementSpec → 'impl-project-management'
ImplWorkflowPlatformSpec → 'impl-workflow-platform'
ImplCustomSpec → 'impl-custom'
```

### Additional Services (category: 'additionalServices')
```
AddCustomReportsSpec → 'add-custom-reports'
AddDashboardSpec → 'add-dashboard'
ConsultingProcessSpec → 'consulting-process'
ConsultingStrategySpec → 'consulting-strategy'
DataCleanupSpec → 'data-cleanup'
DataMigrationSpec → 'data-migration'
ReportsAutomatedSpec → 'reports-automated'
SupportOngoingSpec → 'support-ongoing'
TrainingOngoingSpec → 'training-ongoing'
TrainingWorkshopsSpec → 'training-workshops'
```

---

## Quick Test Commands

```bash
# After each file save
npm run typecheck

# After completing a category (e.g., all Automations)
npm run build

# Final verification
npm run typecheck && npm run lint && npm run build
```

---

## Common Mistakes to Avoid

❌ **DON'T** change Phase 1 modules (they already work correctly)
❌ **DON'T** forget the `category` parameter
❌ **DON'T** use wrong category names
❌ **DON'T** keep `debounceMs` or `immediateFields` in Phase 2 components
❌ **DON'T** include `saveData` in useEffect dependency arrays

✅ **DO** keep the exact serviceId strings (case-sensitive)
✅ **DO** match category to folder name
✅ **DO** test after each file
✅ **DO** verify data persists in localStorage
✅ **DO** check browser console for save messages

---

## Progress Tracking Template

Copy this to track your progress:

```
STEP 1: useMeetingStore
[ ] Added updateImplementationSpec to interface
[ ] Implemented updateImplementationSpec function
[ ] Removed debounced save
[ ] Verified typecheck passes

STEP 2: useAutoSave Hook
[ ] Replaced entire file with new version
[ ] Verified typecheck passes

STEP 3: Phase 2 Components
Automations (25 files):
[ ] AutoLeadWorkflowSpec.tsx
[ ] AutoCRMUpdateSpec.tsx
[ ] AutoFormToCrmSpec.tsx
[ ] AutoLeadResponseSpec.tsx
[ ] AutoNotificationsSpec.tsx
[ ] AutoEmailTemplatesSpec.tsx
[ ] AutoSmsWhatsappSpec.tsx
[ ] AutoWelcomeEmailSpec.tsx
[ ] AutoAppointmentRemindersSpec.tsx
[ ] AutoDataSyncSpec.tsx
[ ] AutoSystemSyncSpec.tsx
[ ] AutoDocumentGenerationSpec.tsx
[ ] AutoDocumentMgmtSpec.tsx
[ ] AutoReportsSpec.tsx
[ ] AutoTeamAlertsSpec.tsx
[ ] AutoApprovalWorkflowSpec.tsx
[ ] AutoComplexLogicSpec.tsx
[ ] AutoCustomSpec.tsx
[ ] AutoEndToEndSpec.tsx
[ ] AutoMeetingSchedulerSpec.tsx
[ ] AutoMultiSystemSpec.tsx
[ ] AutoServiceWorkflowSpec.tsx
[ ] AutoSlaTrackingSpec.tsx
[ ] AutoSmartFollowupSpec.tsx

AI Agents (12 files):
[ ] AIFullIntegrationSpec.tsx
[ ] AIComplexWorkflowSpec.tsx
[ ] AIPredictiveSpec.tsx
[ ] AILeadQualifierSpec.tsx
[ ] AISalesAgentSpec.tsx
[ ] AIServiceAgentSpec.tsx
[ ] AITriageSpec.tsx
[ ] AIFAQBotSpec.tsx
[ ] AIActionAgentSpec.tsx
[ ] AIBrandedSpec.tsx
[ ] AIFormAssistantSpec.tsx
[ ] AIMultiAgentSpec.tsx

Integrations (10 files):
[ ] IntComplexSpec.tsx
[ ] IntEcommerceSpec.tsx
[ ] IntCrmMarketingSpec.tsx
[ ] IntCrmSupportSpec.tsx
[ ] IntCrmAccountingSpec.tsx
[ ] IntCalendarSpec.tsx
[ ] IntCustomSpec.tsx
[ ] IntegrationSimpleSpec.tsx
[ ] IntegrationComplexSpec.tsx
[ ] WhatsappApiSetupSpec.tsx

System Implementations (9 files):
[ ] ImplCrmSpec.tsx
[ ] ImplErpSpec.tsx
[ ] ImplEcommerceSpec.tsx
[ ] ImplAnalyticsSpec.tsx
[ ] ImplMarketingAutomationSpec.tsx
[ ] ImplHelpdeskSpec.tsx
[ ] ImplProjectManagementSpec.tsx
[ ] ImplWorkflowPlatformSpec.tsx
[ ] ImplCustomSpec.tsx

Additional Services (10 files):
[ ] AddCustomReportsSpec.tsx
[ ] AddDashboardSpec.tsx
[ ] ConsultingProcessSpec.tsx
[ ] ConsultingStrategySpec.tsx
[ ] DataCleanupSpec.tsx
[ ] DataMigrationSpec.tsx
[ ] ReportsAutomatedSpec.tsx
[ ] SupportOngoingSpec.tsx
[ ] TrainingOngoingSpec.tsx
[ ] TrainingWorkshopsSpec.tsx

STEP 4: TaskEditor
[ ] Removed useAutoSave
[ ] Removed useBeforeUnload
[ ] Removed import
[ ] Verified typecheck passes

STEP 5: Testing
[ ] Test Phase 1 module save
[ ] Test Phase 2 service save
[ ] Test navigation without data loss
[ ] Test switching between Phase 2 components
[ ] Test Supabase sync
[ ] Test wizard mode
[ ] Test offline behavior
[ ] Test multiple rapid saves

FINAL VERIFICATION
[ ] npm run typecheck - PASSES
[ ] npm run lint - PASSES
[ ] npm run build - SUCCEEDS
[ ] No console errors
[ ] No infinite loops
[ ] Data persists across navigation
[ ] Data persists after refresh
```

---

## When You're Done

Message me: **"Implementation complete"**

I will then:
1. ✅ Review all changes
2. ✅ Verify correct implementation
3. ✅ Test functionality
4. ✅ Confirm 100% completion
5. ✅ Check for any remaining issues

