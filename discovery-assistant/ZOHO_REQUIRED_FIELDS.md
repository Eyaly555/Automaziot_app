# Required Zoho CRM Fields for Discovery Assistant

## Potentials1 Module - Custom Fields Setup

These fields **MUST** be created in your Zoho CRM Potentials1 module before using the Discovery Assistant integration.

### Basic Information Fields
| Field Label | API Name | Field Type | Max Length | Required | Description |
|------------|----------|------------|------------|----------|-------------|
| Company's Name | `Company_s_Name` | Single Line | 255 | Yes | Company name from discovery |
| Email | `Email` | Email | - | No | Contact email address |
| Phone | `Phone` | Phone | - | No | Contact phone number |
| Budget Range | `Budget_Range` | Single Line | 100 | No | Budget information |
| Requested Services | `Requested_Services` | Multi Line (Small) | 2000 | No | Services requested by client |
| Additional Notes | `Additional_Notes` | Multi Line (Small) | 2000 | No | Additional notes from widget |

### Discovery Data Fields (Critical)
| Field Label | API Name | Field Type | Max Length | Required | Description |
|------------|----------|------------|------------|----------|-------------|
| Discovery Progress | `Discovery_Progress` | **Multi Line (Large)** | **65535** | **Yes** | **Full meeting JSON data** |
| Discovery Last Update | `Discovery_Last_Update` | Date/Time | - | Yes | Last sync timestamp |
| Discovery Completion | `Discovery_Completion` | Single Line | 10 | Yes | Percentage complete (e.g., "45%") |
| Discovery Status | `Discovery_Status` | Single Line | 50 | Yes | "In Progress" or "Completed" |
| Discovery Date | `Discovery_Date` | Date | - | No | Date discovery was created |
| Discovery Modules Completed | `Discovery_Modules_Completed` | Number | - | No | Count of modules with data |
| Discovery Notes | `Discovery_Notes` | Multi Line (Small) | 2000 | No | Metadata JSON (contact info, etc.) |

### Optional ROI Fields (Currently Not Used)
These fields are **commented out** in the code. Only create them if you plan to use ROI tracking in Zoho:

| Field Label | API Name | Field Type | Description |
|------------|----------|------------|-------------|
| Expected Revenue | `Expected_Revenue` | Currency | Monthly ROI savings |
| ROI Annual Savings | `ROI_Annual_Savings` | Currency | Annual ROI projection |
| ROI Implementation Cost | `ROI_Implementation_Cost` | Currency | Implementation cost estimate |
| ROI Payback Months | `ROI_Payback_Months` | Number | Payback period in months |

---

## How to Create Custom Fields in Zoho

1. Go to **Setup** → **Customization** → **Modules and Fields**
2. Select **Potentials1** module
3. Click **Add Custom Field**
4. For each field above:
   - Enter Field Label
   - Select Field Type
   - Set Max Length (if applicable)
   - Set as Required if marked above
   - Click **Save**

### Important Notes:

⚠️ **Critical:** The `Discovery_Progress` field MUST be **Multi Line (Large)** with at least **32000 characters** capacity to store the full meeting JSON.

⚠️ **API Names:** Make sure the API names match exactly (case-sensitive). Zoho usually auto-generates these from the label, but you can customize them.

⚠️ **ROI Fields:** Currently disabled in code. To enable, uncomment lines 88-97 in `/api/zoho/sync.js` and create the fields in Zoho.

---

## What Gets Synced to Zoho

### On Every Sync (Main sync.js):
```json
{
  "Name": "Company Name",
  "Stage": "Qualification",
  "Discovery_Progress": "{...full meeting JSON...}",
  "Discovery_Last_Update": "2025-09-29T20:30:00.000Z",
  "Discovery_Completion": "45%",
  "Discovery_Status": "In Progress",
  "Discovery_Date": "2025-09-29",
  "Discovery_Modules_Completed": 5,
  "Discovery_Notes": "{contactName, clientName, role, industry, employeeCount}"
}
```

### On Emergency Save (Beacon sync):
```json
{
  "Discovery_Progress": "{...full meeting JSON...}",
  "Discovery_Last_Update": "2025-09-29T20:30:00.000Z",
  "Discovery_Completion": "45%",
  "Discovery_Status": "In Progress"
}
```

---

## Verification Checklist

Before testing the integration, verify:

- [ ] All required fields exist in Potentials1 module
- [ ] `Discovery_Progress` field is Multi Line (Large) with sufficient capacity
- [ ] Field API names match exactly (check in field settings)
- [ ] Zoho refresh token is set in Vercel environment variables
- [ ] `ZOHO_CLIENT_ID`, `ZOHO_CLIENT_SECRET`, `ZOHO_REFRESH_TOKEN` are configured
- [ ] Widget is deployed and accessible from Zoho CRM
- [ ] Test record exists with `Company_s_Name` populated

---

## Testing the Integration

1. **Create Test Record:**
   - Go to Potentials1 in Zoho
   - Create a new record
   - Fill in `Company_s_Name`, `Email`, `Phone`

2. **Launch Widget:**
   - Open the record
   - Click "Launch Discovery Assistant" button
   - Widget should open with pre-filled data

3. **Fill Discovery Data:**
   - Complete at least 2-3 modules
   - Check auto-save notifications

4. **Verify Sync:**
   - Wait 30 seconds or click manual sync
   - Go back to Zoho record
   - Check `Discovery_Progress` field has JSON data
   - Check `Discovery_Completion` shows percentage
   - Check `Discovery_Last_Update` has recent timestamp

5. **Test Reload:**
   - Close Discovery Assistant
   - Reopen from same Zoho record
   - Verify data is loaded correctly

---

## Troubleshooting

### Sync Error 500:
- Check Vercel logs for detailed error message
- Verify all required fields exist in Zoho
- Ensure field API names match exactly
- Check that `Discovery_Progress` field is large enough

### Data Not Appearing:
- Verify sync actually succeeded (check response)
- Refresh Zoho page
- Check field permissions (your user can edit custom fields)

### Widget Not Loading Record:
- Check widget configuration has correct Entity/RecordID mapping
- Verify Zoho API permissions include CRM.modules.ALL
- Check browser console for JavaScript errors