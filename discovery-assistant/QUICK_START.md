# Discovery Assistant - Quick Start Guide

## 🚀 Get Started in 5 Minutes

This guide will get you up and running with the new UX system in 5 minutes.

## Table of Contents

1. [Installation](#installation)
2. [Your First Component](#your-first-component)
3. [Common Recipes](#common-recipes)
4. [Cheat Sheet](#cheat-sheet)
5. [Next Steps](#next-steps)

---

## Installation

### 1. Install Dependencies

```bash
cd discovery-assistant
npm install framer-motion react-hot-toast
```

### 2. Verify Installation

```bash
npm run build:typecheck
```

If successful, you're ready to go!

---

## Your First Component

Let's create a simple module component using the new UX system.

### Step 1: Create the Component File

```typescript
// src/components/Modules/Example/ExampleModule.tsx
import React, { useState } from 'react';
import { Card } from '../../Base/Card';
import { Input } from '../../Base/Input';
import { Button } from '../../Base/Button';
import { toast } from '../../../utils/toast';
import { useMeetingStore } from '../../../store/useMeetingStore';

export const ExampleModule = () => {
  const { updateModule } = useMeetingStore();
  const [name, setName] = useState('');

  const handleSave = () => {
    updateModule('example', { name });
    toast.success({ title: 'נשמר בהצלחה!' });
  };

  return (
    <div className="p-6">
      <Card>
        <Card.Header>
          <Card.Title>מודול לדוגמה</Card.Title>
        </Card.Header>
        <Card.Content>
          <Input
            label="שם"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="הזן שם..."
            required
          />
        </Card.Content>
        <Card.Footer>
          <Button variant="primary" onClick={handleSave}>
            שמור
          </Button>
        </Card.Footer>
      </Card>
    </div>
  );
};
```

### Step 2: Add Route

```typescript
// src/components/AppContent.tsx
import { ExampleModule } from './Modules/Example/ExampleModule';

<Route path="/module/example" element={<ExampleModule />} />
```

### Step 3: Test It

```bash
npm run dev
```

Navigate to `http://localhost:5173/module/example`

**That's it!** You've created your first component with:
- Professional card layout
- Validated input field
- Save button
- Toast notification
- Auto-save integration

---

## Common Recipes

### Recipe 1: Form with Validation

```typescript
import { Card } from '../Base/Card';
import { Input } from '../Base/Input';
import { Select } from '../Base/Select';
import { Button } from '../Base/Button';
import { toast } from '../../utils/toast';

export const FormExample = () => {
  const [formData, setFormData] = useState({
    name: '',
    type: ''
  });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = 'שדה חובה';
    if (!formData.type) newErrors.type = 'שדה חובה';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      toast.success({ title: 'טופס נשלח!' });
    } else {
      toast.error({ title: 'שגיאת ולידציה' });
    }
  };

  return (
    <Card>
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
            error={errors.type}
            required
          />
        </div>
      </Card.Content>
      <Card.Footer>
        <Button variant="primary" onClick={handleSubmit}>
          שלח
        </Button>
      </Card.Footer>
    </Card>
  );
};
```

---

### Recipe 2: List with Loading State

```typescript
import { Card } from '../Base/Card';
import { Badge } from '../Base/Badge';
import { LoadingSkeleton } from '../Base/LoadingSkeleton';

export const ListExample = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadItems().then(data => {
      setItems(data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <LoadingSkeleton variant="card" count={3} />;
  }

  return (
    <div className="space-y-4">
      {items.map(item => (
        <Card key={item.id} hoverable onClick={() => handleClick(item)}>
          <Card.Content>
            <div className="flex items-center justify-between">
              <h3>{item.name}</h3>
              <Badge variant={item.status === 'active' ? 'success' : 'default'}>
                {item.status}
              </Badge>
            </div>
          </Card.Content>
        </Card>
      ))}
    </div>
  );
};
```

---

### Recipe 3: Dashboard with Progress Cards

```typescript
import { ModuleProgressCard } from '../Progress/ModuleProgressCard';
import { BarChart3, Users, Settings } from 'lucide-react';

export const DashboardExample = () => {
  const modules = [
    {
      id: 'sales',
      title: 'מכירות',
      description: 'ניהול ליידים ומכירות',
      progress: 75,
      status: 'in_progress',
      icon: <BarChart3 />
    },
    {
      id: 'customers',
      title: 'לקוחות',
      description: 'ניהול שירות לקוחות',
      progress: 100,
      status: 'completed',
      icon: <Users />
    },
    {
      id: 'settings',
      title: 'הגדרות',
      description: 'הגדרות מערכת',
      progress: 0,
      status: 'not_started',
      icon: <Settings />
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {modules.map(module => (
        <ModuleProgressCard
          key={module.id}
          title={module.title}
          description={module.description}
          progress={module.progress}
          status={module.status}
          icon={module.icon}
          onClick={() => navigate(`/module/${module.id}`)}
        />
      ))}
    </div>
  );
};
```

---

### Recipe 4: Multi-Step Form (Wizard)

```typescript
import { WizardStepNavigation } from '../Navigation/WizardStepNavigation';
import { PageTransition } from '../Feedback/PageTransition';
import { Button } from '../Base/Button';

export const WizardExample = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState([]);

  const steps = [
    { id: 1, title: 'שלב 1', content: <Step1 /> },
    { id: 2, title: 'שלב 2', content: <Step2 /> },
    { id: 3, title: 'שלב 3', content: <Step3 /> }
  ];

  const handleNext = () => {
    setCompletedSteps([...completedSteps, currentStep]);
    setCurrentStep(currentStep + 1);
  };

  return (
    <div className="flex">
      <WizardStepNavigation
        currentStep={currentStep}
        totalSteps={steps.length}
        completedSteps={completedSteps}
        onStepClick={setCurrentStep}
        steps={steps}
      />

      <PageTransition key={currentStep}>
        <div className="flex-1 p-6">
          {steps[currentStep].content}
          <Button variant="primary" onClick={handleNext}>
            הבא
          </Button>
        </div>
      </PageTransition>
    </div>
  );
};
```

---

### Recipe 5: Data Table with Actions

```typescript
import { Card } from '../Base/Card';
import { Badge } from '../Base/Badge';
import { Button } from '../Base/Button';
import { toast } from '../../utils/toast';

export const TableExample = () => {
  const [data, setData] = useState([]);

  const handleDelete = (id) => {
    setData(data.filter(item => item.id !== id));
    toast.success({ title: 'נמחק בהצלחה' });
  };

  return (
    <Card>
      <Card.Header>
        <Card.Title>רשימת פריטים</Card.Title>
      </Card.Header>
      <Card.Content>
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-right py-2">שם</th>
              <th className="text-right py-2">סטטוס</th>
              <th className="text-right py-2">פעולות</th>
            </tr>
          </thead>
          <tbody>
            {data.map(item => (
              <tr key={item.id} className="border-b hover:bg-gray-50">
                <td className="py-2">{item.name}</td>
                <td className="py-2">
                  <Badge variant={item.status === 'active' ? 'success' : 'default'}>
                    {item.status}
                  </Badge>
                </td>
                <td className="py-2">
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDelete(item.id)}
                  >
                    מחק
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card.Content>
    </Card>
  );
};
```

---

## Cheat Sheet

### Import Quick Reference

```typescript
// Base Components
import { Button } from '../Base/Button';
import { Card } from '../Base/Card';
import { Badge } from '../Base/Badge';
import { Input } from '../Base/Input';
import { Select } from '../Base/Select';
import { TextArea } from '../Base/TextArea';
import { ProgressBar } from '../Base/ProgressBar';
import { LoadingSkeleton } from '../Base/LoadingSkeleton';

// Layout Components
import { AppLayout } from '../Layout/AppLayout';
import { GlobalNavigation } from '../Layout/GlobalNavigation';
import { Breadcrumbs } from '../Layout/Breadcrumbs';

// Feedback Components
import { AutoSaveIndicator } from '../Feedback/AutoSaveIndicator';
import { LoadingSpinner } from '../Feedback/LoadingSpinner';
import { PageTransition } from '../Feedback/PageTransition';

// Domain Components
import { ModuleProgressCard } from '../Progress/ModuleProgressCard';
import { WizardStepNavigation } from '../Navigation/WizardStepNavigation';

// Utilities
import { toast } from '../../utils/toast';
import { useMeetingStore } from '../../store/useMeetingStore';
```

---

### Component Props Quick Reference

**Button:**
```typescript
<Button variant="primary" | "secondary" | "outline" | "ghost" | "danger">
```

**Card:**
```typescript
<Card variant="default" | "outlined" | "elevated" padding="sm" | "md" | "lg">
```

**Badge:**
```typescript
<Badge variant="default" | "success" | "warning" | "danger" | "info">
```

**Input:**
```typescript
<Input label="" value="" onChange="" error="" required />
```

**Select:**
```typescript
<Select label="" value="" onChange="" options={[]} required />
```

**ProgressBar:**
```typescript
<ProgressBar value={0-100} variant="default" | "success" | "warning" | "danger" />
```

**Toast:**
```typescript
toast.success({ title, message?, duration? })
toast.error({ title, message?, duration? })
toast.warning({ title, message?, duration? })
toast.info({ title, message?, duration? })
```

---

### Color Reference

**Variants:**
- `default` - Gray
- `success` - Green
- `warning` - Yellow
- `danger` - Red
- `info` - Blue

**Text Colors:**
- `text-gray-600` - Default text
- `text-green-600` - Success
- `text-yellow-600` - Warning
- `text-red-600` - Error
- `text-blue-600` - Info

---

### Spacing Reference

```typescript
// Padding
className="p-4"    // 1rem
className="p-6"    // 1.5rem

// Margin
className="mb-4"   // margin-bottom: 1rem
className="mt-6"   // margin-top: 1.5rem

// Gap (flexbox/grid)
className="gap-4"  // 1rem gap
className="gap-6"  // 1.5rem gap

// Space-y (vertical spacing)
className="space-y-4"  // 1rem vertical spacing between children
```

---

## Next Steps

### 1. Explore Documentation

- **INTEGRATION_GUIDE.md** - Full integration instructions
- **COMPONENT_USAGE.md** - Detailed component documentation
- **MIGRATION_GUIDE.md** - Migration patterns for existing components

### 2. Try the Examples

Run the development server and explore existing modules:

```bash
npm run dev
```

Visit:
- Dashboard: `http://localhost:5173/dashboard`
- Wizard: `http://localhost:5173/wizard`
- Modules: `http://localhost:5173/module/overview`

### 3. Customize Components

All components are in `src/components/Base/`. You can:
- Customize colors in `src/styles/designTokens.ts`
- Modify component variants
- Add new component variants

### 4. Build Your Feature

Use the recipes above to build your feature quickly:

1. Choose a recipe that matches your needs
2. Copy the code
3. Customize for your use case
4. Test and deploy

### 5. Join the Community

- Report issues or suggestions
- Share your components
- Contribute improvements

---

## Common Questions

### Q: Do I need to migrate all components at once?

**A:** No! Migration is incremental. Old and new components can coexist.

### Q: What if I want to customize a component?

**A:** All components accept `className` prop for custom styling. Example:

```typescript
<Button variant="primary" className="custom-class">
  Click me
</Button>
```

### Q: How do I handle errors?

**A:** Use the `error` prop on form components and `toast.error()` for notifications:

```typescript
<Input
  label="Email"
  error={errors.email}
  value={email}
  onChange={(e) => setEmail(e.target.value)}
/>

if (!isValid) {
  toast.error({ title: 'Validation Error' });
}
```

### Q: Can I use these components outside modules?

**A:** Yes! These are general-purpose components that can be used anywhere in the app.

### Q: How do I test my component?

**A:** Run `npm test` for unit tests or `npm run test:e2e` for E2E tests.

---

## Help & Support

**Documentation:**
- INTEGRATION_GUIDE.md
- COMPONENT_USAGE.md
- MIGRATION_GUIDE.md
- TESTING_GUIDE.md

**TypeScript:**
```bash
npm run build:typecheck
```

**Browser Console:**
Check for errors and warnings

**Hot Reload:**
Changes auto-refresh in development mode

---

## Summary

You now know how to:
- ✅ Install dependencies
- ✅ Create components with the new system
- ✅ Use common recipes
- ✅ Import and use components
- ✅ Handle forms and validation
- ✅ Show loading states
- ✅ Display notifications

**Next:** Check out the COMPONENT_USAGE.md for detailed documentation on all 47 components!

Happy coding! 🚀
