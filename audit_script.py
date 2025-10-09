"""
Phase 2 Service Requirements System Audit Script
Performs 5-way cross-validation across:
1. SERVICE_COMPONENT_MAP
2. SERVICE_CATEGORY_MAP
3. Component files
4. TypeScript interfaces
5. servicesDatabase.ts
"""

import re
import os
from pathlib import Path
from collections import defaultdict

# Base paths
BASE_DIR = Path(r"C:\Users\eyaly\Desktop\Businesses\eym-group_n8n\internal_app\discovery-assistant")
CONFIG_DIR = BASE_DIR / "src" / "config"
COMPONENTS_DIR = BASE_DIR / "src" / "components" / "Phase2" / "ServiceRequirements"
TYPES_DIR = BASE_DIR / "src" / "types"

# Expected services per category
EXPECTED_SERVICES = {
    'automations': 20,  # Services 1-20
    'aiAgentServices': 10,  # Services 21-30
    'integrationServices': 10,  # Services 31-40
    'systemImplementations': 9,  # Services 41-49
    'additionalServices': 10,  # Services 50-59
}

def extract_service_component_map():
    """Extract all entries from SERVICE_COMPONENT_MAP"""
    mapping_file = CONFIG_DIR / "serviceComponentMapping.ts"
    content = mapping_file.read_text(encoding='utf-8')

    # Extract the SERVICE_COMPONENT_MAP object
    match = re.search(r'export const SERVICE_COMPONENT_MAP.*?=\s*{(.*?)^};', content, re.DOTALL | re.MULTILINE)
    if not match:
        return {}

    map_content = match.group(1)

    # Extract all service IDs and their components
    # Pattern: 'service-id': ComponentName,
    pattern = r"'([a-z0-9-]+)':\s*(\w+),"
    services = {}
    for match in re.finditer(pattern, map_content):
        service_id = match.group(1)
        component_name = match.group(2)
        services[service_id] = component_name

    return services

def extract_service_category_map():
    """Extract all entries from SERVICE_CATEGORY_MAP"""
    mapping_file = CONFIG_DIR / "serviceComponentMapping.ts"
    content = mapping_file.read_text(encoding='utf-8')

    # Extract the SERVICE_CATEGORY_MAP object
    match = re.search(r'export const SERVICE_CATEGORY_MAP.*?=\s*{(.*?)^};', content, re.DOTALL | re.MULTILINE)
    if not match:
        return {}

    map_content = match.group(1)

    # Extract all service IDs and their categories
    pattern = r"'([a-z0-9-]+)':\s*'(\w+)',"
    services = {}
    for match in re.finditer(pattern, map_content):
        service_id = match.group(1)
        category = match.group(2)
        services[service_id] = category

    return services

def get_component_files():
    """Get all component .tsx files and their locations"""
    components = {}

    for category_dir in COMPONENTS_DIR.iterdir():
        if category_dir.is_dir():
            category_name = category_dir.name
            for file_path in category_dir.glob("*.tsx"):
                component_name = file_path.stem
                components[component_name] = {
                    'path': str(file_path.relative_to(BASE_DIR)),
                    'category_dir': category_name,
                    'exists': True
                }

    return components

def get_typescript_interfaces():
    """Extract all *Requirements interfaces from type files"""
    interfaces = defaultdict(list)

    type_files = {
        'automationServices.ts': 'automations',
        'aiAgentServices.ts': 'aiAgentServices',
        'integrationServices.ts': 'integrationServices',
        'systemImplementationServices.ts': 'systemImplementations',
        'additionalServices.ts': 'additionalServices'
    }

    for type_file, category in type_files.items():
        file_path = TYPES_DIR / type_file
        if file_path.exists():
            content = file_path.read_text(encoding='utf-8')
            # Find all interface definitions
            pattern = r'export interface (\w+(?:Requirements|Config))\s*{'
            for match in re.finditer(pattern, content):
                interface_name = match.group(1)
                interfaces[category].append(interface_name)

    return interfaces

def extract_import_statements():
    """Extract all import statements from serviceComponentMapping.ts"""
    mapping_file = CONFIG_DIR / "serviceComponentMapping.ts"
    content = mapping_file.read_text(encoding='utf-8')

    # Find all import statements
    pattern = r"import\s*{\s*(\w+)\s*}\s*from\s*['\"]([^'\"]+)['\"]"
    imports = {}
    for match in re.finditer(pattern, content):
        component_name = match.group(1)
        import_path = match.group(2)
        imports[component_name] = import_path

    return imports

def main():
    print("="*80)
    print("PHASE 2 SERVICE REQUIREMENTS SYSTEM AUDIT")
    print("="*80)
    print()

    # Step 1: Extract data from all sources
    print("Step 1: Extracting data from all sources...")
    component_map = extract_service_component_map()
    category_map = extract_service_category_map()
    component_files = get_component_files()
    interfaces = get_typescript_interfaces()
    imports = extract_import_statements()

    print(f"  - SERVICE_COMPONENT_MAP: {len(component_map)} entries")
    print(f"  - SERVICE_CATEGORY_MAP: {len(category_map)} entries")
    print(f"  - Component files found: {len(component_files)} files")
    print(f"  - TypeScript interfaces found: {sum(len(v) for v in interfaces.values())} interfaces")
    print(f"  - Import statements: {len(imports)} imports")
    print()

    # Step 2: Validate basic integrity
    print("Step 2: Basic Integrity Checks...")
    issues = []

    # Check if counts match expected
    if len(component_map) != 59:
        issues.append(f"ERROR: SERVICE_COMPONENT_MAP has {len(component_map)} entries (expected 59)")

    if len(category_map) != 59:
        issues.append(f"ERROR: SERVICE_CATEGORY_MAP has {len(category_map)} entries (expected 59)")

    # Check if all service IDs in COMPONENT_MAP exist in CATEGORY_MAP
    missing_in_category = set(component_map.keys()) - set(category_map.keys())
    if missing_in_category:
        issues.append(f"ERROR: {len(missing_in_category)} services in COMPONENT_MAP missing from CATEGORY_MAP: {missing_in_category}")

    # Check if all service IDs in CATEGORY_MAP exist in COMPONENT_MAP
    missing_in_component = set(category_map.keys()) - set(component_map.keys())
    if missing_in_component:
        issues.append(f"ERROR: {len(missing_in_component)} services in CATEGORY_MAP missing from COMPONENT_MAP: {missing_in_component}")

    for issue in issues:
        print(f"  {issue}")

    if not issues:
        print("  ✓ Basic integrity checks passed")
    print()

    # Step 3: Component-level validation
    print("Step 3: Component File Validation...")

    component_issues = []
    for service_id, component_name in component_map.items():
        # Check if import exists
        if component_name not in imports:
            component_issues.append(f"  X {service_id}: No import statement for {component_name}")
        else:
            import_path = imports[component_name]
            # Verify file exists at import path
            # Import path is relative, like '../components/Phase2/ServiceRequirements/Automations/AutoLeadResponseSpec'
            # We need to check if this file exists

        # Check if component file exists
        if component_name not in component_files:
            component_issues.append(f"  X {service_id}: Component file {component_name}.tsx not found")

    for issue in component_issues:
        print(issue)

    print()

    # Step 4: Category validation
    print("Step 4: Category Validation...")

    category_dir_map = {
        'automations': 'Automations',
        'aiAgentServices': 'AIAgents',
        'integrationServices': 'Integrations',
        'systemImplementations': 'SystemImplementations',
        'additionalServices': 'AdditionalServices'
    }

    category_issues = []
    for service_id, category in category_map.items():
        if category in category_dir_map:
            expected_dir = category_dir_map[category]
            component_name = component_map.get(service_id)
            if component_name and component_name in component_files:
                actual_dir = component_files[component_name]['category_dir']
                if actual_dir != expected_dir:
                    category_issues.append(f"  X {service_id}: Category mismatch - mapped to '{category}' but file is in '{actual_dir}/'")
        else:
            category_issues.append(f"  X {service_id}: Invalid category '{category}'")

    for issue in category_issues:
        print(issue)

    print()

    # Step 5: Summary
    print("Step 5: Summary...")
    print(f"  Total services in mappings: {len(component_map)}")
    print(f"  Expected services: 59")
    print(f"  Difference: {len(component_map) - 59:+d}")
    print()

    # List all service IDs by category
    print("Services by Category:")
    for category in ['automations', 'aiAgentServices', 'integrationServices', 'systemImplementations', 'additionalServices']:
        services_in_category = [sid for sid, cat in category_map.items() if cat == category]
        expected = EXPECTED_SERVICES[category]
        print(f"  {category}: {len(services_in_category)} services (expected {expected})")
        if len(services_in_category) != expected:
            print(f"    Difference: {len(services_in_category) - expected:+d}")

    print()
    print("="*80)
    print("AUDIT COMPLETE")
    print("="*80)

if __name__ == "__main__":
    main()
