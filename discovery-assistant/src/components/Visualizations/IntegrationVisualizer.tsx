import React, { useCallback, useMemo, useState } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  MarkerType,
  Panel,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { DetailedSystemInfo, SystemIntegrationNeed } from '../../types';
import { Download, Grid3x3 } from 'lucide-react';

interface IntegrationVisualizerProps {
  systems: DetailedSystemInfo[];
}

// Category colors for nodes
const CATEGORY_COLORS: Record<string, string> = {
  crm: '#3B82F6', // blue
  erp: '#10B981', // green
  marketing_automation: '#F59E0B', // amber
  communication: '#8B5CF6', // purple
  project_management: '#EC4899', // pink
  accounting: '#14B8A6', // teal
  hr: '#6366F1', // indigo
  warehouse: '#F97316', // orange
  ecommerce: '#EF4444', // red
  other: '#6B7280', // gray
};

// Integration status colors
const STATUS_COLORS = {
  working: '#10B981', // green
  problematic: '#F59E0B', // orange
  missing: '#EF4444', // red
};

// Criticality colors
const CRITICALITY_COLORS = {
  critical: '#EF4444', // red
  important: '#F59E0B', // orange
  'nice-to-have': '#9CA3AF', // gray
};

export const IntegrationVisualizer: React.FC<IntegrationVisualizerProps> = ({ systems }) => {
  const [autoLayoutKey, setAutoLayoutKey] = useState(0);

  // Generate ReactFlow nodes from systems
  const initialNodes: Node[] = useMemo(() => {
    if (!systems || systems.length === 0) return [];

    const gridColumns = Math.ceil(Math.sqrt(systems.length));
    const nodeWidth = 200;
    const nodeHeight = 80;
    const horizontalSpacing = 300;
    const verticalSpacing = 150;

    return systems.map((system, index) => {
      const row = Math.floor(index / gridColumns);
      const col = index % gridColumns;

      return {
        id: system.id,
        type: 'default',
        position: {
          x: col * horizontalSpacing,
          y: row * verticalSpacing,
        },
        data: {
          label: (
            <div className="text-center p-2" dir="rtl">
              <div className="font-semibold text-sm whitespace-normal">
                {system.specificSystem}
              </div>
              <div className="text-xs text-gray-600 mt-1">
                {getCategoryLabel(system.category)}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {system.monthlyUsers ? `${system.monthlyUsers} משתמשים` : ''}
              </div>
            </div>
          ),
        },
        style: {
          background: CATEGORY_COLORS[system.category] || CATEGORY_COLORS.other,
          color: 'white',
          border: '2px solid white',
          borderRadius: '8px',
          width: nodeWidth,
          minHeight: nodeHeight,
          fontSize: '12px',
          padding: '0',
        },
        draggable: true,
      };
    });
  }, [systems, autoLayoutKey]);

  // Generate ReactFlow edges from integrations
  const initialEdges: Edge[] = useMemo(() => {
    if (!systems || systems.length === 0) return [];

    const edges: Edge[] = [];

    systems.forEach((system) => {
      if (!system.integrationNeeds) return;

      system.integrationNeeds.forEach((integration) => {
        const edgeId = `${system.id}-${integration.targetSystemId}`;

        // Determine edge style based on status
        const isRealtime = integration.frequency === 'realtime';
        const strokeStyle = integration.currentStatus === 'working'
          ? 'solid'
          : integration.currentStatus === 'problematic'
          ? [5, 5]
          : [2, 4];

        edges.push({
          id: edgeId,
          source: system.id,
          target: integration.targetSystemId,
          type: 'default',
          animated: isRealtime,
          style: {
            stroke: CRITICALITY_COLORS[integration.criticalityLevel],
            strokeWidth: integration.criticalityLevel === 'critical' ? 3 : 2,
            strokeDasharray: strokeStyle,
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: CRITICALITY_COLORS[integration.criticalityLevel],
          },
          label: (
            <div className="text-xs bg-white px-2 py-1 rounded shadow-sm" dir="rtl">
              <div>{getIntegrationTypeLabel(integration.integrationType)}</div>
              <div className="text-gray-600">{getFrequencyLabel(integration.frequency)}</div>
            </div>
          ),
          labelStyle: {
            fill: '#374151',
            fontSize: 10,
          },
          labelBgStyle: {
            fill: 'white',
            fillOpacity: 0.9,
          },
        });
      });
    });

    return edges;
  }, [systems, autoLayoutKey]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Export as PNG
  const handleExportPNG = useCallback(() => {
    const viewport = document.querySelector('.react-flow__viewport') as HTMLElement;
    if (!viewport) return;

    import('html2canvas').then(({ default: html2canvas }) => {
      html2canvas(viewport, {
        backgroundColor: '#ffffff',
        scale: 2,
      }).then((canvas) => {
        const link = document.createElement('a');
        link.download = `integration-architecture-${Date.now()}.png`;
        link.href = canvas.toDataURL();
        link.click();
      });
    });
  }, []);

  // Auto-layout
  const handleAutoLayout = useCallback(() => {
    setAutoLayoutKey(prev => prev + 1);
  }, []);

  if (!systems || systems.length === 0) {
    return (
      <div className="text-center p-8 text-gray-500" dir="rtl">
        אין מערכות להצגה. הוסף מערכות במודול המערכות.
      </div>
    );
  }

  return (
    <div className="w-full h-[600px] border border-gray-300 rounded-lg bg-white" dir="ltr">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
        attributionPosition="bottom-left"
      >
        <Background />
        <Controls />
        <MiniMap
          nodeColor={(node) => {
            const system = systems.find(s => s.id === node.id);
            return CATEGORY_COLORS[system?.category || 'other'];
          }}
          maskColor="rgba(0, 0, 0, 0.1)"
        />

        {/* Control Panel */}
        <Panel position="top-right" className="bg-white p-2 rounded shadow-md space-y-2" dir="rtl">
          <button
            onClick={handleExportPNG}
            className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors w-full text-sm"
            title="ייצא כתמונה"
          >
            <Download className="w-4 h-4" />
            <span>ייצוא PNG</span>
          </button>

          <button
            onClick={handleAutoLayout}
            className="flex items-center gap-2 px-3 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors w-full text-sm"
            title="ארגן מחדש"
          >
            <Grid3x3 className="w-4 h-4" />
            <span>ארגן מחדש</span>
          </button>
        </Panel>

        {/* Legend */}
        <Panel position="bottom-right" className="bg-white p-3 rounded shadow-md space-y-2 text-xs" dir="rtl">
          <div className="font-semibold text-sm mb-2">מקרא</div>

          <div className="space-y-1">
            <div className="font-medium text-xs">סטטוס חיבור:</div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-0.5 bg-green-500"></div>
              <span>עובד</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-0.5 bg-orange-500" style={{ borderTop: '2px dashed' }}></div>
              <span>בעייתי</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-0.5 bg-red-500" style={{ borderTop: '2px dotted' }}></div>
              <span>חסר</span>
            </div>
          </div>

          <div className="space-y-1 pt-2 border-t">
            <div className="font-medium text-xs">רמת קריטיות:</div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span>קריטי</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-orange-500"></div>
              <span>חשוב</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gray-400"></div>
              <span>רצוי</span>
            </div>
          </div>

          <div className="pt-2 border-t text-gray-600">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-blue-400 rounded"></div>
              <span>קו מהבהב = זמן אמת</span>
            </div>
          </div>
        </Panel>
      </ReactFlow>
    </div>
  );
};

// Helper functions for Hebrew labels
function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    crm: 'CRM',
    erp: 'ERP',
    marketing_automation: 'אוטומציה שיווקית',
    communication: 'תקשורת',
    project_management: 'ניהול פרויקטים',
    accounting: 'הנהלת חשבונות',
    hr: 'משאבי אנוש',
    warehouse: 'מחסן',
    ecommerce: 'מסחר אלקטרוני',
    other: 'אחר',
  };
  return labels[category] || category;
}

function getIntegrationTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    native: 'חיבור מובנה',
    api: 'API',
    zapier: 'Zapier',
    n8n: 'n8n',
    make: 'Make',
    manual: 'ידני',
    other: 'אחר',
  };
  return labels[type] || type;
}

function getFrequencyLabel(frequency: string): string {
  const labels: Record<string, string> = {
    realtime: 'זמן אמת',
    hourly: 'כל שעה',
    daily: 'יומי',
    weekly: 'שבועי',
    manual: 'ידני',
  };
  return labels[frequency] || frequency;
}