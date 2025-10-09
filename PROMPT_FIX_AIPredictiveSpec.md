# Fix Service Component: AI Predictive Analytics Agent

## What You Need To Do

**Simple job:** Replace the simplified interface with the FULL TypeScript interface from the codebase.

## Service Details
- **Service ID:** `ai-predictive`
- **Service Number:** #28
- **Service Name (Hebrew):** ניתוח חזוי מבוסס AI
- **Category:** AIAgents → saves to `implementationSpec.aiAgentServices`
- **Current Coverage:** ~12% (10 out of 85+ fields)
- **Target Coverage:** 95%+ (80+ fields)

## Files To Read

### 1. TypeScript Interface
**File:** `discovery-assistant/src/types/aiAgentServices.ts`
**Line:** 1333
**Search for:** `export interface AIPredictiveRequirements`
**Action:** Read lines 1333-1510+ completely. Advanced analytics interface with ML components.

**Key sections:**
- `aiProvider` - AI/ML provider and model
- `dataSource` - Data source configuration (CRM/Database/API)
- `predictionTargets` - What to predict (sales, churn, demand, etc.)
- `trainingData` - Training dataset configuration
- `modelConfiguration` - ML model settings
- `features` - Feature engineering
- `deployment` - Model deployment and serving
- `monitoring` - Model performance monitoring
- `retraining` - Automated retraining schedule

### 2. Current Component
**File:** `discovery-assistant/src/components/Phase2/ServiceRequirements/AIAgents/AIPredictiveSpec.tsx`
**Current problem:** Simplified implementation (~82 lines)

### 3. Reference Example
**AIComplexWorkflowSpec.tsx** - Shows AI configuration patterns

## Tab Organization (7 tabs)

1. **AI/ML ספק** (`provider`):
   - Provider (OpenAI/Anthropic/Google AutoML/Azure ML/Custom)
   - Model type (GPT-based/Traditional ML/Hybrid)
   - API key
   - Custom model details (if applicable)

2. **מקור נתונים** (`dataSource`):
   - Primary source (CRM/Database/Data Warehouse/API)
   - Connection details:
     - **CRM:** System, auth method, credentials, data module
     - **Database:** Type, connection string, query/table
     - **Data Warehouse:** Provider (BigQuery/Snowflake/Redshift), credentials
     - **API:** Endpoint, method, auth, parameters
   - Data fields to extract array
   - Historical data range (months)

3. **יעדי חיזוי** (`targets`):
   - Prediction targets array:
     - Target name (e.g., "Lead conversion probability")
     - Target type (classification/regression/time_series)
     - Output format (probability/score/category/value)
     - Business value/use case
   - Add/remove targets

4. **נתוני אימון ותכונות** (`training`):
   - Training data:
     - Source (same as data source or different)
     - Date range
     - Sample size
     - Train/test split ratio
   - Feature engineering:
     - Automatic feature extraction enabled
     - Custom features array (feature name, calculation, data type)
     - Feature selection method (auto/manual/correlation-based)
   - Data preprocessing:
     - Normalization enabled
     - Handle missing values (drop/impute/forward-fill)
     - Outlier treatment

5. **הגדרות מודל** (`model`):
   - Model type (GPT-4/Random Forest/XGBoost/Neural Network/Custom)
   - Hyperparameters (key-value pairs based on model type)
   - Validation strategy (k-fold/time-based/holdout)
   - Performance metrics (accuracy/precision/recall/F1/RMSE/MAE)
   - Target threshold (minimum acceptable performance)

6. **Deployment והפעלה** (`deployment`):
   - Deployment method (API/Batch/Real-time)
   - Serving infrastructure (Cloud Function/Lambda/Container/n8n)
   - API endpoint URL (if applicable)
   - Batch schedule (if batch)
   - Output destination (CRM field/Database/Webhook/Email)
   - Confidence threshold (minimum to act on prediction)

7. **ניטור ואימון מחדש** (`monitoring`):
   - Model monitoring:
     - Enabled checkbox
     - Metrics to track (prediction accuracy, drift detection, latency)
     - Alert thresholds
     - Dashboard URL
   - Automated retraining:
     - Enabled checkbox
     - Retraining frequency (weekly/monthly/quarterly)
     - Trigger conditions (accuracy drop, data drift, manual)
     - Approval required checkbox

## Success Criteria

- [ ] All 85+ fields from interface implemented
- [ ] 7 tabs organizing fields logically
- [ ] Conditional data source configs (CRM/Database/Data Warehouse/API)
- [ ] Feature engineering and data preprocessing complete
- [ ] Model configuration with hyperparameters
- [ ] Deployment and monitoring fully configured
- [ ] TypeScript compiles with 0 errors

**File to replace:** `discovery-assistant/src/components/Phase2/ServiceRequirements/AIAgents/AIPredictiveSpec.tsx`

**Expected size:** ~1,100-1,300 lines
