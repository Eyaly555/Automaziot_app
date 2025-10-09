# Discovery_Status Workflow - Deployment Checklist

This checklist ensures the Discovery_Status workflow is properly deployed and functioning in production.

## Pre-Deployment Checklist

### 1. ✅ Zoho CRM Configuration

**Action Required:** Add `Discovery_Status` field to Zoho CRM Potentials1 module

- [ ] Log in to Zoho CRM Admin Panel
- [ ] Navigate to Settings → Customization → Modules
- [ ] Select "Potentials" module
- [ ] Add new Picklist field: `Discovery_Status`
- [ ] Add these exact values (case-sensitive):
  - `discovery_started`
  - `proposal`
  - `proposal_sent`
  - `technical_details_collection`
  - `implementation_started`
- [ ] Set field as optional (not mandatory)
- [ ] Enable field for Create, Edit, and Detail views
- [ ] Save changes

**Verification:**
```bash
node scripts/verify-zoho-field.js [test-record-id]
```

Expected output:
```
✅ Connected to Zoho API
✅ Discovery_Status field exists
✅ Successfully updated test record
```

### 2. ✅ Environment Variables

Verify all required environment variables are set in production:

**Vercel Environment Variables:**
- [ ] `ZOHO_REFRESH_TOKEN` - Zoho OAuth refresh token
- [ ] `ZOHO_CLIENT_ID` - Zoho OAuth client ID
- [ ] `ZOHO_CLIENT_SECRET` - Zoho OAuth client secret
- [ ] `ZOHO_API_DOMAIN` - https://www.zohoapis.com
- [ ] `VITE_SUPABASE_URL` - Supabase project URL
- [ ] `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key

**Verification:**
```bash
# Check Vercel environment variables
vercel env ls

# Verify values (without exposing secrets)
vercel env pull .env.local
cat .env.local | grep -E "(ZOHO|SUPABASE)" | wc -l  # Should output 6
```

### 3. ✅ Code Review

Verify all implementation files are correct:

**Backend Files:**
- [ ] `api/zoho/helpers/discoveryStatus.js` exists and exports `calculateDiscoveryStatus()`
- [ ] `api/zoho/sync.js` line 2: imports `calculateDiscoveryStatus`
- [ ] `api/zoho/sync.js` line 79: uses `Discovery_Status: calculateDiscoveryStatus(meeting)`

**Frontend Files:**
- [ ] `src/services/discoveryStatusService.ts` exists and exports all functions
- [ ] `src/types/proposal.ts` has `proposalSent` and `proposalSentAt` fields
- [ ] `src/components/Modules/Proposal/ProposalModule.tsx` line 24: imports `markProposalAsSent`
- [ ] ProposalModule.tsx `handleDownloadPDF()` calls `markProposalAsSent()`
- [ ] ProposalModule.tsx `sendProposalToClient()` calls `markProposalAsSent()`
- [ ] `src/components/Common/DiscoveryStatusBadge.tsx` exists

**Documentation:**
- [ ] `ZOHO_DISCOVERY_STATUS_SETUP.md` exists
- [ ] `CLAUDE.md` updated with Discovery_Status section
- [ ] `DEPLOYMENT_CHECKLIST_DISCOVERY_STATUS.md` exists (this file)

**Scripts:**
- [ ] `scripts/verify-zoho-field.js` exists and is executable
- [ ] `scripts/test-discovery-status.js` exists and is executable

### 4. ✅ Build Verification

Ensure the application builds without errors:

```bash
# Install dependencies
npm install

# Run TypeScript compilation
npm run build:typecheck

# Build production bundle
npm run build

# Check for errors in build output
echo $?  # Should output 0 (success)
```

- [ ] TypeScript compilation passes (no errors)
- [ ] Production build succeeds
- [ ] No console warnings about missing modules

### 5. ✅ Local Testing

Test the workflow locally before deploying:

```bash
# Start dev server
npm run dev

# In another terminal, run comprehensive test
node scripts/test-discovery-status.js
```

**Test Steps:**
- [ ] Test 1: Fill module data → status = `discovery_started`
- [ ] Test 2: Select services → status = `proposal`
- [ ] Test 3: Download PDF → status = `proposal_sent`
- [ ] Test 4: Client approve → status = `technical_details_collection`
- [ ] Test 5: Complete Phase 2 → status = `implementation_started`

**Expected Result:**
```
All tests passed! 5/5 ✓
```

---

## Deployment Steps

### Step 1: Deploy to Vercel

```bash
# Ensure you're on the correct branch
git branch  # Should show main or your deployment branch

# Deploy to production
vercel --prod

# Or use the Vercel dashboard to deploy latest commit
```

- [ ] Deployment succeeded
- [ ] Production URL is accessible: https://automaziot-app.vercel.app/
- [ ] No deployment errors in Vercel logs

### Step 2: Verify Production Build

Check Vercel deployment logs:

```bash
# View recent logs
vercel logs --prod

# Look for these success indicators:
# ✓ Compiled successfully
# ✓ Collecting page data
# ✓ Generating static pages
```

- [ ] Build completed successfully
- [ ] No errors in build logs
- [ ] All pages generated correctly

### Step 3: Test Production Sync Endpoint

Test the Zoho sync endpoint in production:

```bash
# Test sync endpoint (replace [recordId] with actual Zoho record)
curl -X POST https://automaziot-app.vercel.app/api/zoho/sync \
  -H "Content-Type: application/json" \
  -d '{
    "meeting": {
      "meetingId": "test-production",
      "clientName": "Production Test Client",
      "modules": {
        "overview": {
          "companyName": "Test Company"
        }
      }
    },
    "recordId": "[recordId]"
  }'
```

- [ ] Endpoint returns 200 status
- [ ] Response includes `"success": true`
- [ ] Response includes `"recordId": "[recordId]"`

### Step 4: Verify Zoho Integration

Check that data appears correctly in Zoho CRM:

- [ ] Log in to Zoho CRM
- [ ] Navigate to Potentials → [Test Record]
- [ ] Verify `Discovery_Status` field exists
- [ ] Verify field shows `discovery_started` (or appropriate value)
- [ ] Verify field updates when meeting data changes

---

## Post-Deployment Verification

### User Flow Testing (Manual QA)

Test the complete user journey in production:

**Flow 1: Discovery Started**
- [ ] Open https://automaziot-app.vercel.app/
- [ ] Create new meeting
- [ ] Fill ANY field in ANY module (e.g., Company Name in Overview)
- [ ] Wait 5 seconds for auto-sync
- [ ] Check Zoho: `Discovery_Status` = `discovery_started`

**Flow 2: Proposal**
- [ ] Continue with same meeting
- [ ] Navigate to Proposal Module
- [ ] Select/unselect ANY service
- [ ] Click "שמור והמשך" (Save and Continue)
- [ ] Wait 5 seconds for auto-sync
- [ ] Check Zoho: `Discovery_Status` = `proposal`

**Flow 3: Proposal Sent**
- [ ] Continue with same meeting
- [ ] In Proposal Module, click "הורד PDF" (Download PDF) OR "שלח הצעת מחיר ללקוח" (Send Proposal)
- [ ] Wait 5 seconds for auto-sync
- [ ] Check Zoho: `Discovery_Status` = `proposal_sent`

**Flow 4: Technical Details Collection**
- [ ] Continue with same meeting
- [ ] Navigate to Client Approval page
- [ ] Click "הלקוח אישר" (Client Approved) button
- [ ] Wait 5 seconds for auto-sync
- [ ] Check Zoho: `Discovery_Status` = `technical_details_collection`

**Flow 5: Implementation Started**
- [ ] Continue with same meeting
- [ ] Complete ALL service requirement forms in Phase 2
- [ ] Navigate to Phase 3 (Development)
- [ ] Wait 5 seconds for auto-sync
- [ ] Check Zoho: `Discovery_Status` = `implementation_started`

### Monitoring and Alerts

Set up monitoring for the Discovery_Status workflow:

**Vercel Logs:**
- [ ] Monitor for "[Discovery Status]" log messages
- [ ] Monitor for "[Zoho Sync]" log messages
- [ ] Check for errors related to "Discovery_Status field not found"

**Zoho CRM:**
- [ ] Create a saved view filtering by Discovery_Status
- [ ] Create a report showing status distribution
- [ ] Set up workflow automation rules (optional) based on status changes

**Expected Log Messages:**
```
[Discovery Status] Rule 1: discovery_started
[Discovery Status] Rule 2: proposal
[Discovery Status] Rule 3: proposal_sent
[Discovery Status] Rule 4: technical_details_collection
[Discovery Status] Rule 5: implementation_started
[Zoho Sync] Successfully updated record: [recordId]
```

### Performance Verification

Ensure the new workflow doesn't impact performance:

- [ ] Measure sync latency: Should be < 3 seconds
- [ ] Check Vercel function execution time: Should be < 10 seconds
- [ ] Verify no timeout errors in production logs
- [ ] Test with 10+ concurrent syncs (stress test)

---

## Rollback Plan

If issues are discovered post-deployment:

### Emergency Rollback Steps

**Option 1: Revert to Previous Deployment**
```bash
# View recent deployments
vercel ls

# Rollback to previous deployment
vercel rollback [previous-deployment-url]
```

**Option 2: Disable Discovery_Status Updates**
```javascript
// Temporary fix in api/zoho/sync.js line 79:
// Discovery_Status: calculateDiscoveryStatus(meeting),  // ❌ COMMENT OUT
Discovery_Status: 'discovery_started',  // ✅ FALLBACK VALUE
```

Then redeploy:
```bash
git add api/zoho/sync.js
git commit -m "Temporarily disable Discovery_Status calculation"
vercel --prod
```

**Option 3: Remove Field from Zoho**
- Log in to Zoho CRM Admin
- Remove `Discovery_Status` field
- Field will be ignored in sync (no errors)

### Post-Rollback Actions

- [ ] Investigate root cause of issues
- [ ] Fix identified problems
- [ ] Re-test locally (run `scripts/test-discovery-status.js`)
- [ ] Re-deploy when fix is verified
- [ ] Update this checklist with lessons learned

---

## Success Criteria

The deployment is considered successful when:

- ✅ All 5 status transitions work correctly in production
- ✅ Zoho CRM shows correct Discovery_Status for all meetings
- ✅ No errors in Vercel logs related to Discovery_Status
- ✅ Sync latency remains under 3 seconds
- ✅ Manual user flow testing passes all 5 flows
- ✅ DiscoveryStatusBadge displays correctly in UI
- ✅ Status persists correctly through page refreshes
- ✅ Auto-sync continues to work as expected

---

## Troubleshooting Guide

### Issue: Discovery_Status not updating in Zoho

**Symptoms:**
- Status remains blank or unchanged in Zoho
- No errors in logs

**Solution:**
1. Check Zoho field exists: `node scripts/verify-zoho-field.js [recordId]`
2. Verify field name is exactly: `Discovery_Status` (case-sensitive)
3. Check Zoho permissions: Ensure API user has write access
4. Test sync manually: `curl -X POST .../api/zoho/sync` (see Step 3 above)

### Issue: Status shows wrong value

**Symptoms:**
- Status is set but incorrect (e.g., shows `proposal` when should be `proposal_sent`)

**Solution:**
1. Check meeting data structure in Supabase
2. Verify `proposalSent` field is being set correctly
3. Check console logs for "[Discovery Status]" messages
4. Run local test: `node scripts/test-discovery-status.js`

### Issue: Sync fails with authentication error

**Symptoms:**
- Logs show "401 Unauthorized" or "Invalid token"

**Solution:**
1. Verify Zoho refresh token is valid: `node scripts/verify-zoho-field.js`
2. Regenerate Zoho refresh token if needed
3. Update Vercel environment variables
4. Redeploy application

### Issue: Missing proposalSent field

**Symptoms:**
- Proposal download doesn't trigger status update
- Status stays at `proposal` after downloading PDF

**Solution:**
1. Check ProposalModule.tsx imports `markProposalAsSent`
2. Verify both download functions call `markProposalAsSent()`
3. Check browser console for errors
4. Verify proposal.ts types include `proposalSent` field

---

## Completion Sign-Off

**Deployment Date:** _________________

**Deployed By:** _________________

**Verification Completed By:** _________________

**Production URL:** https://automaziot-app.vercel.app/

**Zoho CRM Instance:** https://crm.zoho.com/crm/org123456789/

**Sign-off Checklist:**
- [ ] All pre-deployment checks passed
- [ ] Deployment completed successfully
- [ ] Post-deployment verification passed
- [ ] User flow testing passed (all 5 flows)
- [ ] Monitoring and alerts configured
- [ ] Success criteria met
- [ ] Team notified of deployment
- [ ] Documentation updated in Notion/Confluence

**Notes:**
_______________________________________________________________________________
_______________________________________________________________________________
_______________________________________________________________________________

---

**Document Version:** 1.0
**Last Updated:** 2025-01-09
**Next Review Date:** 2025-02-09
