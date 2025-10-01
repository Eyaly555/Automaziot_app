# Quick Start Guide - Integration Visualizer

## Installation

The component is already set up and ready to use. ReactFlow is already installed in package.json.

## Import

```tsx
import { IntegrationVisualizer } from '@/components/Visualizations';
```

## Basic Example

```tsx
import { IntegrationVisualizer } from '@/components/Visualizations';
import { useMeetingStore } from '@/store/useMeetingStore';

export function SystemsIntegrationView() {
  const systems = useMeetingStore(
    state => state.currentMeeting?.modules.systems.detailedSystems || []
  );

  if (systems.length === 0) {
    return <div>אין מערכות להצגה</div>;
  }

  return (
    <div className="w-full">
      <h2 className="text-xl font-bold mb-4">מפת אינטגרציות</h2>
      <IntegrationVisualizer systems={systems} />
    </div>
  );
}
```

## Integration with Systems Module

Add this to the Systems Module to show integration architecture:

```tsx
// In src/components/Modules/Systems/SystemsModule.tsx

import { IntegrationVisualizer } from '@/components/Visualizations';

// Inside your component, add a new section:
<div className="mt-8">
  <h3 className="text-xl font-bold mb-4">ארכיטקטורת אינטגרציות</h3>
  {detailedSystems.length > 0 ? (
    <IntegrationVisualizer systems={detailedSystems} />
  ) : (
    <p className="text-gray-500">הוסף מערכות וקישורים ביניהן כדי לראות את המפה</p>
  )}
</div>
```

## Demo Page

To see the component with sample data:

```tsx
import { IntegrationVisualizerDemo } from '@/components/Visualizations';

// In your router or test page:
<IntegrationVisualizerDemo />
```

## Adding to Router

If you want a dedicated page for the visualizer:

```tsx
// In your router configuration
{
  path: '/integrations',
  element: <IntegrationVisualizerDemo />
}
```

## Data Structure

The component expects an array of `DetailedSystemInfo` objects. Each system should have:

```typescript
{
  id: 'unique-id',
  category: 'crm', // or 'erp', 'marketing_automation', etc.
  specificSystem: 'System Name',
  integrationNeeds: [
    {
      id: 'int-1',
      targetSystemId: 'other-system-id',
      targetSystemName: 'Other System',
      integrationType: 'api',
      frequency: 'realtime',
      dataFlow: 'bidirectional',
      criticalityLevel: 'critical',
      currentStatus: 'working'
    }
  ]
  // ... other fields
}
```

## Features Users Can Use

1. **Drag nodes** - Click and drag any system to reposition it
2. **Zoom** - Use mouse wheel or pinch to zoom in/out
3. **Pan** - Click and drag empty space to move the view
4. **Mini-map** - Small overview in corner shows full layout
5. **Export PNG** - Button to download current view as image
6. **Auto-layout** - Reset nodes to grid layout
7. **Legend** - Shows what colors and line styles mean

## Styling Tips

The component has a fixed height of 600px. To customize:

```tsx
<div className="h-[800px]"> {/* Custom height */}
  <IntegrationVisualizer systems={systems} />
</div>
```

Or make it full-screen:

```tsx
<div className="h-screen">
  <IntegrationVisualizer systems={systems} />
</div>
```

## Common Issues

**No systems showing?**
- Check that `systems` array is not empty
- Verify each system has a unique `id`
- Check browser console for errors

**Integrations not connecting?**
- Ensure `targetSystemId` matches another system's `id`
- Verify `integrationNeeds` array exists and is populated

**Performance slow?**
- Reduce number of systems if > 50
- Minimize other components on same page
- Check for memory leaks in browser DevTools

## Hebrew RTL Support

The component automatically handles RTL layout. Panel controls and legend are in Hebrew and positioned correctly for RTL interfaces.

System names should be in Hebrew for best results:
```typescript
specificSystem: 'זוהו CRM'  // Good
specificSystem: 'Zoho CRM'  // Also works
```

## Next Steps

1. Add the component to your Systems Module
2. Test with real meeting data
3. Customize colors/layout if needed
4. Share with users for feedback

For more details, see `README.md` in this directory.