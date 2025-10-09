# Fix Service Component: Complex Enterprise Integration (4+ Systems)

## What You Need To Do

**Simple job:** Replace the simplified interface with the FULL TypeScript interface from the codebase.

## Service Details
- **Service ID:** `int-complex`
- **Service Number:** #33
- **Service Name (Hebrew):** אינטגרציה מורכבת ארגונית
- **Category:** Integrations → saves to `implementationSpec.integrationServices`
- **Current Coverage:** ~8% (4 out of 55+ fields)
- **Target Coverage:** 95%+ (50+ fields)

## Files To Read

### 1. TypeScript Interface
**File:** `discovery-assistant/src/types/integrationServices.ts`
**Line:** 241
**Search for:** `export interface IntComplexRequirements`
**Action:** Read lines 241-400+ completely. Enterprise-grade integration interface.

**Key sections:**
- `enterpriseSystems` - Array of 4+ systems configuration
- `apiGateway` - Centralized API gateway (optional)
- `messageQueue` - Message queue for async operations
- `dataOrchestration` - Complex data transformation
- `businessRulesEngine` - Business rules processing
- `errorRecovery` - Enterprise-grade error handling
- `monitoring` - Comprehensive monitoring
- `securityCompliance` - Security and audit requirements

### 2. Current Component
**File:** `discovery-assistant/src/components/Phase2/ServiceRequirements/Integrations/IntComplexSpec.tsx`
**Current problem:** Simplified implementation (~52 lines)

### 3. Reference Example
**IntegrationComplexSpec.tsx** or **AutoDataSyncSpec.tsx** - Multi-system integration patterns

## Tab Organization (7 tabs)

1. **מערכות ארגוניות** (`systems`):
   - Enterprise systems array (minimum 4 systems):
     - System name
     - Type (CRM/ERP/HR/Finance/Inventory/Custom)
     - Vendor (SAP/Oracle/Salesforce/NetSuite/etc.)
     - Auth method (OAuth/SAML/API Key/Certificate)
     - Credentials (conditional based on auth method)
     - API version
     - Rate limits (requests per minute/hour)
     - Webhook support checkbox
   - Add/remove systems

2. **API Gateway** (`apiGateway`):
   - Enabled checkbox (optional)
   - Type (Kong/AWS API Gateway/Azure API Management)
   - Centralized auth enabled
   - Rate limiting strategy (token-bucket/leaky-bucket/fixed-window)
   - API gateway endpoint
   - Management API key

3. **Message Queue** (`messageQueue`):
   - Type (Redis/RabbitMQ/AWS SQS)
   - Host
   - Port
   - Credentials (username, password)
   - Queue names:
     - Sync queue
     - Error queue
     - Dead letter queue
   - Message retention (hours)
   - Max retries

4. **תזמור נתונים** (`orchestration`):
   - Orchestration framework (n8n/Airflow/Step Functions)
   - Data transformation rules array:
     - Source system
     - Target system
     - Transformation type (map/filter/aggregate/enrich)
     - Transformation logic (JavaScript/SQL/Custom)
   - Batch processing enabled
   - Batch size
   - Add/remove transformation rules

5. **Business Rules Engine** (`businessRules`):
   - Rules engine enabled checkbox
   - Rules array:
     - Rule name
     - Condition (when/if)
     - Action (then)
     - Priority
     - Enabled checkbox
   - Decision tables upload (file path)
   - Add/remove rules

6. **שחזור שגיאות ואבטחה** (`errorSecurity`):
   - Error recovery:
     - Automatic retry enabled
     - Max retry attempts
     - Retry backoff (exponential/linear/fixed)
     - Circuit breaker enabled
     - Circuit breaker threshold
     - Manual intervention trigger
   - Security compliance:
     - Encryption in transit (TLS 1.2+)
     - Encryption at rest enabled
     - Audit logging enabled
     - PII data handling (tokenize/encrypt/hash)
     - Compliance requirements (GDPR/HIPAA/SOC2)

7. **ניטור ותחזוקה** (`monitoring`):
   - Monitoring enabled checkbox
   - Metrics to track (throughput, latency, error rate, data quality)
   - APM integration (New Relic/DataDog/Dynatrace)
   - Alert channels (email, slack, pagerduty)
   - Alert thresholds
   - Dashboard URL
   - Health check endpoint
   - Estimated monthly API calls
   - Estimated monthly cost

## Success Criteria

- [ ] All 55+ fields from interface implemented
- [ ] 7 tabs organizing fields logically
- [ ] Minimum 4 systems in enterpriseSystems array
- [ ] Optional API Gateway and Business Rules sections toggle properly
- [ ] Message queue fully configured
- [ ] Enterprise-grade error recovery and security
- [ ] TypeScript compiles with 0 errors

**File to replace:** `discovery-assistant/src/components/Phase2/ServiceRequirements/Integrations/IntComplexSpec.tsx`

**Expected size:** ~1,000-1,200 lines
