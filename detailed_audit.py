"""
Detailed Service ID Audit - Lists all service IDs by category
"""

import re
from pathlib import Path

BASE_DIR = Path(r"C:\Users\eyaly\Desktop\Businesses\eym-group_n8n\internal_app\discovery-assistant")
CONFIG_DIR = BASE_DIR / "src" / "config"

def extract_service_category_map():
    """Extract all entries from SERVICE_CATEGORY_MAP"""
    mapping_file = CONFIG_DIR / "serviceComponentMapping.ts"
    content = mapping_file.read_text(encoding='utf-8')

    match = re.search(r'export const SERVICE_CATEGORY_MAP.*?=\s*{(.*?)^};', content, re.DOTALL | re.MULTILINE)
    if not match:
        return {}

    map_content = match.group(1)
    pattern = r"'([a-z0-9-]+)':\s*'(\w+)',"
    services = {}
    for match in re.finditer(pattern, map_content):
        service_id = match.group(1)
        category = match.group(2)
        services[service_id] = category

    return services

# Expected services based on documentation
EXPECTED_SERVICES = {
    'automations': [
        'auto-lead-response',  # 1
        'auto-sms-whatsapp',  # 2
        'auto-crm-update',  # 3
        'auto-team-alerts',  # 4
        'auto-lead-workflow',  # 5
        'auto-smart-followup',  # 6
        'auto-meeting-scheduler',  # 7
        'auto-form-to-crm',  # 8
        'auto-notifications',  # 9
        'auto-approval-workflow',  # 10
        'auto-document-generation',  # 11
        'auto-document-mgmt',  # 12
        'auto-data-sync',  # 13
        'auto-system-sync',  # 14
        'auto-reports',  # 15
        'auto-multi-system',  # 16
        'auto-end-to-end',  # 17
        'auto-sla-tracking',  # 18
        'auto-custom',  # 19
        # Service #20 is missing from this list - needs to be identified
    ],
    'aiAgentServices': [
        'ai-faq-bot',  # 21
        'ai-lead-qualifier',  # 22
        'ai-sales-agent',  # 23
        'ai-service-agent',  # 24
        'ai-action-agent',  # 25
        'ai-complex-workflow',  # 26
        'ai-predictive',  # 27
        'ai-full-integration',  # 28
        'ai-multi-agent',  # 29
        'ai-triage',  # 30
    ],
    'integrationServices': [
        'integration-simple',  # 31
        'integration-complex',  # 32
        'whatsapp-api-setup',  # 33
        'int-complex',  # 34
        'int-crm-marketing',  # 35
        'int-crm-accounting',  # 36
        'int-crm-support',  # 37
        'int-calendar',  # 38
        'int-ecommerce',  # 39
        'int-custom',  # 40
    ],
    'systemImplementations': [
        'impl-crm',  # 41
        'impl-project-management',  # 42
        'impl-marketing-automation',  # 43
        'impl-helpdesk',  # 44
        'impl-erp',  # 45
        'impl-ecommerce',  # 46
        'impl-workflow-platform',  # 47
        'impl-analytics',  # 48
        'impl-custom',  # 49
    ],
    'additionalServices': [
        'data-cleanup',  # 50
        'data-migration',  # 51
        'add-dashboard',  # 52
        'add-custom-reports',  # 53
        'training-workshops',  # 54
        'training-ongoing',  # 55
        'reports-automated',  # 56
        'support-ongoing',  # 57
        'consulting-strategy',  # 58
        'consulting-process',  # 59
    ]
}

def main():
    category_map = extract_service_category_map()

    # Organize actual services by category
    actual_by_category = {
        'automations': [],
        'aiAgentServices': [],
        'integrationServices': [],
        'systemImplementations': [],
        'additionalServices': []
    }

    for service_id, category in category_map.items():
        if category in actual_by_category:
            actual_by_category[category].append(service_id)

    print("=" * 100)
    print("DETAILED SERVICE ID AUDIT - ACTUAL vs EXPECTED")
    print("=" * 100)
    print()

    for category in ['automations', 'aiAgentServices', 'integrationServices', 'systemImplementations', 'additionalServices']:
        expected = EXPECTED_SERVICES.get(category, [])
        actual = sorted(actual_by_category[category])

        print(f"\n{'='*100}")
        print(f"CATEGORY: {category}")
        print(f"{'='*100}")
        print(f"Expected: {len(expected)} services")
        print(f"Actual: {len(actual)} services")
        print(f"Difference: {len(actual) - len(expected):+d}")
        print()

        # Find extra services (in actual but not in expected)
        extra = set(actual) - set(expected)
        if extra:
            print(f"EXTRA SERVICE IDs ({len(extra)}):")
            for service_id in sorted(extra):
                print(f"  - {service_id}")
            print()

        # Find missing services (in expected but not in actual)
        missing = set(expected) - set(actual)
        if missing:
            print(f"MISSING SERVICE IDs ({len(missing)}):")
            for service_id in sorted(missing):
                print(f"  - {service_id}")
            print()

        # Show all actual services
        print(f"ALL ACTUAL SERVICE IDs ({len(actual)}):")
        for i, service_id in enumerate(actual, 1):
            marker = " [EXTRA]" if service_id in extra else ""
            print(f"  {i:2d}. {service_id}{marker}")

    print()
    print("=" * 100)
    print("SUMMARY")
    print("=" * 100)
    print(f"Total expected services: 59")
    print(f"Total actual services: {len(category_map)}")
    print(f"Difference: {len(category_map) - 59:+d}")

if __name__ == "__main__":
    main()
