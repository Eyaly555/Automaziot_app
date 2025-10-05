# Discovery Assistant - Migration Guide

## Overview

This guide provides step-by-step migration patterns for updating existing components to use the new UX system. All migrations are **non-breaking** and can be done incrementally.

## Table of Contents

1. [Migration Strategy](#migration-strategy)
2. [Top 10 Component Migrations](#top-10-component-migrations)
3. [Common Migration Patterns](#common-migration-patterns)
4. [Module-by-Module Migration](#module-by-module-migration)
5. [Phase 2 & 3 Migrations](#phase-2--3-migrations)
6. [Testing After Migration](#testing-after-migration)

---

## Migration Strategy

### Progressive Enhancement Approach

The migration follows a **progressive enhancement** strategy:

1. **No Breaking Changes**: Old components continue to work
2. **Gradual Adoption**: Migrate components one at a time
3. **Coexistence**: New and old components can coexist
4. **Testing**: Test each migration before moving to the next
5. **Rollback**: Easy to revert if issues occur

### Migration Priority

**Priority 1 (Critical):**
- Dashboard
- ClientsListView
- WizardMode
- All 11 Discovery modules

**Priority 2 (Important):**
- Phase 2 components (5 files)
- Phase 3 components (6 files)

**Priority 3 (Nice-to-have):**
- Requirements components
- Visualization components
- Settings components

---

## Top 10 Component Migrations

### 1. Dashboard.tsx Migration

**File:** `src/components/Dashboard/Dashboard.tsx`

**Before:**

```typescript
export const Dashboard = () => {
  const { meetings, currentMeeting } = useMeetingStore();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">לוח בקרה</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {modules.map(module => (
          <div key={module.id} className="bg-white rounded-lg shadow p-4">
            <h3 className="font-semibold">{module.title}</h3>
            <p className="text-gray-600">{module.description}</p>
            <div className="mt-2">
              <span className={`px-2 py-1 rounded text-sm ${
                module.completed ? 'bg-green-100 text-green-800' : 'bg-gray-100'
              }`}>
                {module.completed ? 'הושלם' : 'בתהליך'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
```

**After:**

```typescript
import { Card } from '../Base/Card';
import { Badge } from '../Base/Badge';
import { LoadingSkeleton } from '../Base/LoadingSkeleton';
import { ModuleProgressCard } from '../Progress/ModuleProgressCard';
import { toast } from '../../utils/toast';

export const Dashboard = () => {
  const { meetings, currentMeeting, isLoading } = useMeetingStore();

  if (isLoading) {
    return <LoadingSkeleton variant="card" count={9} />;
  }

  return (
    <div className="p-6">
      {/* Header Card */}
      <Card variant="elevated" className="mb-6">
        <Card.Header>
          <div className="flex items-center justify-between">
            <Card.Title>לוח בקרה</Card.Title>
            <Badge variant="info">{meetings.length} פגישות</Badge>
          </div>
        </Card.Header>
      </Card>

      {/* Module Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {modules.map(module => (
          <ModuleProgressCard
            key={module.id}
            title={module.title}
            description={module.description}
            progress={module.progress}
            status={module.status}
            icon={module.icon}
            onClick={() => {
              navigate(`/module/${module.id}`);
              toast.info({ title: `פותח ${module.title}` });
            }}
          />
        ))}
      </div>
    </div>
  );
};
```

**Changes:**
- Replaced manual cards with `ModuleProgressCard`
- Added `LoadingSkeleton` for loading state
- Replaced manual badge with `Badge` component
- Added toast notifications for navigation
- Used `Card` for header section

---

### 2. OverviewModule.tsx Migration

**File:** `src/components/Modules/Overview/OverviewModule.tsx`

**Before:**

```typescript
export const OverviewModule = () => {
  const { currentMeeting, updateModule } = useMeetingStore();
  const [businessName, setBusinessName] = useState('');
  const [businessType, setBusinessType] = useState('');

  const handleSave = () => {
    updateModule('overview', { businessName, businessType });
    alert('נשמר בהצלחה');
  };

  return (
    <div className="p-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">סקירה כללית</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">שם העסק</label>
            <input
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">סוג עסק</label>
            <select
              value={businessType}
              onChange={(e) => setBusinessType(e.target.value)}
              className="w-full border rounded px-3 py-2"
            >
              <option value="">בחר סוג</option>
              <option value="b2b">B2B</option>
              <option value="b2c">B2C</option>
            </select>
          </div>

          <button
            onClick={handleSave}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            שמור
          </button>
        </div>
      </div>
    </div>
  );
};
```

**After:**

```typescript
import { Card } from '../../Base/Card';
import { Input } from '../../Base/Input';
import { Select } from '../../Base/Select';
import { Button } from '../../Base/Button';
import { Badge } from '../../Base/Badge';
import { ProgressBar } from '../../Base/ProgressBar';
import { PageTransition } from '../../Feedback/PageTransition';
import { toast } from '../../../utils/toast';

export const OverviewModule = () => {
  const { currentMeeting, updateModule } = useMeetingStore();
  const [businessName, setBusinessName] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!businessName) newErrors.businessName = 'שדה חובה';
    if (!businessType) newErrors.businessType = 'שדה חובה';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) {
      toast.error({ title: 'שגיאת ולידציה', message: 'יש למלא את כל השדות החובה' });
      return;
    }

    updateModule('overview', { businessName, businessType });
    toast.success({
      title: 'נשמר בהצלחה!',
      message: 'הנתונים נשמרו במערכת'
    });
  };

  const progress = calculateProgress({ businessName, businessType });

  return (
    <PageTransition>
      <div className="p-6 space-y-6">
        {/* Header Card with Progress */}
        <Card variant="elevated">
          <Card.Header>
            <div className="flex items-center justify-between">
              <Card.Title>סקירה כללית</Card.Title>
              <Badge variant={progress === 100 ? 'success' : 'warning'}>
                {progress}% הושלם
              </Badge>
            </div>
          </Card.Header>
          <Card.Content>
            <ProgressBar value={progress} variant="default" />
          </Card.Content>
        </Card>

        {/* Form Card */}
        <Card>
          <Card.Header>
            <Card.Title>פרטי עסק</Card.Title>
          </Card.Header>
          <Card.Content>
            <div className="space-y-4">
              <Input
                label="שם העסק"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                error={errors.businessName}
                placeholder="הזן שם עסק..."
                required
              />

              <Select
                label="סוג עסק"
                value={businessType}
                onChange={(e) => setBusinessType(e.target.value)}
                options={[
                  { value: 'b2b', label: 'B2B' },
                  { value: 'b2c', label: 'B2C' },
                  { value: 'both', label: 'שניהם' }
                ]}
                error={errors.businessType}
                placeholder="בחר סוג עסק"
                required
              />
            </div>
          </Card.Content>
          <Card.Footer>
            <div className="flex gap-2">
              <Button variant="primary" onClick={handleSave}>
                שמור
              </Button>
              <Button variant="outline" onClick={() => navigate('/dashboard')}>
                חזור
              </Button>
            </div>
          </Card.Footer>
        </Card>
      </div>
    </PageTransition>
  );
};
```

**Changes:**
- Wrapped in `PageTransition` for smooth animations
- Replaced manual card with `Card` component
- Used `Input` and `Select` with validation
- Added progress bar with `ProgressBar`
- Replaced alert with `toast` notifications
- Added validation logic
- Used `Badge` for status display
- Improved layout with spacing utilities

---

### 3. WizardMode.tsx Migration

**File:** `src/components/Wizard/WizardMode.tsx`

**Before:**

```typescript
export const WizardMode = () => {
  const [currentStep, setCurrentStep] = useState(0);

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-64 bg-gray-100 p-4">
        <h2 className="font-bold mb-4">שלבים</h2>
        {steps.map((step, index) => (
          <div
            key={index}
            className={`p-2 mb-2 rounded cursor-pointer ${
              index === currentStep ? 'bg-blue-500 text-white' : 'bg-white'
            }`}
            onClick={() => setCurrentStep(index)}
          >
            {step.title}
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 p-6">
        <h1 className="text-2xl font-bold mb-4">{steps[currentStep].title}</h1>
        <div>{steps[currentStep].content}</div>

        <div className="mt-4 flex gap-2">
          <button
            onClick={() => setCurrentStep(currentStep - 1)}
            disabled={currentStep === 0}
            className="px-4 py-2 bg-gray-200 rounded"
          >
            הקודם
          </button>
          <button
            onClick={() => setCurrentStep(currentStep + 1)}
            disabled={currentStep === steps.length - 1}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            הבא
          </button>
        </div>
      </div>
    </div>
  );
};
```

**After:**

```typescript
import { Card } from '../Base/Card';
import { Button } from '../Base/Button';
import { PageTransition } from '../Feedback/PageTransition';
import { WizardStepNavigation } from '../Navigation/WizardStepNavigation';
import { ProgressBar } from '../Base/ProgressBar';
import { toast } from '../../utils/toast';

export const WizardMode = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const handleNext = () => {
    if (!validateCurrentStep()) {
      toast.error({ title: 'שגיאה', message: 'יש למלא את כל השדות החובה' });
      return;
    }

    setCompletedSteps([...completedSteps, currentStep]);
    setCurrentStep(currentStep + 1);
    toast.success({ title: 'שלב הושלם!' });
  };

  const handlePrevious = () => {
    setCurrentStep(currentStep - 1);
  };

  const progress = ((completedSteps.length + 1) / steps.length) * 100;

  return (
    <div className="flex h-screen">
      {/* Wizard Navigation Sidebar */}
      <WizardStepNavigation
        currentStep={currentStep}
        totalSteps={steps.length}
        completedSteps={completedSteps}
        onStepClick={setCurrentStep}
        steps={steps}
      />

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Progress Header */}
        <Card variant="elevated" className="m-6 mb-4">
          <Card.Content>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">התקדמות כוללת</span>
              <span className="text-sm font-medium">{Math.round(progress)}%</span>
            </div>
            <ProgressBar value={progress} variant="default" />
          </Card.Content>
        </Card>

        {/* Step Content */}
        <PageTransition key={currentStep}>
          <div className="p-6 pt-0">
            <Card>
              <Card.Header>
                <Card.Title>{steps[currentStep].title}</Card.Title>
              </Card.Header>
              <Card.Content>
                {steps[currentStep].content}
              </Card.Content>
              <Card.Footer>
                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={handlePrevious}
                    disabled={currentStep === 0}
                  >
                    הקודם
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleNext}
                    disabled={currentStep === steps.length - 1}
                  >
                    {currentStep === steps.length - 1 ? 'סיים' : 'הבא'}
                  </Button>
                </div>
              </Card.Footer>
            </Card>
          </div>
        </PageTransition>
      </div>
    </div>
  );
};
```

**Changes:**
- Added `WizardStepNavigation` component
- Wrapped content in `PageTransition`
- Added progress tracking with `ProgressBar`
- Replaced manual buttons with `Button` component
- Added validation before step progression
- Used `toast` for user feedback
- Improved layout structure

---

## Common Migration Patterns

### Pattern 1: Replace Manual Cards

**Before:**
```typescript
<div className="bg-white rounded-lg shadow p-4">
  <h3>Title</h3>
  <p>Content</p>
</div>
```

**After:**
```typescript
<Card>
  <Card.Header>
    <Card.Title>Title</Card.Title>
  </Card.Header>
  <Card.Content>
    <p>Content</p>
  </Card.Content>
</Card>
```

---

### Pattern 2: Replace Form Inputs

**Before:**
```typescript
<div>
  <label>שם שדה</label>
  <input
    type="text"
    value={value}
    onChange={(e) => setValue(e.target.value)}
    className="border rounded px-3 py-2"
  />
</div>
```

**After:**
```typescript
<Input
  label="שם שדה"
  value={value}
  onChange={(e) => setValue(e.target.value)}
  error={errors.fieldName}
  helperText="טקסט עזרה"
/>
```

---

### Pattern 3: Replace Loading States

**Before:**
```typescript
{isLoading && <div className="animate-spin">Loading...</div>}
{!isLoading && <Content />}
```

**After:**
```typescript
{isLoading ? (
  <LoadingSkeleton variant="card" count={3} />
) : (
  <Content />
)}
```

---

### Pattern 4: Replace Alerts with Toasts

**Before:**
```typescript
const handleSave = () => {
  saveData();
  alert('נשמר בהצלחה!');
};
```

**After:**
```typescript
import { toast } from '../utils/toast';

const handleSave = async () => {
  try {
    await saveData();
    toast.success({ title: 'נשמר בהצלחה!' });
  } catch (error) {
    toast.error({ title: 'שגיאה', message: error.message });
  }
};
```

---

### Pattern 5: Add Progress Indicators

**Before:**
```typescript
<div className="text-sm">50% הושלם</div>
```

**After:**
```typescript
<div className="space-y-2">
  <div className="flex justify-between">
    <span>התקדמות</span>
    <span>50%</span>
  </div>
  <ProgressBar value={50} variant="default" />
</div>
```

---

## Module-by-Module Migration

### Overview Module
- Use `Input` for business name, employees
- Use `Select` for business type, industry
- Use `TextArea` for description, challenges
- Add progress tracking with `ProgressBar`

### LeadsAndSales Module
- Use `Input` for lead sources
- Use `Select` for CRM system
- Add validation for required fields
- Use `Badge` for lead status

### CustomerService Module
- Use `Input` for support channels
- Use `TextArea` for service description
- Add `Card` sections for different areas
- Use `ProgressBar` for response time metrics

### Operations Module
- Use `Input` for inventory items
- Use `Select` for workflow tools
- Add `Card` for each operation area
- Use `Badge` for status indicators

### Reporting Module
- Use `Select` for BI tools
- Use `TextArea` for reporting needs
- Add visualization previews
- Use `ProgressBar` for data quality

### AIAgents Module
- Use `Input` for agent names
- Use `TextArea` for use cases
- Add `Card` for each agent
- Use `Badge` for agent status

### Systems Module
- Already enhanced (SystemsModuleEnhanced)
- Verify integration with new components
- Add `LoadingSkeleton` for system loading

### ROI Module
- Use `Input` for costs
- Use `Select` for time periods
- Add `ProgressBar` for ROI metrics
- Use `Badge` for scenario labels

### Proposal Module
- Use `Card` for service items
- Use `Badge` for service status
- Add `ProgressBar` for proposal completion
- Use `Button` for actions

---

## Phase 2 & 3 Migrations

### Phase 2: Implementation Spec Dashboard

**Add:**
- `SystemSpecProgress` components
- `IntegrationFlowToolbar` in flow builder
- `Card` components for spec sections
- `ProgressBar` for completion tracking

### Phase 3: Developer Dashboard

**Add:**
- `TaskQuickFilters` for task filtering
- `Card` for task cards
- `Badge` for task status
- `ProgressBar` for sprint progress

---

## Testing After Migration

After each component migration:

1. **Visual Test**: Check that UI looks correct
2. **Functional Test**: Verify all features still work
3. **Validation Test**: Check form validation works
4. **Responsive Test**: Test on mobile, tablet, desktop
5. **RTL Test**: Verify Hebrew layout is correct
6. **Accessibility Test**: Check keyboard navigation

**Test Checklist:**
- [ ] Component renders without errors
- [ ] All props pass TypeScript checks
- [ ] Styling matches design system
- [ ] Interactions work as expected
- [ ] Loading states display correctly
- [ ] Error states show properly
- [ ] Toast notifications appear
- [ ] Auto-save indicator works
- [ ] Responsive layout adapts
- [ ] RTL/LTR switches correctly

---

## Summary

**Migration Benefits:**
- Consistent UI across all components
- Built-in validation and error handling
- Professional loading and error states
- Accessible by default
- RTL/LTR support
- TypeScript type safety
- Better developer experience

**Migration is Optional:**
- Components can be migrated incrementally
- Old and new components coexist
- No breaking changes
- Easy to rollback

For implementation examples, see **COMPONENT_USAGE.md**.
For integration steps, see **INTEGRATION_GUIDE.md**.
