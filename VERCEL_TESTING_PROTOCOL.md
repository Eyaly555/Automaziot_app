# Vercel Deployment Testing & Debugging Protocol

## Overview
This document provides a comprehensive testing protocol for the Discovery Assistant application deployed on Vercel at https://automaziot-app.vercel.app/

The protocol includes automated testing, error detection using Chrome DevTools, code fixes, and redeployment cycles until all features work perfectly.

---

## Testing Loop Structure

```
1. Navigate to Vercel App →
2. Test Feature →
3. Check Console for Errors →
4. If Error Found → Fix Code → Deploy → Return to Step 1
5. If No Error → Move to Next Feature → Return to Step 2
6. All Features Pass → Testing Complete ✅
```

---

## Phase 1: Initial Application Load

### Test 1.1: Homepage Load
**URL:** https://automaziot-app.vercel.app/

**Steps:**
1. Open Chrome DevTools (F12)
2. Navigate to Console tab
3. Navigate to Network tab
4. Load https://automaziot-app.vercel.app/
5. Check for errors in Console
6. Check for failed requests in Network tab

**Success Criteria:**
- ✅ Page loads without console errors
- ✅ No 404/500 errors in Network tab
- ✅ All static assets load (CSS, JS, images)
- ✅ Page title shows: "AutomAIziot Discovery Assistant - עוזר גילוי עסקי"

**Common Issues:**
- **404 errors for assets**: Check Vite build output directory
- **CORS errors**: Check API configuration
- **Module loading errors**: Check import paths

**Fix Location:**
- `vite.config.ts` - Build configuration
- `index.html` - HTML template
- `src/main.tsx` - Entry point

---

## Phase 2: Navigation Testing

### Test 2.1: Navigate to Clients List
**URL:** https://automaziot-app.vercel.app/clients

**Steps:**
1. From homepage, click "כל הלקוחות" button OR
2. Navigate directly to /clients
3. Check Console for errors
4. Check Network tab for API calls

**Success Criteria:**
- ✅ URL changes to /clients
- ✅ API call to `/api/zoho/potentials/list` is made
- ✅ No console errors
- ✅ Loading indicator appears

**Expected API Call:**
```
GET https://automaziot-app.vercel.app/api/zoho/potentials/list
Status: 200 OK
Response: { "success": true, "potentials": [...], "total": N }
```

**Common Issues:**
- **404 on API endpoint**: Check that `api/zoho/potentials-list.js` exists
- **500 Internal Server Error**: Check server logs in Vercel dashboard
- **CORS errors**: Ensure API is on same domain
- **Authentication errors (401)**: Check Zoho credentials in Vercel env vars

**Fix Locations:**
- `api/zoho/potentials-list.js` - API endpoint
- Vercel Environment Variables - ZOHO credentials
- `src/services/zohoAPI.ts` - API client

---

## Phase 3: Backend API Testing

### Test 3.1: List All Clients (GET)
**Endpoint:** `/api/zoho/potentials/list`

**Steps:**
1. Open Chrome DevTools → Network tab
2. Navigate to /clients
3. Find the API call in Network tab
4. Click on it to see details
5. Check Response tab for data
6. Check Headers tab for status code

**Success Criteria:**
- ✅ Status: 200 OK
- ✅ Response contains valid JSON
- ✅ Response structure matches:
```json
{
  "success": true,
  "potentials": [
    {
      "recordId": "string",
      "clientName": "string",
      "companyName": "string",
      "phase": "discovery|implementation|development|completed",
      "status": "not_started|in_progress|completed|on_hold|cancelled",
      "overallProgress": 0-100,
      "phase2Progress": 0-100,
      "phase3Progress": 0-100,
      "lastModified": "ISO date",
      "lastSync": "ISO date",
      "syncStatus": "synced|pending|error",
      "owner": "string",
      "email": "string",
      "phone": "string",
      "discoveryDate": "ISO date",
      "discoveryModulesCompleted": 0-6
    }
  ],
  "total": number,
  "page": 1,
  "per_page": 200,
  "more_records": boolean
}
```

**Error Handling:**
If request fails, check Console for error message:
- Look for error messages starting with `[Potentials List]`
- Check if error is from Zoho API or internal code

**Common Errors & Fixes:**

| Error | Cause | Fix |
|-------|-------|-----|
| `Missing Zoho credentials` | Env vars not set | Add to Vercel dashboard: `ZOHO_REFRESH_TOKEN`, `ZOHO_CLIENT_ID`, `ZOHO_CLIENT_SECRET` |
| `Token refresh failed` | Invalid credentials | Check Zoho OAuth tokens are correct |
| `Field not found: Meeting_Data_JS` | Field doesn't exist in Zoho | Create field in Zoho Potentials1 module |
| `Unexpected token '<'` | API route not found | Check `api/zoho/potentials-list.js` exists |
| `401 Unauthorized` | Token expired/invalid | Regenerate Zoho refresh token |

**Fix Locations:**
- `api/zoho/potentials-list.js` - Lines 17-32 (JSON parsing)
- `api/zoho/potentials-list.js` - Lines 92-111 (Field list)
- `api/zoho/service.js` - Lines 12-60 (Token refresh)

---

### Test 3.2: Get Single Client (GET)
**Endpoint:** `/api/zoho/potentials/:recordId/full`

**Steps:**
1. From clients list, click on any client card
2. Check Network tab for API call
3. Verify response contains full client data

**Success Criteria:**
- ✅ Status: 200 OK
- ✅ Response contains complete meeting data
- ✅ All phases (discovery, phase2, phase3) are included
- ✅ Response structure matches:
```json
{
  "success": true,
  "meeting": {
    "meetingId": "zoho-xxxxx",
    "phase": "string",
    "status": "string",
    "meetingInfo": { /* company, contact details */ },
    "characterization": { /* discovery modules */ },
    "phase2": { /* implementation spec */ },
    "phase3": { /* development tracking */ },
    "zohoIntegration": { /* sync info */ },
    "metadata": { /* timestamps, progress */ }
  },
  "recordId": "string"
}
```

**Common Errors & Fixes:**

| Error | Cause | Fix |
|-------|-------|-----|
| `Record not found` | Invalid recordId | Check recordId is correct |
| `Failed to parse Meeting_Data_JS` | Corrupted JSON in Zoho | Check Zoho field contains valid JSON |
| `404 Not Found` | API route not found | Check `api/zoho/potentials-full.js` exists |

**Fix Locations:**
- `api/zoho/potentials-full.js` - Lines 26-28 (JSON parsing)
- `api/zoho/potentials-full.js` - Lines 150-170 (Field list)

---

### Test 3.3: Sync Full Meeting Data (POST)
**Endpoint:** `/api/zoho/potentials/sync-full`

**Steps:**
1. Make changes to a meeting in the app
2. Click save or wait for auto-sync
3. Check Network tab for POST request
4. Verify response indicates success

**Success Criteria:**
- ✅ Status: 200 OK
- ✅ Response contains `"success": true`
- ✅ Response includes `recordId` and `syncTime`
- ✅ Data is updated in Zoho

**Request Body Example:**
```json
{
  "meeting": { /* full meeting object */ },
  "recordId": "xxxxx",
  "module": "Potentials1"
}
```

**Response Example:**
```json
{
  "success": true,
  "recordId": "xxxxx",
  "message": "Record updated successfully",
  "syncTime": "2025-10-02T10:30:00Z",
  "overallProgress": 45.5
}
```

**Common Errors & Fixes:**

| Error | Cause | Fix |
|-------|-------|-----|
| `Missing meeting data` | Invalid request body | Check client sends complete meeting object |
| `DUPLICATE_DATA` | Record already exists | Use recordId in request to update instead of create |
| `MANDATORY_NOT_FOUND` | Missing required fields | Check all required Zoho fields are included |
| `Data too large` | JSON exceeds 32K chars | Check compression function in `sync-full.js` |

**Fix Locations:**
- `api/zoho/sync-full.js` - Lines 11-33 (JSON compression)
- `api/zoho/sync-full.js` - Lines 70-111 (Transform function)

---

### Test 3.4: Update Phase/Status (PUT)
**Endpoint:** `/api/zoho/potentials/:recordId/phase`

**Steps:**
1. Change phase using PhaseNavigator component
2. Check Network tab for PUT request
3. Verify response indicates success

**Success Criteria:**
- ✅ Status: 200 OK
- ✅ Response contains `"success": true`
- ✅ Phase/status updated in Zoho

**Request Body Example:**
```json
{
  "recordId": "xxxxx",
  "phase": "implementation",
  "status": "in_progress",
  "notes": "Optional notes"
}
```

**Common Errors & Fixes:**

| Error | Cause | Fix |
|-------|-------|-----|
| `Invalid phase value` | Phase not in allowed list | Check phase is one of: discovery, implementation, development, completed |
| `Invalid status value` | Status not in allowed list | Check status is one of: not_started, in_progress, completed, on_hold, cancelled |

**Fix Locations:**
- `api/zoho/update-phase.js` - Lines 10-21 (Validation functions)

---

### Test 3.5: Search Clients (GET)
**Endpoint:** `/api/zoho/potentials/search?q=<query>`

**Steps:**
1. Use search box in clients list
2. Type search query (min 2 characters)
3. Check Network tab for API call
4. Verify results match query

**Success Criteria:**
- ✅ Status: 200 OK
- ✅ Results contain query string in name/company/email/phone
- ✅ Response structure matches potentials list format

**Common Errors & Fixes:**

| Error | Cause | Fix |
|-------|-------|-----|
| `Missing search query` | Empty query | Frontend validation should prevent this |
| `Query too short` | Less than 2 chars | Frontend validation should prevent this |
| `204 No Content` | No results found | This is normal, not an error |

**Fix Locations:**
- `api/zoho/search.js` - Lines 66-78 (Search criteria builder)

---

## Phase 4: Frontend UI Testing

### Test 4.1: Clients List View
**URL:** https://automaziot-app.vercel.app/clients

**Visual Elements to Check:**
- ✅ Header shows "כל הלקוחות" with count badge
- ✅ Search bar visible
- ✅ Filter dropdowns (phase, status) visible
- ✅ Sort dropdown visible
- ✅ View toggle (grid/list) visible
- ✅ Refresh button visible
- ✅ Client cards displayed in grid or list

**Interaction Tests:**

1. **Search:**
   - Type in search box
   - Verify filtering happens
   - Clear search, verify all clients shown

2. **Filter by Phase:**
   - Select "Discovery"
   - Verify only discovery clients shown
   - Select "All" - verify all clients shown

3. **Filter by Status:**
   - Select "In Progress"
   - Verify only in-progress clients shown

4. **Sort:**
   - Sort by name (A-Z)
   - Sort by date (newest first)
   - Sort by progress (highest first)

5. **View Toggle:**
   - Click grid view icon
   - Verify cards in grid layout
   - Click list view icon
   - Verify cards in list layout

6. **Refresh:**
   - Click refresh button
   - Verify loading indicator
   - Verify data reloads

**Common Issues:**

| Issue | Cause | Fix |
|-------|-------|-----|
| Empty list | No clients in Zoho | Add test clients to Zoho |
| Cards not rendering | Data structure mismatch | Check `ClientCard.tsx` props |
| Search not working | Filter logic error | Check `ClientsListView.tsx` filtering |

**Fix Locations:**
- `src/components/Clients/ClientsListView.tsx` - Lines 15-80 (State & filtering)
- `src/components/Clients/ClientCard.tsx` - Card component

---

### Test 4.2: Client Card Display
**Location:** Within /clients page

**Visual Elements per Card:**
- ✅ Phase icon (emoji)
- ✅ Client name
- ✅ Company name
- ✅ Progress bar
- ✅ Progress percentage
- ✅ Phase badge
- ✅ Status badge
- ✅ Sync status indicator
- ✅ Last modified date
- ✅ Discovery modules count (if in discovery)

**Interaction Tests:**
1. Click on card
2. Verify navigation to client detail view
3. Verify full client data loads

**Common Issues:**

| Issue | Cause | Fix |
|-------|-------|-----|
| Missing data | Field not in API response | Check API field mapping |
| Wrong colors | Phase/status not mapped | Check `ClientCard.tsx` config functions |
| Broken icons | Import error | Check lucide-react imports |

**Fix Locations:**
- `src/components/Clients/ClientCard.tsx` - Lines 8-50 (Rendering logic)

---

### Test 4.3: Sync Status Indicator
**Location:** Fixed position bottom-left

**Visual States:**
- ✅ Blue badge with spinner: "מסנכרן..." (syncing)
- ✅ Green badge with checkmark: "מסונכרן" (synced)
- ✅ Red toast: Error message (on error)

**Interaction Tests:**
1. Make a change to trigger sync
2. Verify indicator changes to "syncing"
3. Wait for sync to complete
4. Verify indicator changes to "synced"
5. Check relative time display updates

**Common Issues:**

| Issue | Cause | Fix |
|-------|-------|-----|
| Indicator not showing | Component not mounted | Check `AppContent.tsx` includes component |
| Always showing "syncing" | Sync not completing | Check API errors in console |
| Errors not displaying | Toast logic error | Check `SyncStatusIndicator.tsx` |

**Fix Locations:**
- `src/components/Common/SyncStatusIndicator.tsx`
- `src/components/AppContent.tsx` - Lines 58, 91-92 (Component mounting)

---

### Test 4.4: Auto-Sync Service
**Behavior:** Automatic sync every 5 minutes

**Testing:**
1. Open /clients page
2. Check Console for sync activity
3. Wait 5 minutes
4. Verify auto-sync triggers

**Console Messages to Look For:**
```
[Auto Sync] Starting sync...
[Sync Full] Successfully updated record: xxxxx
```

**Common Issues:**

| Issue | Cause | Fix |
|-------|-------|-----|
| Auto-sync not starting | Service not initialized | Check `AppContent.tsx` useEffect |
| Sync interval wrong | Configuration error | Check `autoSyncService.ts` interval |

**Fix Locations:**
- `src/services/autoSyncService.ts` - Lines 5 (Interval configuration)
- `src/components/AppContent.tsx` - Lines 40-55 (Service lifecycle)

---

### Test 4.5: Phase Navigator
**Location:** In meeting detail view

**Visual Elements:**
- ✅ Phase buttons (Discovery, Implementation, Development, Completed)
- ✅ Current phase highlighted
- ✅ Disabled phases (cannot skip phases)

**Interaction Tests:**
1. Click next phase
2. Verify phase changes
3. Check Network tab for PUT request to update-phase endpoint
4. Verify immediate sync to Zoho

**Common Issues:**

| Issue | Cause | Fix |
|-------|-------|-----|
| Phase not updating | API call failing | Check console for errors |
| Can skip phases | Validation not working | Check `PhaseNavigator.tsx` logic |
| No sync to Zoho | Update call not implemented | Check `PhaseNavigator.tsx` Lines 52-78 |

**Fix Locations:**
- `src/components/Common/PhaseNavigator.tsx` - Lines 1-5, 52-78

---

## Phase 5: Error Handling & Edge Cases

### Test 5.1: No Internet Connection
**Steps:**
1. Open DevTools → Network tab
2. Set throttling to "Offline"
3. Try to load /clients
4. Verify graceful error handling

**Success Criteria:**
- ✅ User-friendly error message displayed
- ✅ No uncaught exceptions in console
- ✅ App doesn't crash

---

### Test 5.2: Empty Zoho Response
**Steps:**
1. Ensure Zoho has no records
2. Load /clients
3. Verify empty state message

**Success Criteria:**
- ✅ "No clients found" message
- ✅ No loading spinner stuck
- ✅ No console errors

---

### Test 5.3: Malformed API Response
**Steps:**
1. Check console when API returns unexpected data
2. Verify app handles gracefully

**Success Criteria:**
- ✅ Error caught and logged
- ✅ User sees error message
- ✅ App remains functional

---

### Test 5.4: Large Dataset (100+ clients)
**Steps:**
1. Load /clients with many records
2. Test scrolling performance
3. Test search/filter performance

**Success Criteria:**
- ✅ No lag when scrolling
- ✅ Search is instant
- ✅ No memory leaks

---

## Phase 6: Mobile Responsiveness

### Test 6.1: Mobile View (375px width)
**Steps:**
1. Open DevTools → Toggle device toolbar
2. Select iPhone SE (375px)
3. Navigate through app

**Elements to Check:**
- ✅ Search bar fits on screen
- ✅ Filters accessible
- ✅ Cards stack vertically
- ✅ Text readable
- ✅ Buttons clickable (not too small)

---

### Test 6.2: Tablet View (768px width)
**Steps:**
1. Select iPad (768px)
2. Navigate through app

**Elements to Check:**
- ✅ 2-column grid layout
- ✅ All features accessible
- ✅ No horizontal scroll

---

## Phase 7: Performance Testing

### Test 7.1: Lighthouse Audit
**Steps:**
1. Open DevTools → Lighthouse
2. Run audit for Performance
3. Check score

**Success Criteria:**
- ✅ Performance score > 80
- ✅ Accessibility score > 90
- ✅ Best Practices score > 80
- ✅ SEO score > 80

---

### Test 7.2: Network Performance
**Steps:**
1. Open DevTools → Network
2. Check total page size
3. Check number of requests

**Success Criteria:**
- ✅ Initial load < 2MB
- ✅ API response time < 1s
- ✅ No unnecessary requests

---

## Phase 8: Cross-Browser Testing

### Test 8.1: Chrome (Latest)
- ✅ All features work
- ✅ No console errors

### Test 8.2: Firefox (Latest)
- ✅ All features work
- ✅ No console errors

### Test 8.3: Safari (Latest)
- ✅ All features work
- ✅ No console errors

### Test 8.4: Edge (Latest)
- ✅ All features work
- ✅ No console errors

---

## Automated Debugging Process

### Using Chrome DevTools MCP Server

**Step 1: Navigate to App**
```javascript
await chrome_navigate({ url: "https://automaziot-app.vercel.app/" });
```

**Step 2: Take Snapshot**
```javascript
await chrome_screenshot({ fullPage: true, savePng: true });
```

**Step 3: Check Console**
```javascript
const console = await chrome_console({ maxMessages: 100 });
// Look for errors
```

**Step 4: Check Network**
```javascript
const network = await chrome_network_debugger_start();
// Perform actions
const requests = await chrome_network_debugger_stop();
// Analyze failed requests
```

**Step 5: Navigate to Clients**
```javascript
await chrome_navigate({ url: "https://automaziot-app.vercel.app/clients" });
await chrome_screenshot({ fullPage: true });
const console2 = await chrome_console({ maxMessages: 100 });
```

**Step 6: Test Search**
```javascript
const searchInput = await chrome_get_interactive_elements({ textQuery: "search" });
await chrome_fill_or_select({ selector: searchInput[0].selector, value: "test" });
await chrome_keyboard({ keys: "Enter" });
```

**Step 7: Check for Errors**
```javascript
const finalConsole = await chrome_console({ maxMessages: 100 });
// Filter for errors
const errors = finalConsole.filter(msg => msg.type === 'error');
```

---

## Fix & Redeploy Cycle

### When Error Found:

1. **Identify Error:**
   - Note error message
   - Note which component/file
   - Note reproduction steps

2. **Locate Code:**
   - Use error stack trace
   - Check relevant file from this document

3. **Fix Code:**
   - Make minimal changes
   - Add console.log for debugging if needed
   - Test locally if possible

4. **Deploy:**
   ```bash
   git add .
   git commit -m "Fix: [describe fix]"
   git push
   ```
   - Wait for Vercel deployment
   - Check deployment status in Vercel dashboard

5. **Retest:**
   - Navigate to app
   - Reproduce original error
   - Verify fix works
   - Check for new errors

6. **If Still Broken:**
   - Return to step 1
   - Try different approach

7. **If Fixed:**
   - Mark test as passed ✅
   - Move to next test

---

## Quick Reference: Common Fixes

### Fix 1: API Endpoint Not Found (404)
**File:** Check that these files exist:
- `api/zoho/potentials-list.js`
- `api/zoho/potentials-full.js`
- `api/zoho/sync-full.js`
- `api/zoho/update-phase.js`
- `api/zoho/search.js`

**Vercel Config:** Check `vercel.json` (if exists) has correct routes

---

### Fix 2: Zoho Authentication Failed (401)
**Location:** Vercel Dashboard → Project → Settings → Environment Variables

**Required Variables:**
- `ZOHO_REFRESH_TOKEN`
- `ZOHO_CLIENT_ID`
- `ZOHO_CLIENT_SECRET`
- `ZOHO_API_DOMAIN` (optional, defaults to https://www.zohoapis.com)

**After adding:** Redeploy required!

---

### Fix 3: Field Not Found in Zoho
**Error:** `Field not found: Meeting_Data_JS`

**Fix:** Add fields to Zoho Potentials1 module:
1. Log into Zoho CRM
2. Navigate to Settings → Modules and Fields
3. Select Potentials1
4. Add missing fields (see ZOHO_FIELDS_MAPPING.md)

---

### Fix 4: CORS Error
**Error:** `Access-Control-Allow-Origin`

**Fix:** Should not happen on Vercel (same domain)
If it does, check API is returning correct headers

---

### Fix 5: JSON Parse Error
**Error:** `Unexpected token '<'`

**Cause:** API returning HTML instead of JSON

**Fix:**
- Check API endpoint exists
- Check API doesn't have syntax errors
- Check API returns JSON

---

## Testing Completion Checklist

### Backend API
- [ ] GET /api/zoho/potentials/list returns 200
- [ ] GET /api/zoho/potentials/:id/full returns 200
- [ ] POST /api/zoho/potentials/sync-full returns 200
- [ ] PUT /api/zoho/potentials/:id/phase returns 200
- [ ] GET /api/zoho/potentials/search returns 200

### Frontend Pages
- [ ] / (homepage) loads without errors
- [ ] /clients loads without errors
- [ ] Client detail view loads without errors

### UI Components
- [ ] ClientCard displays correctly
- [ ] ClientsListView displays correctly
- [ ] SyncStatusIndicator displays correctly
- [ ] PhaseNavigator displays correctly

### Features
- [ ] Search clients works
- [ ] Filter by phase works
- [ ] Filter by status works
- [ ] Sort clients works
- [ ] View toggle (grid/list) works
- [ ] Click client card navigates to detail
- [ ] Change phase syncs to Zoho
- [ ] Auto-sync runs every 5 minutes
- [ ] Manual refresh works

### Error Handling
- [ ] Empty state displays when no clients
- [ ] Error message displays on API failure
- [ ] Loading states display correctly
- [ ] No uncaught exceptions

### Performance
- [ ] Page load < 3s
- [ ] API response < 1s
- [ ] No console warnings/errors
- [ ] No memory leaks

### Responsive
- [ ] Mobile (375px) works
- [ ] Tablet (768px) works
- [ ] Desktop (1920px) works

### Cross-Browser
- [ ] Chrome works
- [ ] Firefox works
- [ ] Safari works
- [ ] Edge works

---

## Final Report Template

After completing all tests, create final report:

```markdown
# Testing Report - [Date]

## Summary
- Total Tests: X
- Passed: Y
- Failed: Z
- Success Rate: Y/X %

## Failed Tests
1. [Test Name]
   - Error: [Error Message]
   - Fix Applied: [Description]
   - Status: Fixed / Pending

## Performance Metrics
- Page Load Time: Xs
- API Response Time: Xs
- Lighthouse Score: X/100

## Known Issues
- [Issue 1]
- [Issue 2]

## Recommendations
- [Recommendation 1]
- [Recommendation 2]

## Deployment Info
- Deployment URL: https://automaziot-app.vercel.app/
- Git Commit: [hash]
- Deployed At: [timestamp]
```

---

## Emergency Rollback

If major issues found and cannot be fixed quickly:

1. Go to Vercel Dashboard
2. Find previous successful deployment
3. Click "..." → "Promote to Production"
4. Fix issues in development
5. Redeploy when ready

---

## End of Protocol

**Remember:** Test systematically, fix one issue at a time, and always verify the fix before moving to the next test.

**Good Luck! 🚀**
