# Zoho CRM - Discovery_Status Field Setup Guide

## Overview
This guide will walk you through adding the `Discovery_Status` field to your Zoho CRM Potentials1 module.

## Prerequisites
- Zoho CRM Administrator access
- Access to Settings → Customization section

---

## Step 1: Access Module Configuration

1. Log into your Zoho CRM account
2. Click the **Settings** gear icon (top-right)
3. Navigate to **Customization** → **Modules and Fields**
4. Select **Potentials** (or Potentials1) from the module list

---

## Step 2: Create Discovery_Status Field

### Field Configuration

Click **+ New Field** and configure as follows:

| Setting | Value |
|---------|-------|
| **Field Label** | Discovery Status |
| **Field Name** | `Discovery_Status` (auto-generated) |
| **Field Type** | Pick List (Single Select) |
| **Required** | No (unchecked) |
| **Unique** | No (unchecked) |

### Picklist Values

Add the following 5 options **in this exact order**:

1. `discovery_started`
2. `proposal`
3. `proposal_sent`
4. `technical_details_collection`
5. `implementation_started`

**Important Notes:**
- Values must be lowercase with underscores (no spaces)
- Order matters for logical workflow progression
- Do not add display names - keep values as-is

### Default Value

Set default value to: `discovery_started`

### Field Properties

- ✅ Show in Related List
- ✅ Show in Search Results
- ✅ Allow in Workflow Rules
- ✅ Allow in Reports

---

## Step 3: Layout Assignment

1. Go to **Layout** tab
2. Ensure the field is visible in:
   - Standard Layout
   - Any custom layouts you use
3. Position suggestion: Place near "Stage" field for easy viewing

---

## Step 4: Verify Field Creation

### Manual Verification

1. Open any Potential record
2. Look for "Discovery Status" field
3. Verify dropdown shows all 5 values
4. Try selecting different values and saving

### API Verification

Run this curl command (replace `{ACCESS_TOKEN}` and `{RECORD_ID}`):

```bash
curl -X GET "https://www.zohoapis.com/crm/v8/Potentials1/{RECORD_ID}?fields=Discovery_Status" \
  -H "Authorization: Zoho-oauthtoken {ACCESS_TOKEN}"
```

**Expected Response:**
```json
{
  "data": [
    {
      "id": "1234567890",
      "Discovery_Status": "discovery_started"
    }
  ]
}
```

---

## Step 5: Create Zoho Views (Recommended)

Create filtered views for each status to quickly see pipeline stages:

### View 1: Active Discoveries
- **Name:** Active Discoveries
- **Filter:** `Discovery_Status = discovery_started`
- **Use:** See all ongoing discovery meetings

### View 2: Pending Proposals
- **Name:** Pending Proposals
- **Filter:** `Discovery_Status = proposal`
- **Use:** Track proposals being built

### View 3: Proposals Sent
- **Name:** Proposals Sent
- **Filter:** `Discovery_Status = proposal_sent`
- **Use:** Follow up with clients who have proposals

### View 4: Technical Spec Collection
- **Name:** Technical Spec Phase
- **Filter:** `Discovery_Status = technical_details_collection`
- **Use:** Track Phase 2 progress

### View 5: In Implementation
- **Name:** In Implementation
- **Filter:** `Discovery_Status = implementation_started`
- **Use:** See active development projects

---

## Step 6: Create Zoho Reports (Optional)

### Status Distribution Report

1. Go to **Reports** → **Create Report**
2. Module: Potentials
3. Group By: Discovery_Status
4. Show: Count of Potentials
5. Chart Type: Pie Chart

**Result:** Visual breakdown of pipeline by stage

### Stage Duration Report

1. Create Report from Potentials
2. Columns: Potential Name, Discovery_Status, Modified Time, Created Time
3. Calculate: Days between Created and Modified
4. Group By: Discovery_Status
5. Show: Average days in each stage

**Result:** Identify bottlenecks in workflow

---

## Troubleshooting

### Issue: Field Not Appearing in API

**Solution:**
1. Check field API name is exactly `Discovery_Status`
2. Verify field permissions for your API user
3. Refresh OAuth token and try again

### Issue: Values Not Syncing from App

**Solution:**
1. Check backend logs for sync errors
2. Verify API has write permissions to Potentials module
3. Test manual API update with curl

### Issue: Field Shows Wrong Value

**Solution:**
1. Check app calculates status correctly (see test script)
2. Verify no workflow rules are overwriting the field
3. Check sync timing - allow 5 seconds for propagation

---

## Next Steps

After completing this setup:

1. ✅ Run the verification script: `node scripts/verify-zoho-field.js`
2. ✅ Create a test Potential and verify field works
3. ✅ Inform development team that Zoho is ready
4. ✅ Proceed with backend/frontend implementation

---

## Support

If you encounter issues:
- Check Zoho CRM API documentation: https://www.zoho.com/crm/developer/docs/
- Review API error logs in app backend
- Contact Zoho support for CRM-specific issues
