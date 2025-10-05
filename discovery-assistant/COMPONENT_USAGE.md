# Discovery Assistant - Component Usage Guide

## Overview

This comprehensive guide provides detailed usage examples for all 47 components in the UX system across 6 layers. Each component includes TypeScript types, props documentation, and real-world examples.

## Table of Contents

1. [Layer 1: Base Components](#layer-1-base-components)
2. [Layer 2: Layout Components](#layer-2-layout-components)
3. [Layer 3: Feedback Components](#layer-3-feedback-components)
4. [Layer 4: Form & Validation Components](#layer-4-form--validation-components)
5. [Layer 5: Domain-Specific Components](#layer-5-domain-specific-components)
6. [Layer 6: Integration Components](#layer-6-integration-components)

---

## Layer 1: Base Components

### 1.1 Button

**File:** `src/components/Base/Button.tsx`

**Purpose:** Standardized button component with variants, sizes, and states.

**Props:**

```typescript
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  onClick?: () => void;
  children: React.ReactNode;
  type?: 'button' | 'submit' | 'reset';
}
```

**Examples:**

```typescript
import { Button } from '../Base/Button';
import { Save, Plus } from 'lucide-react';

// Primary button
<Button variant="primary" onClick={handleSave}>
  שמור
</Button>

// Button with loading state
<Button variant="primary" loading={isSaving}>
  שומר...
</Button>

// Button with icon
<Button variant="secondary" icon={<Plus />} iconPosition="right">
  הוסף חדש
</Button>

// Danger button (delete)
<Button variant="danger" onClick={handleDelete}>
  מחק
</Button>

// Outline button
<Button variant="outline" onClick={handleCancel}>
  ביטול
</Button>

// Full width button
<Button variant="primary" fullWidth>
  המשך
</Button>

// Disabled button
<Button variant="primary" disabled>
  לא זמין
</Button>
```

---

### 1.2 Card

**File:** `src/components/Base/Card.tsx`

**Purpose:** Container component with header, content, and footer sections.

**Props:**

```typescript
interface CardProps {
  variant?: 'default' | 'outlined' | 'elevated';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hoverable?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}

interface CardHeaderProps {
  children: React.ReactNode;
}

interface CardTitleProps {
  children: React.ReactNode;
}

interface CardContentProps {
  children: React.ReactNode;
}

interface CardFooterProps {
  children: React.ReactNode;
}
```

**Examples:**

```typescript
import { Card } from '../Base/Card';

// Basic card
<Card>
  <Card.Header>
    <Card.Title>כותרת הכרטיס</Card.Title>
  </Card.Header>
  <Card.Content>
    <p>תוכן הכרטיס</p>
  </Card.Content>
</Card>

// Elevated card with footer
<Card variant="elevated">
  <Card.Header>
    <Card.Title>מודול סיכום</Card.Title>
  </Card.Header>
  <Card.Content>
    <p>סטטיסטיקות ומידע</p>
  </Card.Content>
  <Card.Footer>
    <Button variant="primary">פעולה</Button>
  </Card.Footer>
</Card>

// Clickable card
<Card hoverable onClick={() => navigate('/module/overview')}>
  <Card.Content>
    <h3>מודול סקירה כללית</h3>
    <p>לחץ לפתיחה</p>
  </Card.Content>
</Card>

// Card with custom padding
<Card padding="lg">
  <Card.Content>
    <p>תוכן עם ריפוד גדול</p>
  </Card.Content>
</Card>
```

---

### 1.3 Badge

**File:** `src/components/Base/Badge.tsx`

**Purpose:** Small label for status, tags, or counts.

**Props:**

```typescript
interface BadgeProps {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}
```

**Examples:**

```typescript
import { Badge } from '../Base/Badge';

// Status badges
<Badge variant="success">הושלם</Badge>
<Badge variant="warning">בהמתנה</Badge>
<Badge variant="danger">נדחה</Badge>
<Badge variant="info">חדש</Badge>

// Size variants
<Badge size="sm">קטן</Badge>
<Badge size="md">בינוני</Badge>
<Badge size="lg">גדול</Badge>

// In a card header
<Card.Header>
  <div className="flex items-center justify-between">
    <Card.Title>מודול מכירות</Card.Title>
    <Badge variant="success">הושלם</Badge>
  </div>
</Card.Header>

// With count
<Badge variant="danger">{errorCount}</Badge>
```

---

### 1.4 Input

**File:** `src/components/Base/Input.tsx`

**Purpose:** Text input field with label, validation, and helper text.

**Props:**

```typescript
interface InputProps {
  label?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
  placeholder?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  dir?: 'rtl' | 'ltr';
}
```

**Examples:**

```typescript
import { Input } from '../Base/Input';
import { Search, Mail } from 'lucide-react';

// Basic input
<Input
  label="שם העסק"
  value={businessName}
  onChange={(e) => setBusinessName(e.target.value)}
  placeholder="הזן שם עסק..."
/>

// Required field with validation
<Input
  label="דוא״ל"
  type="email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  error={errors.email}
  required
/>

// Input with helper text
<Input
  label="מספר טלפון"
  type="tel"
  value={phone}
  onChange={(e) => setPhone(e.target.value)}
  helperText="פורמט: 050-1234567"
/>

// Input with icon
<Input
  label="חיפוש"
  value={searchTerm}
  onChange={(e) => setSearchTerm(e.target.value)}
  icon={<Search />}
  iconPosition="right"
  placeholder="חפש לקוח..."
/>

// Number input
<Input
  label="מספר עובדים"
  type="number"
  value={employeeCount}
  onChange={(e) => setEmployeeCount(e.target.value)}
  dir="ltr"
/>

// Disabled input
<Input
  label="מזהה פגישה"
  value={meetingId}
  onChange={() => {}}
  disabled
/>
```

---

### 1.5 Select

**File:** `src/components/Base/Select.tsx`

**Purpose:** Dropdown selection with search and custom options.

**Props:**

```typescript
interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps {
  label?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: SelectOption[];
  placeholder?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  disabled?: boolean;
  searchable?: boolean;
}
```

**Examples:**

```typescript
import { Select } from '../Base/Select';

// Basic select
<Select
  label="סוג עסק"
  value={businessType}
  onChange={(e) => setBusinessType(e.target.value)}
  options={[
    { value: 'b2b', label: 'B2B' },
    { value: 'b2c', label: 'B2C' },
    { value: 'both', label: 'שניהם' }
  ]}
  placeholder="בחר סוג עסק"
/>

// Required select with error
<Select
  label="תעשייה"
  value={industry}
  onChange={(e) => setIndustry(e.target.value)}
  options={industryOptions}
  error={errors.industry}
  required
/>

// Select with helper text
<Select
  label="גודל חברה"
  value={companySize}
  onChange={(e) => setCompanySize(e.target.value)}
  options={companySizeOptions}
  helperText="בחר את הקטגוריה המתאימה ביותר"
/>

// Searchable select
<Select
  label="מערכת CRM"
  value={crmSystem}
  onChange={(e) => setCrmSystem(e.target.value)}
  options={systemsDatabase.crm}
  searchable
/>

// Disabled option
<Select
  label="תכונה"
  value={feature}
  onChange={(e) => setFeature(e.target.value)}
  options={[
    { value: 'basic', label: 'בסיסי' },
    { value: 'pro', label: 'Pro', disabled: true },
    { value: 'enterprise', label: 'Enterprise' }
  ]}
/>
```

---

### 1.6 TextArea

**File:** `src/components/Base/TextArea.tsx`

**Purpose:** Multi-line text input with auto-resize and character count.

**Props:**

```typescript
interface TextAreaProps {
  label?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  disabled?: boolean;
  rows?: number;
  maxLength?: number;
  showCharCount?: boolean;
  autoResize?: boolean;
}
```

**Examples:**

```typescript
import { TextArea } from '../Base/TextArea';

// Basic textarea
<TextArea
  label="תיאור העסק"
  value={description}
  onChange={(e) => setDescription(e.target.value)}
  rows={4}
  placeholder="תאר את העסק שלך..."
/>

// With character count
<TextArea
  label="הערות"
  value={notes}
  onChange={(e) => setNotes(e.target.value)}
  maxLength={500}
  showCharCount
/>

// Auto-resizing textarea
<TextArea
  label="אתגרים עסקיים"
  value={challenges}
  onChange={(e) => setChallenges(e.target.value)}
  autoResize
  placeholder="תאר את האתגרים המרכזיים..."
/>

// With validation
<TextArea
  label="מטרות"
  value={goals}
  onChange={(e) => setGoals(e.target.value)}
  error={errors.goals}
  required
  helperText="לפחות 50 תווים"
/>
```

---

### 1.7 ProgressBar

**File:** `src/components/Base/ProgressBar.tsx`

**Purpose:** Visual progress indicator with percentage and variants.

**Props:**

```typescript
interface ProgressBarProps {
  value: number; // 0-100
  max?: number;
  variant?: 'default' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  label?: string;
  animated?: boolean;
}
```

**Examples:**

```typescript
import { ProgressBar } from '../Base/ProgressBar';

// Basic progress bar
<ProgressBar value={45} />

// With label
<ProgressBar
  value={75}
  showLabel
  label="התקדמות"
/>

// Size variants
<ProgressBar value={30} size="sm" />
<ProgressBar value={60} size="md" />
<ProgressBar value={90} size="lg" />

// Color variants
<ProgressBar value={25} variant="danger" />
<ProgressBar value={50} variant="warning" />
<ProgressBar value={100} variant="success" />

// Animated progress
<ProgressBar
  value={progress}
  animated
  showLabel
/>

// Module completion progress
<div className="space-y-2">
  <div className="flex justify-between">
    <span>מודול סקירה</span>
    <span>{overviewProgress}%</span>
  </div>
  <ProgressBar value={overviewProgress} variant="success" />
</div>
```

---

### 1.8 LoadingSkeleton

**File:** `src/components/Base/LoadingSkeleton.tsx`

**Purpose:** Placeholder component while content is loading.

**Props:**

```typescript
interface LoadingSkeletonProps {
  variant?: 'text' | 'circular' | 'rectangular' | 'card' | 'avatar';
  width?: string | number;
  height?: string | number;
  count?: number;
  className?: string;
}
```

**Examples:**

```typescript
import { LoadingSkeleton } from '../Base/LoadingSkeleton';

// Text loading
<LoadingSkeleton variant="text" count={3} />

// Card loading
<LoadingSkeleton variant="card" count={6} />

// Avatar loading
<LoadingSkeleton variant="avatar" />

// Custom dimensions
<LoadingSkeleton
  variant="rectangular"
  width="100%"
  height={200}
/>

// Loading state in component
{isLoading ? (
  <LoadingSkeleton variant="card" count={9} />
) : (
  <ModuleList modules={modules} />
)}

// Table row skeleton
<LoadingSkeleton variant="rectangular" width="100%" height={60} count={5} />
```

---

## Layer 2: Layout Components

### 2.1 AppLayout

**File:** `src/components/Layout/AppLayout.tsx`

**Purpose:** Main application layout with sidebar, breadcrumbs, and RTL/LTR support.

**Props:**

```typescript
interface AppLayoutProps {
  children: React.ReactNode;
}
```

**Usage:**

```typescript
import { AppLayout } from './Layout/AppLayout';

export const AppContent = () => {
  return (
    <AppLayout>
      <Routes>
        {/* All application routes */}
      </Routes>
    </AppLayout>
  );
};
```

**Features:**
- Automatic sidebar navigation
- Breadcrumbs for current path
- Quick actions bar
- RTL/LTR switching based on phase
- Responsive layout (collapses on mobile)

---

### 2.2 GlobalNavigation

**File:** `src/components/Layout/GlobalNavigation.tsx`

**Purpose:** Sidebar navigation with phase-aware menu items.

**Props:**

```typescript
interface GlobalNavigationProps {
  // No props required - reads from useMeetingStore
}
```

**Features:**
- Phase 1: Discovery modules (9 modules)
- Phase 2: Implementation spec sections
- Phase 3: Development dashboard views
- Active route highlighting
- Collapsible on mobile
- Hebrew/English labels based on phase

---

### 2.3 Breadcrumbs

**File:** `src/components/Layout/Breadcrumbs.tsx`

**Purpose:** Show current location in app hierarchy.

**Props:**

```typescript
interface BreadcrumbsProps {
  // No props required - reads from useLocation
}
```

**Example Output:**

```
לקוחות > פגישת גילוי > מודול מכירות
Clients > Discovery Meeting > Sales Module
```

---

### 2.4 QuickActions

**File:** `src/components/Layout/QuickActions.tsx`

**Purpose:** Floating action bar for common operations.

**Props:**

```typescript
interface QuickActionsProps {
  // No props required - context-aware actions
}
```

**Features:**
- Save meeting
- Export PDF
- Export Excel
- Share meeting
- Settings
- Context-aware (different actions per phase)

---

## Layer 3: Feedback Components

### 3.1 AutoSaveIndicator

**File:** `src/components/Feedback/AutoSaveIndicator.tsx`

**Purpose:** Visual feedback for auto-save status.

**Props:**

```typescript
interface AutoSaveIndicatorProps {
  // No props required - reads from useMeetingStore
}
```

**States:**
- Saving: Spinner icon + "שומר..."
- Saved: Checkmark icon + "נשמר"
- Error: X icon + "שגיאה בשמירה"

**Usage:**

```typescript
import { AutoSaveIndicator } from '../Feedback/AutoSaveIndicator';

// Add to AppContent
<AppLayout>
  {/* Routes */}
  <AutoSaveIndicator />
</AppLayout>
```

---

### 3.2 LoadingSpinner

**File:** `src/components/Feedback/LoadingSpinner.tsx`

**Purpose:** Animated loading spinner.

**Props:**

```typescript
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
}
```

**Examples:**

```typescript
import { LoadingSpinner } from '../Feedback/LoadingSpinner';

// Default spinner
<LoadingSpinner />

// Large spinner
<LoadingSpinner size="lg" />

// Custom color
<LoadingSpinner color="blue" />

// Full page loading
<div className="flex items-center justify-center h-screen">
  <LoadingSpinner size="lg" />
</div>
```

---

### 3.3 PageTransition

**File:** `src/components/Feedback/PageTransition.tsx`

**Purpose:** Smooth page transitions using framer-motion.

**Props:**

```typescript
interface PageTransitionProps {
  children: React.ReactNode;
}
```

**Usage:**

```typescript
import { PageTransition } from '../Feedback/PageTransition';

// Wrap page content
<PageTransition>
  <Dashboard />
</PageTransition>

// In wizard
<PageTransition key={currentStep}>
  <WizardStep step={currentStep} />
</PageTransition>
```

---

### 3.4 Toast System

**File:** `src/utils/toast.tsx`

**Purpose:** Global notification system.

**API:**

```typescript
toast.success({ title, message?, duration? });
toast.error({ title, message?, duration? });
toast.warning({ title, message?, duration? });
toast.info({ title, message?, duration? });
toast.dismiss(id);
toast.clear();
```

**Examples:**

```typescript
import { toast } from '../utils/toast';

// Success notification
toast.success({
  title: 'נשמר בהצלחה!',
  message: 'השינויים נשמרו במערכת',
  duration: 3000
});

// Error notification
toast.error({
  title: 'שגיאה בשמירה',
  message: error.message,
  duration: 5000
});

// Warning notification
toast.warning({
  title: 'אזהרה',
  message: 'יש לבדוק את הנתונים',
});

// Info notification
toast.info({
  title: 'מידע',
  message: 'הפגישה תתחיל בעוד 5 דקות'
});

// Dismiss specific toast
const toastId = toast.success({ title: 'פעולה הושלמה' });
setTimeout(() => toast.dismiss(toastId), 2000);

// Clear all toasts
toast.clear();
```

---

## Layer 4: Form & Validation Components

### 4.1 Form Validation Hook

**File:** `src/hooks/useFormValidation.ts`

**Purpose:** Form validation logic with error handling.

**Usage:**

```typescript
import { useFormValidation } from '../hooks/useFormValidation';

const validationRules = {
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'דוא״ל לא תקין'
  },
  phone: {
    required: true,
    pattern: /^05\d-?\d{7}$/,
    message: 'מספר טלפון לא תקין'
  },
  businessName: {
    required: true,
    minLength: 2,
    message: 'שם עסק חייב להכיל לפחות 2 תווים'
  }
};

const { values, errors, handleChange, handleSubmit, isValid } = useFormValidation(
  initialValues,
  validationRules
);

<form onSubmit={handleSubmit(onSubmit)}>
  <Input
    label="דוא״ל"
    name="email"
    value={values.email}
    onChange={handleChange}
    error={errors.email}
  />
  <Button type="submit" disabled={!isValid}>
    שלח
  </Button>
</form>
```

---

## Layer 5: Domain-Specific Components

### 5.1 ModuleProgressCard

**File:** `src/components/Progress/ModuleProgressCard.tsx`

**Purpose:** Card showing module completion status.

**Props:**

```typescript
interface ModuleProgressCardProps {
  title: string;
  description: string;
  progress: number; // 0-100
  status: 'not_started' | 'in_progress' | 'completed';
  icon?: React.ReactNode;
  onClick: () => void;
}
```

**Example:**

```typescript
import { ModuleProgressCard } from '../Progress/ModuleProgressCard';
import { BarChart3 } from 'lucide-react';

<ModuleProgressCard
  title="מודול מכירות"
  description="ניהול ליידים ומכירות"
  progress={75}
  status="in_progress"
  icon={<BarChart3 />}
  onClick={() => navigate('/module/leadsAndSales')}
/>
```

---

### 5.2 SystemSpecProgress

**File:** `src/components/Phase2/SystemSpecProgress.tsx`

**Purpose:** Progress card for Phase 2 specifications.

**Props:**

```typescript
interface SystemSpecProgressProps {
  title: string;
  completed: number;
  total: number;
  type: 'system' | 'integration' | 'agent';
}
```

**Example:**

```typescript
import { SystemSpecProgress } from '../Phase2/SystemSpecProgress';

<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
  <SystemSpecProgress
    title="Systems"
    completed={3}
    total={5}
    type="system"
  />
  <SystemSpecProgress
    title="Integrations"
    completed={2}
    total={4}
    type="integration"
  />
  <SystemSpecProgress
    title="AI Agents"
    completed={1}
    total={2}
    type="agent"
  />
</div>
```

---

### 5.3 IntegrationFlowToolbar

**File:** `src/components/Phase2/IntegrationFlowToolbar.tsx`

**Purpose:** Toolbar for integration flow builder actions.

**Props:**

```typescript
interface IntegrationFlowToolbarProps {
  onAddNode: (type: NodeType) => void;
  onSave: () => void;
  onExport: () => void;
  onValidate: () => void;
}
```

**Example:**

```typescript
import { IntegrationFlowToolbar } from '../Phase2/IntegrationFlowToolbar';

<IntegrationFlowToolbar
  onAddNode={(type) => handleAddNode(type)}
  onSave={handleSave}
  onExport={handleExport}
  onValidate={handleValidate}
/>
```

---

### 5.4 TaskQuickFilters

**File:** `src/components/Phase3/TaskQuickFilters.tsx`

**Purpose:** Quick filter buttons for task dashboard.

**Props:**

```typescript
interface TaskQuickFiltersProps {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
  taskCounts: {
    all: number;
    todo: number;
    inProgress: number;
    blocked: number;
    done: number;
  };
}
```

**Example:**

```typescript
import { TaskQuickFilters } from '../Phase3/TaskQuickFilters';

<TaskQuickFilters
  activeFilter={activeFilter}
  onFilterChange={setActiveFilter}
  taskCounts={{
    all: 45,
    todo: 12,
    inProgress: 8,
    blocked: 3,
    done: 22
  }}
/>
```

---

### 5.5 WizardStepNavigation

**File:** `src/components/Navigation/WizardStepNavigation.tsx`

**Purpose:** Step indicator for wizard flow.

**Props:**

```typescript
interface WizardStepNavigationProps {
  currentStep: number;
  totalSteps: number;
  completedSteps: number[];
  onStepClick: (step: number) => void;
  steps: Array<{
    id: number;
    title: string;
    description?: string;
  }>;
}
```

**Example:**

```typescript
import { WizardStepNavigation } from '../Navigation/WizardStepNavigation';

<WizardStepNavigation
  currentStep={3}
  totalSteps={9}
  completedSteps={[1, 2]}
  onStepClick={handleStepClick}
  steps={wizardSteps}
/>
```

---

## Layer 6: Integration Components

### 6.1 Complete Integration Example

Here's a complete example showing how all layers work together:

```typescript
import React, { useState } from 'react';
import { AppLayout } from '../Layout/AppLayout';
import { Card } from '../Base/Card';
import { Input } from '../Base/Input';
import { Select } from '../Base/Select';
import { TextArea } from '../Base/TextArea';
import { Button } from '../Base/Button';
import { Badge } from '../Base/Badge';
import { ProgressBar } from '../Base/ProgressBar';
import { LoadingSkeleton } from '../Base/LoadingSkeleton';
import { PageTransition } from '../Feedback/PageTransition';
import { toast } from '../../utils/toast';
import { useMeetingStore } from '../../store/useMeetingStore';

export const ExampleModule = () => {
  const { currentMeeting, updateModule } = useMeetingStore();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    description: ''
  });
  const [errors, setErrors] = useState({});

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateModule('example', formData);
      toast.success({
        title: 'נשמר בהצלחה!',
        message: 'הנתונים נשמרו במערכת'
      });
    } catch (error) {
      toast.error({
        title: 'שגיאה',
        message: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSkeleton variant="card" count={3} />;
  }

  return (
    <PageTransition>
      <div className="p-6 space-y-6">
        {/* Header Card */}
        <Card variant="elevated">
          <Card.Header>
            <div className="flex items-center justify-between">
              <Card.Title>דוגמה למודול</Card.Title>
              <Badge variant="success">פעיל</Badge>
            </div>
          </Card.Header>
          <Card.Content>
            <ProgressBar value={65} showLabel label="התקדמות" />
          </Card.Content>
        </Card>

        {/* Form Card */}
        <Card>
          <Card.Header>
            <Card.Title>פרטי מודול</Card.Title>
          </Card.Header>
          <Card.Content>
            <div className="space-y-4">
              <Input
                label="שם"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                error={errors.name}
                required
              />

              <Select
                label="סוג"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                options={[
                  { value: 'type1', label: 'סוג 1' },
                  { value: 'type2', label: 'סוג 2' }
                ]}
                required
              />

              <TextArea
                label="תיאור"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                maxLength={500}
                showCharCount
              />
            </div>
          </Card.Content>
          <Card.Footer>
            <div className="flex gap-2">
              <Button variant="primary" onClick={handleSave} loading={loading}>
                שמור
              </Button>
              <Button variant="outline" onClick={() => setFormData({})}>
                אפס
              </Button>
            </div>
          </Card.Footer>
        </Card>
      </div>
    </PageTransition>
  );
};
```

---

## Summary

This guide covers all 47 components across 6 layers:

**Layer 1 (8 components):** Button, Card, Badge, Input, Select, TextArea, ProgressBar, LoadingSkeleton
**Layer 2 (4 components):** AppLayout, GlobalNavigation, Breadcrumbs, QuickActions
**Layer 3 (4 components):** AutoSaveIndicator, LoadingSpinner, PageTransition, Toast
**Layer 4 (1 component):** Form Validation Hook
**Layer 5 (5 components):** ModuleProgressCard, SystemSpecProgress, IntegrationFlowToolbar, TaskQuickFilters, WizardStepNavigation
**Layer 6 (Integration):** Complete integration patterns

For migration examples, see **MIGRATION_GUIDE.md**.
For quick start, see **QUICK_START.md**.
