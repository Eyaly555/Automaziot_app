#!/usr/bin/env python3
"""
Script to generate the remaining 28 React components for Phase 2 Service Requirements
"""

import os
from pathlib import Path

# Component template
COMPONENT_TEMPLATE = '''import React, {{ useState, useEffect }} from 'react';
import {{ useMeetingStore }} from '../../../../store/useMeetingStore';
import {{ Card }} from '../../../Common/Card';

export function {component_name}() {{
  const {{ currentMeeting, updateMeeting }} = useMeetingStore();
  const [config, setConfig] = useState<any>({{
    ...{default_config}
  }});

  useEffect(() => {{
    if (currentMeeting?.implementationSpec?.{category}?.{config_key}) {{
      setConfig(currentMeeting.implementationSpec.{category}.{config_key});
    }}
  }}, [currentMeeting]);

  const handleSave = () => {{
    if (!currentMeeting) return;
    updateMeeting(currentMeeting.id, {{
      implementationSpec: {{
        ...currentMeeting.implementationSpec,
        {category}: {{ ...currentMeeting.implementationSpec?.{category}, {config_key}: config }},
      }},
    }});
  }};

  return (
    <div className="space-y-6" dir="rtl">
      <Card title="{card_title}">
        <div className="space-y-4">
          {form_fields}
          <div className="flex justify-end pt-4 border-t">
            <button onClick={{handleSave}} className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">שמור הגדרות</button>
          </div>
        </div>
      </Card>
    </div>
  );
}}
'''

# Components to create
components = [
    # Integrations (9 more)
    {
        'file': 'Integrations/IntegrationComplexSpec.tsx',
        'component_name': 'IntegrationComplexSpec',
        'category': 'integrations',
        'config_key': 'integrationComplex',
        'card_title': 'שירות #32: אינטגרציה מורכבת מרובת-שלבים',
        'default_config': "{ steps: [], systems: [], errorHandling: 'retry' }",
        'form_fields': '<div><label className="block text-sm font-medium text-gray-700 mb-2">תיאור אינטגרציה</label><textarea rows={4} className="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="תאר את האינטגרציה..." /></div>'
    },
    {
        'file': 'Integrations/IntComplexSpec.tsx',
        'component_name': 'IntComplexSpec',
        'category': 'integrations',
        'config_key': 'intComplex',
        'card_title': 'שירות #33: אינטגרציה מורכבת עם טרנספורמציה',
        'default_config': "{ transformation: '', validation: true }",
        'form_fields': '<div><label className="block text-sm font-medium text-gray-700 mb-2">טרנספורמציות</label><textarea rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-md" /></div>'
    },
    {
        'file': 'Integrations/WhatsappApiSetupSpec.tsx',
        'component_name': 'WhatsappApiSetupSpec',
        'category': 'integrations',
        'config_key': 'whatsappApiSetup',
        'card_title': 'שירות #34: הקמת WhatsApp Business API',
        'default_config': "{ phoneNumber: '', apiProvider: 'twilio', verified: false }",
        'form_fields': '<div><input type="tel" className="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="מספר טלפון" /></div>'
    },
    {
        'file': 'Integrations/IntCrmMarketingSpec.tsx',
        'component_name': 'IntCrmMarketingSpec',
        'category': 'integrations',
        'config_key': 'intCrmMarketing',
        'card_title': 'שירות #35: אינטגרציה CRM + שיווק',
        'default_config': "{ crmSystem: 'zoho', marketingPlatform: 'mailchimp', syncContacts: true }",
        'form_fields': '<div className="grid grid-cols-2 gap-4"><div><select className="w-full px-3 py-2 border border-gray-300 rounded-md"><option>Zoho</option><option>Salesforce</option></select></div><div><select className="w-full px-3 py-2 border border-gray-300 rounded-md"><option>MailChimp</option><option>ActiveCampaign</option></select></div></div>'
    },
    {
        'file': 'Integrations/IntCrmAccountingSpec.tsx',
        'component_name': 'IntCrmAccountingSpec',
        'category': 'integrations',
        'config_key': 'intCrmAccounting',
        'card_title': 'שירות #36: אינטגרציה CRM + הנהלת חשבונות',
        'default_config': "{ crmSystem: 'zoho', accountingSystem: 'quickbooks', autoInvoicing: true }",
        'form_fields': '<div><select className="w-full px-3 py-2 border border-gray-300 rounded-md"><option>QuickBooks</option><option>Xero</option><option>FreshBooks</option></select></div>'
    },
    {
        'file': 'Integrations/IntCrmSupportSpec.tsx',
        'component_name': 'IntCrmSupportSpec',
        'category': 'integrations',
        'config_key': 'intCrmSupport',
        'card_title': 'שירות #37: אינטגרציה CRM + תמיכה',
        'default_config': "{ crmSystem: 'zoho', helpdeskSystem: 'zendesk', ticketSync: true }",
        'form_fields': '<div><select className="w-full px-3 py-2 border border-gray-300 rounded-md"><option>Zendesk</option><option>Freshdesk</option></select></div>'
    },
    {
        'file': 'Integrations/IntCalendarSpec.tsx',
        'component_name': 'IntCalendarSpec',
        'category': 'integrations',
        'config_key': 'intCalendar',
        'card_title': 'שירות #38: אינטגרציה לוח שנה',
        'default_config': "{ calendarProvider: 'google', twoWaySync: true }",
        'form_fields': '<div><select className="w-full px-3 py-2 border border-gray-300 rounded-md"><option>Google Calendar</option><option>Outlook</option></select></div>'
    },
    {
        'file': 'Integrations/IntEcommerceSpec.tsx',
        'component_name': 'IntEcommerceSpec',
        'category': 'integrations',
        'config_key': 'intEcommerce',
        'card_title': 'שירות #39: אינטגרציה E-commerce',
        'default_config': "{ platform: 'shopify', crmSystem: 'zoho', orderSync: true }",
        'form_fields': '<div><select className="w-full px-3 py-2 border border-gray-300 rounded-md"><option>Shopify</option><option>WooCommerce</option></select></div>'
    },
    {
        'file': 'Integrations/IntCustomSpec.tsx',
        'component_name': 'IntCustomSpec',
        'category': 'integrations',
        'config_key': 'intCustom',
        'card_title': 'שירות #40: אינטגרציה מותאמת אישית',
        'default_config': "{ description: '', complexity: 'medium', estimatedWeeks: 4 }",
        'form_fields': '<div><textarea rows={5} className="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="תאר את האינטגרציה המותאמת..." /></div>'
    },

    # System Implementations (9 components)
    {
        'file': 'SystemImplementations/ImplCrmSpec.tsx',
        'component_name': 'ImplCrmSpec',
        'category': 'systemImplementations',
        'config_key': 'implCrm',
        'card_title': 'שירות #41: הטמעת CRM',
        'default_config': "{ platform: 'zoho', subscriptionTier: '', estimatedWeeks: 6 }",
        'form_fields': '<div className="grid grid-cols-2 gap-4"><div><select className="w-full px-3 py-2 border border-gray-300 rounded-md"><option>Zoho CRM</option><option>Salesforce</option><option>HubSpot</option></select></div><div><input type="number" className="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="משך בשבועות" /></div></div>'
    },
    {
        'file': 'SystemImplementations/ImplMarketingAutomationSpec.tsx',
        'component_name': 'ImplMarketingAutomationSpec',
        'category': 'systemImplementations',
        'config_key': 'implMarketingAutomation',
        'card_title': 'שירות #42: הטמעת אוטומציית שיווק',
        'default_config': "{ platform: 'hubspot_marketing', estimatedWeeks: 3 }",
        'form_fields': '<div><select className="w-full px-3 py-2 border border-gray-300 rounded-md"><option>HubSpot Marketing</option><option>ActiveCampaign</option><option>MailChimp</option></select></div>'
    },
    {
        'file': 'SystemImplementations/ImplProjectManagementSpec.tsx',
        'component_name': 'ImplProjectManagementSpec',
        'category': 'systemImplementations',
        'config_key': 'implProjectManagement',
        'card_title': 'שירות #43: הטמעת ניהול פרויקטים',
        'default_config': "{ platform: 'monday', estimatedWeeks: 4 }",
        'form_fields': '<div><select className="w-full px-3 py-2 border border-gray-300 rounded-md"><option>Monday.com</option><option>Asana</option><option>Jira</option><option>ClickUp</option></select></div>'
    },
    {
        'file': 'SystemImplementations/ImplHelpdeskSpec.tsx',
        'component_name': 'ImplHelpdeskSpec',
        'category': 'systemImplementations',
        'config_key': 'implHelpdesk',
        'card_title': 'שירות #44: הטמעת Helpdesk',
        'default_config': "{ platform: 'zendesk', estimatedWeeks: 3 }",
        'form_fields': '<div><select className="w-full px-3 py-2 border border-gray-300 rounded-md"><option>Zendesk</option><option>Freshdesk</option><option>Intercom</option></select></div>'
    },
    {
        'file': 'SystemImplementations/ImplErpSpec.tsx',
        'component_name': 'ImplErpSpec',
        'category': 'systemImplementations',
        'config_key': 'implErp',
        'card_title': 'שירות #45: הטמעת ERP',
        'default_config': "{ platform: 'sap_s4hana', estimatedMonths: 12 }",
        'form_fields': '<div><select className="w-full px-3 py-2 border border-gray-300 rounded-md"><option>SAP S/4HANA</option><option>Oracle NetSuite</option><option>Microsoft Dynamics</option></select></div>'
    },
    {
        'file': 'SystemImplementations/ImplEcommerceSpec.tsx',
        'component_name': 'ImplEcommerceSpec',
        'category': 'systemImplementations',
        'config_key': 'implEcommerce',
        'card_title': 'שירות #46: הטמעת E-commerce',
        'default_config': "{ platform: 'shopify', estimatedWeeks: 4 }",
        'form_fields': '<div><select className="w-full px-3 py-2 border border-gray-300 rounded-md"><option>Shopify</option><option>WooCommerce</option><option>Magento</option></select></div>'
    },
    {
        'file': 'SystemImplementations/ImplAnalyticsSpec.tsx',
        'component_name': 'ImplAnalyticsSpec',
        'category': 'systemImplementations',
        'config_key': 'implAnalytics',
        'card_title': 'שירות #47: הטמעת Analytics',
        'default_config': "{ platform: 'google_analytics_4', estimatedDays: 7 }",
        'form_fields': '<div><select className="w-full px-3 py-2 border border-gray-300 rounded-md"><option>Google Analytics 4</option><option>Mixpanel</option><option>Amplitude</option></select></div>'
    },
    {
        'file': 'SystemImplementations/ImplWorkflowPlatformSpec.tsx',
        'component_name': 'ImplWorkflowPlatformSpec',
        'category': 'systemImplementations',
        'config_key': 'implWorkflowPlatform',
        'card_title': 'שירות #48: הטמעת פלטפורמת Workflow',
        'default_config': "{ platform: 'n8n_selfhosted', estimatedDays: 7 }",
        'form_fields': '<div><select className="w-full px-3 py-2 border border-gray-300 rounded-md"><option>n8n Self-Hosted</option><option>n8n Cloud</option><option>Zapier</option><option>Make</option></select></div>'
    },
    {
        'file': 'SystemImplementations/ImplCustomSpec.tsx',
        'component_name': 'ImplCustomSpec',
        'category': 'systemImplementations',
        'config_key': 'implCustom',
        'card_title': 'שירות #49: הטמעת מערכת מותאמת אישית',
        'default_config': "{ systemName: '', complexity: 'high', estimatedWeeks: 12 }",
        'form_fields': '<div><input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="שם המערכת" /></div>'
    },

    # Additional Services (10 components)
    {
        'file': 'AdditionalServices/DataCleanupSpec.tsx',
        'component_name': 'DataCleanupSpec',
        'category': 'additionalServices',
        'config_key': 'dataCleanup',
        'card_title': 'שירות #50: ניקוי והסרת כפילויות',
        'default_config': "{ recordCount: 0, estimatedDays: 5 }",
        'form_fields': '<div><input type="number" className="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="מספר רשומות" /></div>'
    },
    {
        'file': 'AdditionalServices/DataMigrationSpec.tsx',
        'component_name': 'DataMigrationSpec',
        'category': 'additionalServices',
        'config_key': 'dataMigration',
        'card_title': 'שירות #51: העברת נתונים',
        'default_config': "{ sourceSystem: '', targetSystem: '', estimatedDays: 7 }",
        'form_fields': '<div className="grid grid-cols-2 gap-4"><div><input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="מערכת מקור" /></div><div><input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="מערכת יעד" /></div></div>'
    },
    {
        'file': 'AdditionalServices/AddDashboardSpec.tsx',
        'component_name': 'AddDashboardSpec',
        'category': 'additionalServices',
        'config_key': 'addDashboard',
        'card_title': 'שירות #52: הוספת דשבורד',
        'default_config': "{ platform: 'power_bi', estimatedDays: 5 }",
        'form_fields': '<div><select className="w-full px-3 py-2 border border-gray-300 rounded-md"><option>Power BI</option><option>Tableau</option><option>Looker</option></select></div>'
    },
    {
        'file': 'AdditionalServices/AddCustomReportsSpec.tsx',
        'component_name': 'AddCustomReportsSpec',
        'category': 'additionalServices',
        'config_key': 'addCustomReports',
        'card_title': 'שירות #53: דוחות מותאמים',
        'default_config': "{ reportCount: 1, complexity: 'medium', estimatedDays: 3 }",
        'form_fields': '<div><input type="number" className="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="מספר דוחות" /></div>'
    },
    {
        'file': 'AdditionalServices/ReportsAutomatedSpec.tsx',
        'component_name': 'ReportsAutomatedSpec',
        'category': 'additionalServices',
        'config_key': 'reportsAutomated',
        'card_title': 'שירות #54: דיווח אוטומטי',
        'default_config': "{ frequency: 'weekly', recipients: [], estimatedDays: 3 }",
        'form_fields': '<div><select className="w-full px-3 py-2 border border-gray-300 rounded-md"><option>יומי</option><option>שבועי</option><option>חודשי</option></select></div>'
    },
    {
        'file': 'AdditionalServices/TrainingWorkshopsSpec.tsx',
        'component_name': 'TrainingWorkshopsSpec',
        'category': 'additionalServices',
        'config_key': 'trainingWorkshops',
        'card_title': 'שירות #55: הדרכות וסדנאות',
        'default_config': "{ sessionCount: 1, participantCount: 10, durationHours: 4 }",
        'form_fields': '<div className="grid grid-cols-3 gap-4"><div><input type="number" className="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="מספר מפגשים" /></div><div><input type="number" className="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="משתתפים" /></div><div><input type="number" className="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="שעות" /></div></div>'
    },
    {
        'file': 'AdditionalServices/TrainingOngoingSpec.tsx',
        'component_name': 'TrainingOngoingSpec',
        'category': 'additionalServices',
        'config_key': 'trainingOngoing',
        'card_title': 'שירות #56: הדרכה מתמשכת',
        'default_config': "{ durationMonths: 6, hoursPerMonth: 4 }",
        'form_fields': '<div className="grid grid-cols-2 gap-4"><div><input type="number" className="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="חודשים" /></div><div><input type="number" className="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="שעות/חודש" /></div></div>'
    },
    {
        'file': 'AdditionalServices/SupportOngoingSpec.tsx',
        'component_name': 'SupportOngoingSpec',
        'category': 'additionalServices',
        'config_key': 'supportOngoing',
        'card_title': 'שירות #57: תמיכה שוטפת',
        'default_config': "{ supportLevel: 'extended', hoursPerMonth: 10 }",
        'form_fields': '<div><select className="w-full px-3 py-2 border border-gray-300 rounded-md"><option>בסיסי</option><option>מורחב</option><option>פרימיום</option></select></div>'
    },
    {
        'file': 'AdditionalServices/ConsultingProcessSpec.tsx',
        'component_name': 'ConsultingProcessSpec',
        'category': 'additionalServices',
        'config_key': 'consultingProcess',
        'card_title': 'שירות #58: ייעוץ תהליכים',
        'default_config': "{ processCount: 1, estimatedWeeks: 2 }",
        'form_fields': '<div><input type="number" className="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="מספר תהליכים" /></div>'
    },
    {
        'file': 'AdditionalServices/ConsultingStrategySpec.tsx',
        'component_name': 'ConsultingStrategySpec',
        'category': 'additionalServices',
        'config_key': 'consultingStrategy',
        'card_title': 'שירות #59: ייעוץ אסטרטגי',
        'default_config': "{ scope: 'comprehensive', estimatedWeeks: 4 }",
        'form_fields': '<div><select className="w-full px-3 py-2 border border-gray-300 rounded-md"><option>קצר</option><option>מקיף</option></select></div>'
    },
]

# Base directory
base_dir = Path(r"c:\Users\eyaly\Desktop\Businesses\eym-group_n8n\internal_app\discovery-assistant\src\components\Phase2\ServiceRequirements")

# Generate components
for comp in components:
    file_path = base_dir / comp['file']
    file_path.parent.mkdir(parents=True, exist_ok=True)

    content = COMPONENT_TEMPLATE.format(
        component_name=comp['component_name'],
        category=comp['category'],
        config_key=comp['config_key'],
        card_title=comp['card_title'],
        default_config=comp['default_config'],
        form_fields=comp['form_fields']
    )

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

    print(f"Created: {comp['file']}")

print(f"\n✅ Successfully created {len(components)} components!")
