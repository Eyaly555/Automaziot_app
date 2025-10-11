import { DetailedSystemInfo, Meeting } from '../types';

export interface DataMapping {
  id: string;
  sourceSystem: string;
  sourceField: string;
  sourceType: string;
  destinationSystem: string;
  destinationField: string;
  destinationType: string;
  transformation?: string;
  validation?: string;
  required: boolean;
  example?: string;
}

export interface DataMappingSpec {
  integrationId: string;
  sourceName: string;
  targetName: string;
  mappings: DataMapping[];
  triggers: string[];
  errorHandling: string[];
}

export const generateDataMappings = (
  sourceSystem: DetailedSystemInfo,
  targetSystem: DetailedSystemInfo,
  _meeting: Meeting
): DataMappingSpec => {
  const mappings: DataMapping[] = [];

  // Generate common field mappings based on system types
  if (sourceSystem.category === 'crm') {
    mappings.push(...generateCRMMappings(sourceSystem, targetSystem));
  }

  if (sourceSystem.category === 'erp') {
    mappings.push(...generateERPMappings(sourceSystem, targetSystem));
  }

  if (sourceSystem.category === 'ecommerce') {
    mappings.push(...generateEcommerceMappings(sourceSystem, targetSystem));
  }

  return {
    integrationId: `${sourceSystem.id}_to_${targetSystem.id}`,
    sourceName: sourceSystem.specificSystem,
    targetName: targetSystem.specificSystem,
    mappings,
    triggers: generateTriggers(sourceSystem, targetSystem),
    errorHandling: generateErrorHandling(sourceSystem, targetSystem)
  };
};

const generateCRMMappings = (source: DetailedSystemInfo, target: DetailedSystemInfo): DataMapping[] => {
  const commonMappings: DataMapping[] = [
    {
      id: 'lead_name',
      sourceSystem: source.specificSystem,
      sourceField: 'Lead.Name',
      sourceType: 'string',
      destinationSystem: target.specificSystem,
      destinationField: 'contact_name',
      destinationType: 'string',
      required: true,
      example: 'John Doe',
      transformation: 'none'
    },
    {
      id: 'lead_email',
      sourceSystem: source.specificSystem,
      sourceField: 'Lead.Email',
      sourceType: 'email',
      destinationSystem: target.specificSystem,
      destinationField: 'email',
      destinationType: 'email',
      required: true,
      example: 'john@example.com',
      validation: 'regex: /^[^@]+@[^@]+\\.[^@]+$/'
    },
    {
      id: 'lead_phone',
      sourceSystem: source.specificSystem,
      sourceField: 'Lead.Phone',
      sourceType: 'string',
      destinationSystem: target.specificSystem,
      destinationField: 'phone',
      destinationType: 'string',
      required: false,
      example: '050-1234567',
      transformation: 'format_israeli_phone',
      validation: 'regex: /^05\\d{8}$/ (Israeli format)'
    },
    {
      id: 'lead_company',
      sourceSystem: source.specificSystem,
      sourceField: 'Lead.Company',
      sourceType: 'string',
      destinationSystem: target.specificSystem,
      destinationField: 'company_name',
      destinationType: 'string',
      required: false,
      example: 'Acme Corp'
    },
    {
      id: 'lead_status',
      sourceSystem: source.specificSystem,
      sourceField: 'Lead.Status',
      sourceType: 'picklist',
      destinationSystem: target.specificSystem,
      destinationField: 'status',
      destinationType: 'enum',
      required: true,
      example: 'New',
      transformation: 'map_status_values'
    },
    {
      id: 'lead_source',
      sourceSystem: source.specificSystem,
      sourceField: 'Lead.LeadSource',
      sourceType: 'picklist',
      destinationSystem: target.specificSystem,
      destinationField: 'lead_source',
      destinationType: 'string',
      required: false,
      example: 'Website'
    },
    {
      id: 'created_date',
      sourceSystem: source.specificSystem,
      sourceField: 'Lead.CreatedDate',
      sourceType: 'datetime',
      destinationSystem: target.specificSystem,
      destinationField: 'created_at',
      destinationType: 'timestamp',
      required: true,
      example: '2025-01-15T10:30:00Z',
      transformation: 'convert_to_timestamp'
    }
  ];

  return commonMappings;
};

const generateERPMappings = (source: DetailedSystemInfo, target: DetailedSystemInfo): DataMapping[] => {
  return [
    {
      id: 'invoice_number',
      sourceSystem: source.specificSystem,
      sourceField: 'Invoice.Number',
      sourceType: 'string',
      destinationSystem: target.specificSystem,
      destinationField: 'invoice_id',
      destinationType: 'string',
      required: true,
      example: 'INV-2025-001'
    },
    {
      id: 'invoice_date',
      sourceSystem: source.specificSystem,
      sourceField: 'Invoice.Date',
      sourceType: 'date',
      destinationSystem: target.specificSystem,
      destinationField: 'invoice_date',
      destinationType: 'date',
      required: true,
      example: '2025-01-15',
      transformation: 'format_to_iso_date'
    },
    {
      id: 'customer_id',
      sourceSystem: source.specificSystem,
      sourceField: 'Invoice.CustomerId',
      sourceType: 'reference',
      destinationSystem: target.specificSystem,
      destinationField: 'customer_id',
      destinationType: 'string',
      required: true,
      example: 'CUST-123'
    },
    {
      id: 'total_amount',
      sourceSystem: source.specificSystem,
      sourceField: 'Invoice.TotalAmount',
      sourceType: 'currency',
      destinationSystem: target.specificSystem,
      destinationField: 'total',
      destinationType: 'decimal',
      required: true,
      example: '1500.00',
      transformation: 'convert_to_decimal'
    },
    {
      id: 'currency',
      sourceSystem: source.specificSystem,
      sourceField: 'Invoice.Currency',
      sourceType: 'string',
      destinationSystem: target.specificSystem,
      destinationField: 'currency',
      destinationType: 'string',
      required: true,
      example: 'ILS'
    }
  ];
};

const generateEcommerceMappings = (source: DetailedSystemInfo, target: DetailedSystemInfo): DataMapping[] => {
  return [
    {
      id: 'order_id',
      sourceSystem: source.specificSystem,
      sourceField: 'Order.Id',
      sourceType: 'string',
      destinationSystem: target.specificSystem,
      destinationField: 'order_number',
      destinationType: 'string',
      required: true,
      example: 'ORD-20250115-001'
    },
    {
      id: 'customer_email',
      sourceSystem: source.specificSystem,
      sourceField: 'Order.CustomerEmail',
      sourceType: 'email',
      destinationSystem: target.specificSystem,
      destinationField: 'customer_email',
      destinationType: 'email',
      required: true,
      example: 'customer@example.com',
      validation: 'email_format'
    },
    {
      id: 'order_total',
      sourceSystem: source.specificSystem,
      sourceField: 'Order.Total',
      sourceType: 'decimal',
      destinationSystem: target.specificSystem,
      destinationField: 'order_amount',
      destinationType: 'decimal',
      required: true,
      example: '299.99'
    },
    {
      id: 'order_status',
      sourceSystem: source.specificSystem,
      sourceField: 'Order.Status',
      sourceType: 'enum',
      destinationSystem: target.specificSystem,
      destinationField: 'status',
      destinationType: 'string',
      required: true,
      example: 'processing',
      transformation: 'lowercase'
    },
    {
      id: 'shipping_address',
      sourceSystem: source.specificSystem,
      sourceField: 'Order.ShippingAddress',
      sourceType: 'object',
      destinationSystem: target.specificSystem,
      destinationField: 'shipping_details',
      destinationType: 'json',
      required: true,
      example: '{"street": "123 Main St", "city": "Tel Aviv", "zip": "12345"}',
      transformation: 'serialize_to_json'
    }
  ];
};

const generateTriggers = (source: DetailedSystemInfo, _target: DetailedSystemInfo): string[] => {
  const triggers = [];

  if (source.category === 'crm') {
    triggers.push('New Lead Created');
    triggers.push('Lead Status Changed');
    triggers.push('Opportunity Closed Won');
  }

  if (source.category === 'ecommerce') {
    triggers.push('New Order Placed');
    triggers.push('Order Status Updated');
    triggers.push('Payment Confirmed');
  }

  if (source.category === 'helpdesk') {
    triggers.push('New Ticket Created');
    triggers.push('Ticket Status Changed');
    triggers.push('High Priority Ticket');
  }

  return triggers;
};

const generateErrorHandling = (_source: DetailedSystemInfo, _target: DetailedSystemInfo): string[] => {
  return [
    'Retry failed requests up to 3 times with exponential backoff',
    'Log all errors to error_logs table with full context',
    'Send alert email on critical failures',
    'Dead letter queue for permanently failed records',
    'Validate all required fields before sending',
    'Handle API rate limit errors gracefully',
    'Rollback on partial failures',
    'Monitor and alert on error rate > 5%'
  ];
};

export const exportDataMappingAsCode = (spec: DataMappingSpec, format: 'javascript' | 'python' | 'n8n'): string => {
  if (format === 'javascript') {
    return `
// Data Mapping: ${spec.sourceName} → ${spec.targetName}

const mapData = (sourceData) => {
  return {
${spec.mappings.map(m => `    ${m.destinationField}: ${m.transformation ? `transform_${m.transformation}(sourceData.${m.sourceField})` : `sourceData.${m.sourceField}`}${m.required ? ' // Required' : ' // Optional'}`).join(',\n')}
  };
};

// Transformation functions
${spec.mappings.filter(m => m.transformation && m.transformation !== 'none').map(m => `
const transform_${m.transformation} = (value) => {
  // TODO: Implement ${m.transformation} transformation
  // Example: ${m.example}
  return value;
};
`).join('\n')}

// Validation
const validate = (data) => {
  const errors = [];
${spec.mappings.filter(m => m.required).map(m => `  if (!data.${m.destinationField}) errors.push('${m.destinationField} is required');`).join('\n')}
  return errors;
};
`.trim();
  }

  if (format === 'python') {
    return `
# Data Mapping: ${spec.sourceName} → ${spec.targetName}

def map_data(source_data: dict) -> dict:
    return {
${spec.mappings.map(m => `        "${m.destinationField}": ${m.transformation ? `transform_${m.transformation}(source_data.get("${m.sourceField}"))` : `source_data.get("${m.sourceField}")`}${m.required ? '  # Required' : '  # Optional'}`).join(',\n')}
    }

# Transformation functions
${spec.mappings.filter(m => m.transformation && m.transformation !== 'none').map(m => `
def transform_${m.transformation}(value):
    """
    Transform: ${m.transformation}
    Example: ${m.example}
    """
    # TODO: Implement transformation
    return value
`).join('\n')}

# Validation
def validate(data: dict) -> list:
    errors = []
${spec.mappings.filter(m => m.required).map(m => `    if not data.get("${m.destinationField}"):
        errors.append("${m.destinationField} is required")`).join('\n')}
    return errors
`.trim();
  }

  // n8n format
  return JSON.stringify({
    name: `${spec.sourceName} to ${spec.targetName} Mapping`,
    nodes: [
      {
        parameters: {},
        name: "Webhook",
        type: "n8n-nodes-base.webhook",
        position: [250, 300]
      },
      {
        parameters: {
          functionCode: `
// Map data from ${spec.sourceName} to ${spec.targetName}
const sourceData = items[0].json;

return items.map(item => ({
  json: {
${spec.mappings.map(m => `    ${m.destinationField}: item.json.${m.sourceField}${m.transformation ? ` // Transform: ${m.transformation}` : ''}`).join(',\n')}
  }
}));
`.trim()
        },
        name: "Data Mapping",
        type: "n8n-nodes-base.function",
        position: [450, 300]
      },
      {
        parameters: {
          resource: target.specificSystem,
          operation: "create"
        },
        name: target.specificSystem,
        type: `n8n-nodes-base.${target.category}`,
        position: [650, 300]
      }
    ],
    connections: {
      "Webhook": {
        "main": [[{ "node": "Data Mapping", "type": "main", "index": 0 }]]
      },
      "Data Mapping": {
        "main": [[{ "node": target.specificSystem, "type": "main", "index": 0 }]]
      }
    }
  }, null, 2);
};