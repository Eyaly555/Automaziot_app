# Type Definition Fixes - Complete Analysis

## Component Usage Analysis

### 1. AcceptanceCriteriaBuilder.tsx (95 errors)

**Missing Properties in AcceptanceCriteria:**
- `functionalCriteria` array (uses this instead of `functional`)
- `performanceCriteria` array (uses this instead of `performance`)
- `securityCriteria` array (uses this instead of `security`)
- `deploymentCriteria` object
- `signOffRequired` boolean
- `signOffBy` array of persons

**Missing Properties in FunctionalRequirement:**
- `testable` boolean (line 79, 366)

**Missing Properties in PerformancRequirement:**
- `measurement` string (line 107, 464)

**Missing Properties in SecurityRequirement:**
- `implemented` boolean (line 134, 525)
- `verificationMethod` string (line 134, 560)

**DeploymentCriteria structure:**
```typescript
deploymentCriteria: {
  approvers: Array<{ name: string; role: string; email: string }>;
  environment: 'staging' | 'production' | 'dev';
  rollbackPlan: string;
  smokeTests: string[];
}
```

**SignOffBy structure:**
```typescript
signOffBy: Array<{ name: string; role: string; email: string }>
```

---

### 2. AIAgentDetailedSpec.tsx (91 errors)

**Missing Properties in DetailedConversationFlow:**
- `greeting` string (line 709)
- `intents` Intent[] (line 267, 736)
- `fallbackResponse` string (line 785)
- `escalationTriggers` string[] (line 91)
- `maxTurns` number (line 92, 804)
- `contextWindow` number (line 93, 824)

**Missing Intent Interface:**
```typescript
interface Intent {
  name: string;
  examples: string[];
  response: string;
  requiresData: boolean;
}
```

**Missing Properties in AIAgentIntegrations:**
- `crmEnabled` boolean (line 96, 853)
- `crmSystem` string (line 97, 870)
- `emailEnabled` boolean (line 98, 890)
- `emailProvider` string (line 99)
- `calendarEnabled` boolean (line 100, 912)
- `customWebhooks` Webhook[] (line 101, 346)

**Missing Webhook Interface:**
```typescript
interface Webhook {
  name: string;
  url: string;
  trigger: string;
  headers: Record<string, any>;
}
```

**Missing Properties in AIAgentTraining:**
- `conversationExamples` any[] (line 104)
- `faqPairs` FAQPair[] (line 105, 307)
- `tone` string (line 107, 1078)
- `language` string (line 108, 1100)

**Missing FAQPair Interface:**
```typescript
interface FAQPair {
  question: string;
  answer: string;
  category: string;
}
```

**Missing Properties in KnowledgeBase:**
- `documentCount` number (line 82)
- `totalTokens` number (line 83)
- Rename `totalDocuments` → `documentCount`
- Rename `totalTokensEstimated` → `totalTokens`

**Missing Properties in AIModelSelection:**
- `temperature` number (line 113, 1169)
- `maxTokens` number (line 114, 1190)
- `topP` number (line 115, 1213)

---

### 3. IntegrationFlowBuilder.tsx (47 errors)

**Missing Properties in FlowTrigger:**
- `schedule` string (line 83, 539)
- `eventName` string (line 84, 554)
- Rename `scheduleExpression` → `schedule`

**Missing Properties in FlowStep:**
- `stepNumber` number (line 322, 605)
- `type` string (line 323, 608)
- `description` string (line 324, 632)
- `endpoint` string (line 325, 643)
- `dataMapping` Record<string, any> (line 326)
- `condition` string (line 327, 660)
- Rename `order` → `stepNumber`
- Rename `action` → `type`

**Missing Properties in ErrorHandlingStrategy:**
- `retryCount` number (line 88, 694)
- `retryDelay` number (line 89, 714)
- `notifyOnFailure` boolean (line 92, 754)
- `failureEmail` string (line 93, 777)
- `fallbackAction` string (line 91, 733)
- Rename `retryAttempts` → `retryCount`

**Missing Properties in TestCase:**
- `scenario` string (line 351, 829)
- `input` Record<string, any> (line 352)
- `actualOutput` Record<string, any> (line 354)
- `name` string (line 350)
- Rename `inputData` → `input`
- Change status from 'not_tested' to 'pending'

**Missing Properties in IntegrationFlow:**
- Ensure `description` exists (line 89)

---

### 4. SystemDeepDive.tsx (26 errors)

**Missing Properties in PerformanceRequirement:**
- `testMethod` string (line 839)

**Missing Properties in SecurityRequirement:**
- `verified` boolean (line 864)

**Missing Properties in FunctionalRequirement:**
- `category` string (line 781)

---

## Summary of Changes Needed

### src/types/phase2.ts

1. **AcceptanceCriteria**: Add alias properties
2. **FunctionalRequirement**: Add `testable` boolean
3. **PerformanceRequirement**: Add `measurement` string
4. **SecurityRequirement**: Add `implemented` and `verificationMethod`
5. **Add DeploymentCriteria interface**
6. **Add SignOffPerson interface**
7. **DetailedConversationFlow**: Add all missing properties
8. **Add Intent interface**
9. **AIAgentIntegrations**: Add all missing properties
10. **Add Webhook interface**
11. **AIAgentTraining**: Add all missing properties
12. **Add FAQPair interface**
13. **KnowledgeBase**: Add `documentCount` and `totalTokens`
14. **AIModelSelection**: Add `temperature`, `maxTokens`, `topP`
15. **FlowTrigger**: Add `schedule` and `eventName`
16. **FlowStep**: Add all missing properties
17. **ErrorHandlingStrategy**: Add all missing properties
18. **TestCase**: Add all missing properties

### src/types/proposal.ts

1. **SmartRecommendation**: Add `type`, `estimatedTimeSavings`, `estimatedCostSavings`, and rename `suggestedTool` → `suggestedTools`

---

## Error Count Goals

- **Before**: 1,188 total errors
- **After Phase 2 fixes**: ~750 errors (438 errors fixed)
- **Primary fixes**: phase2.ts (~260 errors), proposal.ts (~30 errors), index.ts (~120 errors)
