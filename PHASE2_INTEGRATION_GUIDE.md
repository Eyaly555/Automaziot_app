# Phase 2 Integration Guide: Using Service-to-System Mapping

**Purpose:** Filter Phase 2 views to show only systems, integrations, and AI agents needed for client's purchased services.

---

## Quick Start

### 1. Import the Helper Functions

```typescript
import {
  getRequiredSystemsForServices,
  getRequiredIntegrationsForServices,
  getRequiredAIAgentsForServices,
  getAggregatedRequirements
} from '@/config/serviceToSystemMapping';
```

### 2. Get Client's Purchased Services

```typescript
// In your Phase 2 component
const purchasedServiceIds = meeting.proposal?.selectedServices?.map(s => s.id) || [];

// Example: ['auto-lead-response', 'ai-sales-agent', 'impl-crm']
```

### 3. Get Required Technical Components

```typescript
const requiredSystems = getRequiredSystemsForServices(purchasedServiceIds);
// Returns: ['crm', 'email', 'website', 'calendar', 'messaging']

const requiredIntegrations = getRequiredIntegrationsForServices(purchasedServiceIds);
// Returns: ['website_to_crm', 'crm_to_email', 'ai_to_crm', ...]

const requiredAIAgents = getRequiredAIAgentsForServices(purchasedServiceIds);
// Returns: ['sales', 'scheduling']
```

---

## Component Integration Examples

### SystemDeepDive.tsx

**Before (showing all Phase 1 systems):**
```typescript
const allSystems = meeting.modules.systems.detailedSystems || [];

return (
  <div>
    {allSystems.map(system => (
      <SystemCard key={system.id} system={system} />
    ))}
  </div>
);
```

**After (showing only required systems):**
```typescript
import { getRequiredSystemsForServices } from '@/config/serviceToSystemMapping';

const purchasedServiceIds = meeting.proposal?.selectedServices?.map(s => s.id) || [];
const requiredSystemCategories = getRequiredSystemsForServices(purchasedServiceIds);

// Filter Phase 1 systems to show only required ones
const relevantSystems = (meeting.modules.systems.detailedSystems || []).filter(
  system => requiredSystemCategories.includes(system.category as any)
);

return (
  <div>
    <Alert className="mb-4">
      <Info className="h-4 w-4" />
      <AlertDescription>
        Showing {relevantSystems.length} systems needed for your {purchasedServiceIds.length} purchased services.
      </AlertDescription>
    </Alert>

    {relevantSystems.map(system => (
      <SystemCard key={system.id} system={system} />
    ))}

    {/* Show missing systems warning */}
    {requiredSystemCategories.length > relevantSystems.length && (
      <Alert className="mt-4" variant="warning">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Some required systems are not configured in Phase 1.
          Required: {requiredSystemCategories.join(', ')}
        </AlertDescription>
      </Alert>
    )}
  </div>
);
```

---

### IntegrationFlowBuilder.tsx

**Filter integrations by purchased services:**

```typescript
import { getRequiredIntegrationsForServices } from '@/config/serviceToSystemMapping';

const purchasedServiceIds = meeting.proposal?.selectedServices?.map(s => s.id) || [];
const requiredIntegrations = getRequiredIntegrationsForServices(purchasedServiceIds);

// Filter existing integration flows
const relevantFlows = (meeting.implementationSpec?.integrations || []).filter(
  integration => {
    // Check if this integration type is required
    const integrationKey = `${integration.sourceSystem}_to_${integration.targetSystem}`;
    return requiredIntegrations.some(req => req.includes(integrationKey));
  }
);

return (
  <div>
    <div className="mb-4">
      <Badge variant="secondary">
        {requiredIntegrations.length} integrations needed
      </Badge>
    </div>

    {/* Show list of required integration types */}
    <Alert className="mb-4">
      <AlertDescription>
        <strong>Required Integrations:</strong>
        <ul className="mt-2 list-disc list-inside">
          {requiredIntegrations.map(int => (
            <li key={int}>{int.replace(/_/g, ' → ').toUpperCase()}</li>
          ))}
        </ul>
      </AlertDescription>
    </Alert>

    {/* Show existing flows */}
    {relevantFlows.map(flow => (
      <IntegrationFlowCard key={flow.id} flow={flow} />
    ))}

    {/* Show create integration buttons for missing ones */}
    <CreateIntegrationSection requiredIntegrations={requiredIntegrations} />
  </div>
);
```

---

### AIAgentDetailedSpec.tsx

**Filter AI agents by purchased services:**

```typescript
import { getRequiredAIAgentsForServices } from '@/config/serviceToSystemMapping';

const purchasedServiceIds = meeting.proposal?.selectedServices?.map(s => s.id) || [];
const requiredAIAgents = getRequiredAIAgentsForServices(purchasedServiceIds);

// Only show AI agent specs if AI agents are needed
if (requiredAIAgents.length === 0) {
  return (
    <Alert>
      <Info className="h-4 w-4" />
      <AlertDescription>
        Your selected services don't require AI agents. This section can be skipped.
      </AlertDescription>
    </Alert>
  );
}

// Filter AI specs to show only required agent types
const relevantAISpecs = (meeting.implementationSpec?.aiAgents || []).filter(
  agent => requiredAIAgents.includes(agent.department as any)
);

return (
  <div>
    <Alert className="mb-4">
      <Bot className="h-4 w-4" />
      <AlertDescription>
        Your services require {requiredAIAgents.length} AI agent type(s): {requiredAIAgents.join(', ')}
      </AlertDescription>
    </Alert>

    {requiredAIAgents.map(agentType => (
      <AIAgentSpecBuilder
        key={agentType}
        agentType={agentType}
        existingSpec={relevantAISpecs.find(s => s.department === agentType)}
      />
    ))}
  </div>
);
```

---

### ImplementationSpecDashboard.tsx

**Show overview with service-based filtering:**

```typescript
import { getAggregatedRequirements } from '@/config/serviceToSystemMapping';

const purchasedServiceIds = meeting.proposal?.selectedServices?.map(s => s.id) || [];
const requirements = getAggregatedRequirements(purchasedServiceIds);

return (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    {/* Systems Card */}
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Server className="mr-2 h-5 w-5" />
          Systems
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{requirements.totalSystems}</div>
        <p className="text-sm text-muted-foreground">
          systems to configure
        </p>
        <ul className="mt-4 space-y-1">
          {requirements.uniqueSystems.slice(0, 5).map(system => (
            <li key={system} className="text-sm">• {system}</li>
          ))}
          {requirements.totalSystems > 5 && (
            <li className="text-sm text-muted-foreground">
              + {requirements.totalSystems - 5} more
            </li>
          )}
        </ul>
      </CardContent>
    </Card>

    {/* Integrations Card */}
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Link className="mr-2 h-5 w-5" />
          Integrations
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{requirements.totalIntegrations}</div>
        <p className="text-sm text-muted-foreground">
          integrations to build
        </p>
      </CardContent>
    </Card>

    {/* AI Agents Card */}
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Bot className="mr-2 h-5 w-5" />
          AI Agents
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{requirements.totalAIAgents}</div>
        <p className="text-sm text-muted-foreground">
          AI agents to configure
        </p>
        {requirements.uniqueAIAgents.length > 0 && (
          <ul className="mt-4 space-y-1">
            {requirements.uniqueAIAgents.map(agent => (
              <li key={agent} className="text-sm">• {agent} AI</li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  </div>
);
```

---

## Smart Filtering Pattern

### Check if Service Category Needs Specific Component

```typescript
import { SERVICE_TO_SYSTEM_MAP } from '@/config/serviceToSystemMapping';

const purchasedServiceIds = meeting.proposal?.selectedServices?.map(s => s.id) || [];

// Check if any purchased service needs AI agents
const needsAI = purchasedServiceIds.some(
  serviceId => SERVICE_TO_SYSTEM_MAP[serviceId]?.aiAgents.length > 0
);

// Conditionally show AI section
{needsAI && <AIAgentSpecSection />}
```

### Show Missing Component Warning

```typescript
import { getRequiredSystemsForServices } from '@/config/serviceToSystemMapping';

const purchasedServiceIds = meeting.proposal?.selectedServices?.map(s => s.id) || [];
const requiredSystems = getRequiredSystemsForServices(purchasedServiceIds);

// Get systems configured in Phase 1
const configuredSystems = (meeting.modules.systems.detailedSystems || [])
  .map(s => s.category);

// Find missing systems
const missingSystems = requiredSystems.filter(
  req => !configuredSystems.includes(req)
);

{missingSystems.length > 0 && (
  <Alert variant="destructive">
    <AlertTriangle className="h-4 w-4" />
    <AlertTitle>Missing System Configuration</AlertTitle>
    <AlertDescription>
      The following systems are required but not configured in Phase 1:
      <ul className="mt-2 list-disc list-inside">
        {missingSystems.map(sys => (
          <li key={sys}>{sys}</li>
        ))}
      </ul>
      <Button className="mt-4" onClick={() => navigateToPhase1Systems()}>
        Configure Systems in Phase 1
      </Button>
    </AlertDescription>
  </Alert>
)}
```

---

## Service Selection Component

### Filter Phase 2 Navigation by Service Requirements

```typescript
import { getAggregatedRequirements } from '@/config/serviceToSystemMapping';

const purchasedServiceIds = meeting.proposal?.selectedServices?.map(s => s.id) || [];
const requirements = getAggregatedRequirements(purchasedServiceIds);

const phase2Steps = [
  {
    id: 'systems',
    label: 'System Deep Dive',
    required: requirements.totalSystems > 0,
    count: requirements.totalSystems
  },
  {
    id: 'integrations',
    label: 'Integration Flows',
    required: requirements.totalIntegrations > 0,
    count: requirements.totalIntegrations
  },
  {
    id: 'ai-agents',
    label: 'AI Agent Specs',
    required: requirements.totalAIAgents > 0,
    count: requirements.totalAIAgents
  },
  {
    id: 'acceptance',
    label: 'Acceptance Criteria',
    required: true, // Always required
    count: 0
  }
];

return (
  <nav>
    {phase2Steps.filter(step => step.required).map(step => (
      <Button
        key={step.id}
        variant={currentStep === step.id ? 'default' : 'ghost'}
        onClick={() => setCurrentStep(step.id)}
      >
        {step.label}
        {step.count > 0 && (
          <Badge className="ml-2" variant="secondary">
            {step.count}
          </Badge>
        )}
      </Button>
    ))}
  </nav>
);
```

---

## Validation Checks

### Ensure Phase 1 Has Required Data

```typescript
import { getRequiredSystemsForServices } from '@/config/serviceToSystemMapping';

const validatePhase1Requirements = (meeting: Meeting): ValidationResult => {
  const purchasedServiceIds = meeting.proposal?.selectedServices?.map(s => s.id) || [];
  const requiredSystems = getRequiredSystemsForServices(purchasedServiceIds);

  const errors: string[] = [];

  // Check if Phase 1 has detailed system info for required systems
  const configuredSystems = meeting.modules.systems.detailedSystems || [];

  requiredSystems.forEach(systemCategory => {
    const isConfigured = configuredSystems.some(s => s.category === systemCategory);
    if (!isConfigured) {
      errors.push(`System "${systemCategory}" is required but not configured in Phase 1`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    canProceedToPhase2: errors.length === 0
  };
};
```

---

## Best Practices

### 1. **Always Check for Empty Arrays**
```typescript
const purchasedServiceIds = meeting.proposal?.selectedServices?.map(s => s.id) || [];
// Never assume services exist
```

### 2. **Show User-Friendly Messages**
```typescript
{requiredSystems.length === 0 ? (
  <Alert>No systems required for selected services.</Alert>
) : (
  <SystemsList systems={requiredSystems} />
)}
```

### 3. **Provide Navigation Help**
```typescript
{missingSystems.length > 0 && (
  <Button onClick={() => router.push('/phase1/systems')}>
    Complete Phase 1 System Configuration
  </Button>
)}
```

### 4. **Use Descriptive Variable Names**
```typescript
// Good
const requiredSystemCategories = getRequiredSystemsForServices(serviceIds);
const configuredSystemsFromPhase1 = meeting.modules.systems.detailedSystems;

// Bad
const systems = getRequiredSystemsForServices(ids);
const data = meeting.modules.systems.detailedSystems;
```

---

## Testing Integration

### Test Component Rendering

```typescript
import { render } from '@testing-library/react';
import { getRequiredSystemsForServices } from '@/config/serviceToSystemMapping';

describe('SystemDeepDive with service filtering', () => {
  it('shows only systems required by purchased services', () => {
    const mockMeeting = {
      proposal: {
        selectedServices: [
          { id: 'auto-lead-response' },
          { id: 'ai-sales-agent' }
        ]
      },
      modules: {
        systems: {
          detailedSystems: [
            { id: '1', category: 'crm', specificSystem: 'Salesforce' },
            { id: '2', category: 'erp', specificSystem: 'SAP' }, // Not required
            { id: '3', category: 'email', specificSystem: 'SendGrid' }
          ]
        }
      }
    };

    const { container } = render(<SystemDeepDive meeting={mockMeeting} />);

    // Should show CRM and email, not ERP
    expect(container).toHaveTextContent('Salesforce');
    expect(container).toHaveTextContent('SendGrid');
    expect(container).not.toHaveTextContent('SAP');
  });
});
```

---

## Summary

### Integration Checklist

- [ ] Import helper functions from `serviceToSystemMapping.ts`
- [ ] Get purchased service IDs from `meeting.proposal.selectedServices`
- [ ] Use helper functions to get required components
- [ ] Filter Phase 1 data to show only required items
- [ ] Show warnings for missing required components
- [ ] Provide navigation to complete missing data
- [ ] Test with different service combinations
- [ ] Handle edge cases (no services, all services, etc.)

### Benefits

✅ **Cleaner UI** - Only shows relevant items
✅ **Faster Development** - Clear scope from selected services
✅ **Better UX** - Client isn't overwhelmed with unnecessary options
✅ **Accurate Estimates** - Scope matches purchased services exactly
✅ **Validation** - Can verify Phase 1 has required data

---

**Ready to integrate!** Start with `SystemDeepDive.tsx` as it's the most straightforward example.
