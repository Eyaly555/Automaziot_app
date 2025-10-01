# Integration Visualizer Component

Phase 3 component for visualizing system integration architecture using ReactFlow.

## Overview

The `IntegrationVisualizer` component creates an interactive, visual representation of business systems and their integrations. It uses ReactFlow to display systems as nodes and integrations as edges, with full RTL Hebrew support.

## Features

### Visual Representation
- **Nodes**: Each system displayed as a colored node
- **Edges**: Integration connections between systems
- **Color Coding**: Different colors for system categories and integration statuses
- **Interactive**: Drag nodes, zoom, pan, and explore

### Integration Status Visualization
- **Line Style**:
  - Solid line = Working integration
  - Dashed line = Problematic integration
  - Dotted line = Missing integration

- **Line Color**:
  - Red = Critical integration
  - Orange = Important integration
  - Gray = Nice-to-have integration

- **Animation**:
  - Animated edges = Real-time integrations
  - Static edges = Batch/scheduled integrations

### Category Colors
- CRM: Blue (#3B82F6)
- ERP: Green (#10B981)
- Marketing Automation: Amber (#F59E0B)
- Communication: Purple (#8B5CF6)
- Project Management: Pink (#EC4899)
- Accounting: Teal (#14B8A6)
- HR: Indigo (#6366F1)
- Warehouse: Orange (#F97316)
- E-commerce: Red (#EF4444)
- Other: Gray (#6B7280)

### Controls
- **Export PNG**: Download visualization as high-resolution image
- **Auto-layout**: Reset node positions to grid layout
- **Mini-map**: Overview of entire architecture
- **Zoom/Pan**: Standard ReactFlow controls

## Usage

### Basic Usage

```tsx
import { IntegrationVisualizer } from '@/components/Visualizations';
import { useMeetingStore } from '@/store/useMeetingStore';

function MyComponent() {
  const systems = useMeetingStore(
    state => state.currentMeeting?.modules.systems.detailedSystems || []
  );

  return <IntegrationVisualizer systems={systems} />;
}
```

### In Systems Module

```tsx
import { IntegrationVisualizer } from '@/components/Visualizations';

export const SystemsModule = () => {
  const { currentMeeting } = useMeetingStore();
  const systems = currentMeeting?.modules.systems.detailedSystems || [];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">מפת אינטגרציות</h2>

      {systems.length > 0 ? (
        <IntegrationVisualizer systems={systems} />
      ) : (
        <p>הוסף מערכות כדי לראות את מפת האינטגרציות</p>
      )}
    </div>
  );
};
```

### Demo Component

A demo component with sample data is available:

```tsx
import { IntegrationVisualizerDemo } from '@/components/Visualizations';

// Shows the visualizer with pre-populated sample data
<IntegrationVisualizerDemo />
```

## Component Props

### IntegrationVisualizer

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| systems | DetailedSystemInfo[] | Yes | Array of system objects with integration needs |

### DetailedSystemInfo Structure

```typescript
interface DetailedSystemInfo {
  id: string;                          // Unique system identifier
  category: string;                    // System category (crm, erp, etc.)
  specificSystem: string;              // System name (e.g., "Zoho CRM")
  version?: string;                    // Version/plan
  recordCount?: number;                // Number of records
  apiAccess: 'full' | 'limited' | 'none' | 'unknown';
  satisfactionScore: 1 | 2 | 3 | 4 | 5;
  mainPainPoints: string[];
  integrationNeeds: SystemIntegrationNeed[];
  migrationWillingness: 'eager' | 'open' | 'reluctant' | 'no';
  monthlyUsers?: number;
  criticalFeatures: string[];
  dataVolume?: string;
  customNotes?: string;
}

interface SystemIntegrationNeed {
  id: string;
  targetSystemId: string;              // References another system's id
  targetSystemName: string;
  integrationType: 'native' | 'api' | 'zapier' | 'n8n' | 'make' | 'manual' | 'other';
  frequency: 'realtime' | 'hourly' | 'daily' | 'weekly' | 'manual';
  dataFlow: 'bidirectional' | 'one-way-to' | 'one-way-from';
  criticalityLevel: 'critical' | 'important' | 'nice-to-have';
  currentStatus: 'working' | 'problematic' | 'missing';
  specificNeeds?: string;
}
```

## Layout Algorithm

The component uses a simple grid layout algorithm:
- Calculates optimal grid dimensions based on number of systems
- Places nodes in a grid with configurable spacing
- Horizontal spacing: 300px
- Vertical spacing: 150px
- Node dimensions: 200x80px

Users can drag nodes to customize layout, and click "ארגן מחדש" to reset.

## RTL Support

The component is fully RTL-aware:
- System names and labels in Hebrew
- Legend and controls in Hebrew
- Right-to-left flow direction in panels
- Proper text alignment for Hebrew content

## Export Functionality

The PNG export feature:
- Captures the entire viewport
- Uses html2canvas with 2x scale for high resolution
- Automatically downloads with timestamp in filename
- Preserves colors and layout

## Performance Considerations

- Handles up to ~50 systems efficiently
- Edge rendering optimized with ReactFlow
- Memoized node/edge generation
- Draggable state managed by ReactFlow

## Styling

The component uses:
- Tailwind CSS for utility classes
- ReactFlow's built-in styles
- Custom colors for Hebrew UX
- Responsive container (600px height, full width)

## Dependencies

- `reactflow` v11.11.4 - Core visualization library
- `lucide-react` - Icons (Download, Grid3x3)
- `html2canvas` - PNG export functionality
- React 19+ - Component framework

## Future Enhancements

Potential additions for Phase 4:
- Custom edge types with data flow indicators
- Clustering by system category
- Search/filter functionality
- Click-to-edit integration details
- Save/load custom layouts
- Export to other formats (SVG, PDF)
- Performance metrics overlay
- Cost analysis visualization

## Troubleshooting

### Nodes not appearing
- Verify systems array is not empty
- Check that each system has a unique `id`
- Ensure `specificSystem` field is populated

### Edges not connecting
- Verify `targetSystemId` matches an existing system's `id`
- Check that `integrationNeeds` array is populated
- Ensure both source and target systems exist

### Export not working
- Check browser console for html2canvas errors
- Verify sufficient browser memory
- Try with fewer systems if performance issues

### Layout issues
- Click "ארגן מחדש" to reset positions
- Check viewport dimensions
- Verify container has explicit height

## Examples

See `IntegrationVisualizerDemo.tsx` for a complete working example with 6 systems and 5 integrations demonstrating all features.