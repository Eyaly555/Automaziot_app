# Auto Lead Response - Setup & Implementation Guide

## Service Overview

**Service ID**: `auto-lead-response`
**Service Name (EN)**: Auto Lead Response
**Service Name (HE)**: תגובה אוטומטית ללידים
**Category**: Automations
**Estimated Implementation Time**: 4-6 hours

### What This Service Does

Automatically sends immediate email responses to new leads when they submit forms on your website. The automation:
1. Captures form submissions via webhook
2. Sends personalized auto-response email within 2-5 minutes
3. Creates/updates lead record in CRM
4. Logs all activities for tracking

---

## Prerequisites

### 🔴 Critical Requirements

1. **Form Platform Access**
   - Webhook capability or API access
   - For Wix: Velo development required
   - For WordPress: Webhook plugin (e.g., WP Webhooks, Zapier for WordPress)
   - For custom forms: JavaScript webhook integration

2. **Email Service Provider**
   - SendGrid account (Free: 100 emails/day, Paid: from $19.95/month)
   - OR Mailgun account (Free: 5,000 emails/month, Paid: from $35/month)
   - OR SMTP credentials (Gmail, Outlook, or custom)
   - **Domain verification REQUIRED** (SPF + DKIM records)

3. **CRM System**
   - Zoho CRM: OAuth 2.0 credentials (Self-Client recommended)
   - Salesforce: API Key + Security Token
   - HubSpot: API Key or Private App Token
   - API rate limits: Zoho (10,000/day), Salesforce (15,000-100,000/day)

4. **n8n Workflow Platform**
   - n8n instance with HTTPS endpoint (required for webhooks)
   - Self-hosted or n8n.cloud account
   - Minimum: n8n v0.220.0+

### ⚠️ Important Notes

- **Response time is critical**: Studies show 2-5 minutes is optimal for conversion
- **Domain verification is mandatory**: Unverified domains = spam folder
- **Fallback mechanism required**: Email service downtime should not lose leads
- **Forms often don't support webhooks**: Be prepared to add plugins or custom code

---

## Implementation Steps

### Step 1: Form Platform Configuration (30-60 minutes)

#### 1.1 Identify Form Platform

- [ ] Determine which platform hosts your contact form
- [ ] Check if platform supports webhooks natively
- [ ] If not, identify required plugin/extension

#### 1.2 Enable Webhook Support

**For Wix Forms:**
```javascript
// Add this code to Velo (Wix Code)
import wixLocation from 'wix-location';
import {fetch} from 'wix-fetch';

$w.onReady(function () {
  $w('#contactForm').onWixFormSubmit((event) => {
    const formData = event.fields;

    // Send to n8n webhook
    fetch('https://your-n8n-instance.com/webhook/lead-response', {
      method: 'post',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(formData)
    });
  });
});
```

**For WordPress (using WP Webhooks plugin):**
1. Install "WP Webhooks" plugin
2. Navigate to Settings > Webhooks
3. Add new webhook trigger: "Form Submission"
4. Enter n8n webhook URL
5. Map form fields to webhook payload

**For Custom HTML Forms:**
```javascript
// Add to form submit handler
document.getElementById('contactForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const formData = new FormData(e.target);
  const data = Object.fromEntries(formData.entries());

  await fetch('https://your-n8n-instance.com/webhook/lead-response', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(data)
  });

  // Show success message
  alert('Thank you! We will contact you soon.');
});
```

#### 1.3 Test Webhook Delivery

- [ ] Submit test form
- [ ] Verify webhook payload received in n8n
- [ ] Confirm all form fields are captured

**Verification Criteria**: n8n receives webhook with all form fields populated

---

### Step 2: Email Service Setup (45-90 minutes)

#### 2.1 Choose Email Provider

**SendGrid Setup:**
1. Create account at sendgrid.com
2. Navigate to Settings > API Keys
3. Create new API key with "Mail Send" permissions
4. Copy API key (save securely)
5. Free tier: 100 emails/day

**Mailgun Setup:**
1. Create account at mailgun.com
2. Navigate to API Security
3. Copy API Key
4. Note your mailgun domain
5. Free tier: 5,000 emails/month

**SMTP (Gmail/Outlook):**
1. Enable 2FA on your account
2. Generate App Password (for Gmail)
3. Note SMTP settings:
   - Gmail: smtp.gmail.com:587
   - Outlook: smtp.office365.com:587

#### 2.2 Domain Verification (CRITICAL)

**Why Required**: Unverified domains = emails go to spam folder

**Steps:**
1. Add sender domain in email provider dashboard
2. Add DNS records to your domain:

**SPF Record:**
```
Type: TXT
Host: @
Value: v=spf1 include:sendgrid.net ~all
(or include:mailgun.org for Mailgun)
```

**DKIM Record:**
```
Type: TXT
Host: [provided by email service]
Value: [provided by email service]
```

3. Verify domain in email provider dashboard
4. Wait 24-48 hours for DNS propagation

#### 2.3 Create Email Template

**Template Variables:**
- `{{name}}` - Lead's name
- `{{email}}` - Lead's email
- `{{phone}}` - Lead's phone
- `{{company}}` - Company name
- `{{message}}` - Form message

**Sample Template (Hebrew):**
```html
<div dir="rtl">
  <p>שלום {{name}},</p>

  <p>תודה רבה על פנייתך אלינו!</p>

  <p>קיבלנו את הודעתך וניצור איתך קשר תוך 24 שעות.</p>

  <p>פרטי הפנייה שלך:<br>
  📧 אימייל: {{email}}<br>
  📱 טלפון: {{phone}}</p>

  <p>בברכה,<br>
  צוות שירות הלקוחות</p>
</div>
```

**Sample Template (English):**
```html
<div>
  <p>Hi {{name}},</p>

  <p>Thank you for reaching out to us!</p>

  <p>We have received your inquiry and will get back to you within 24 hours.</p>

  <p>Your inquiry details:<br>
  📧 Email: {{email}}<br>
  📱 Phone: {{phone}}</p>

  <p>Best regards,<br>
  Customer Service Team</p>
</div>
```

**Verification Criteria**:
- Template renders correctly with test data
- All variables replaced properly
- Mobile-responsive design
- Sender domain verified

---

### Step 3: CRM Integration (60-90 minutes)

#### 3.1 Get CRM API Credentials

**Zoho CRM (Recommended - Self-Client OAuth):**
1. Go to https://api-console.zoho.com/
2. Create "Self Client" application
3. Add scopes: `ZohoCRM.modules.ALL`, `ZohoCRM.users.READ`
4. Generate Refresh Token
5. Save Client ID, Client Secret, Refresh Token

**Salesforce:**
1. Setup > Create > Apps > Connected Apps
2. Enable OAuth Settings
3. Add callback URL
4. Copy Consumer Key and Consumer Secret
5. Get Security Token from email

**HubSpot:**
1. Settings > Integrations > API Key
2. Or: Create Private App with Contacts scope

#### 3.2 Configure CRM Module

**Zoho CRM Field Mapping Example:**
```json
{
  "form_to_crm_mapping": {
    "name": "Full_Name",
    "email": "Email",
    "phone": "Phone",
    "company": "Company",
    "message": "Description",
    "form_url": "Lead_Source"
  }
}
```

**Required CRM Fields:**
- Lead/Contact Name (mandatory)
- Email (mandatory)
- Phone
- Lead Source
- Description/Notes

#### 3.3 Test CRM Connection

- [ ] Test API connection with credentials
- [ ] Create test lead record
- [ ] Verify all fields mapped correctly
- [ ] Confirm lead source tracked

**Verification Criteria**: Test lead appears in CRM with all fields populated

---

### Step 4: n8n Workflow Development (90-120 minutes)

#### 4.1 Create n8n Workflow

**Workflow Structure:**
```
1. Webhook Trigger (receives form data)
2. Set Variables (extract form fields)
3. Create/Update Lead in CRM
4. Send Email Response
5. Log Activity
6. Error Handler
```

**n8n Workflow JSON (Basic Template):**
```json
{
  "nodes": [
    {
      "name": "Webhook",
      "type": "n8n-nodes-base.webhook",
      "position": [250, 300],
      "parameters": {
        "httpMethod": "POST",
        "path": "lead-response",
        "responseMode": "onReceived"
      }
    },
    {
      "name": "Extract Form Data",
      "type": "n8n-nodes-base.set",
      "position": [450, 300],
      "parameters": {
        "values": {
          "string": [
            {"name": "name", "value": "={{$json.body.name}}"},
            {"name": "email", "value": "={{$json.body.email}}"},
            {"name": "phone", "value": "={{$json.body.phone}}"},
            {"name": "message", "value": "={{$json.body.message}}"}
          ]
        }
      }
    },
    {
      "name": "Create Lead in CRM",
      "type": "n8n-nodes-base.zoho",
      "position": [650, 250],
      "parameters": {
        "resource": "lead",
        "operation": "create",
        "jsonParameters": true,
        "dataFieldsJson": "={{JSON.stringify({Full_Name: $node['Extract Form Data'].json.name, Email: $node['Extract Form Data'].json.email, Phone: $node['Extract Form Data'].json.phone, Description: $node['Extract Form Data'].json.message})}}"
      },
      "credentials": {
        "zohoOAuth2Api": "Zoho CRM"
      }
    },
    {
      "name": "Send Auto-Response Email",
      "type": "n8n-nodes-base.sendGrid",
      "position": [650, 350],
      "parameters": {
        "fromEmail": "support@example.com",
        "fromName": "Customer Service",
        "toEmail": "={{$node['Extract Form Data'].json.email}}",
        "subject": "תודה על פנייתך - Thank you for contacting us",
        "emailType": "html",
        "message": "שלום {{$node['Extract Form Data'].json.name}},\n\nקיבלנו את פנייתך וניצור קשר בקרוב.\n\nבברכה,\nצוות שירות הלקוחות"
      },
      "credentials": {
        "sendGridApi": "SendGrid"
      }
    }
  ],
  "connections": {
    "Webhook": {"main": [[{"node": "Extract Form Data", "type": "main", "index": 0}]]},
    "Extract Form Data": {"main": [[{"node": "Create Lead in CRM", "type": "main", "index": 0}, {"node": "Send Auto-Response Email", "type": "main", "index": 0}]]}
  }
}
```

#### 4.2 Add Error Handling

**Error Handler Node:**
```json
{
  "name": "Error Handler",
  "type": "n8n-nodes-base.sendEmail",
  "parameters": {
    "toEmail": "admin@example.com",
    "subject": "⚠️ Auto Lead Response Failed",
    "text": "Error: {{$json.error.message}}\n\nLead Data: {{$json}}"
  },
  "continueOnFail": true
}
```

**Retry Logic:**
- Set retry attempts: 3
- Retry delay: 30 seconds
- Fallback: Queue to retry queue

#### 4.3 Test Workflow End-to-End

- [ ] Submit test form
- [ ] Verify webhook received
- [ ] Confirm CRM lead created
- [ ] Check email sent and received
- [ ] Test error scenarios (invalid email, CRM down)

**Verification Criteria**:
- Complete flow works within 2-5 minutes
- All components execute successfully
- Error handling triggers correctly

---

### Step 5: Deployment & Monitoring (30-60 minutes)

#### 5.1 Pre-Launch Checklist

- [ ] Domain verified (SPF/DKIM)
- [ ] Email template tested
- [ ] CRM connection stable
- [ ] Webhook endpoint HTTPS
- [ ] Error notifications configured
- [ ] Test mode executed successfully

#### 5.2 Launch in Test Mode

1. Enable test mode: emails sent to test address only
2. Submit 10-20 test forms
3. Monitor response times
4. Check CRM for duplicate handling
5. Review error logs

#### 5.3 Go Live

1. Disable test mode
2. Update form webhook to production endpoint
3. Monitor first 24 hours closely
4. Track metrics:
   - Response time
   - Email delivery rate
   - CRM sync success rate

#### 5.4 Set Up Monitoring

**Key Metrics to Track:**
- Total leads processed
- Average response time (target: 2-5 minutes)
- Email delivery rate (target: >95%)
- CRM sync success rate (target: >98%)
- Error frequency

**Monitoring Tools:**
- n8n execution logs
- SendGrid/Mailgun delivery dashboard
- CRM audit logs
- Custom dashboard (optional)

---

## Troubleshooting

### Issue: Webhook not triggering

**Symptoms**: Form submitted but n8n doesn't receive webhook

**Solutions**:
1. Verify webhook URL is correct (HTTPS required)
2. Check form platform webhook logs
3. Test webhook directly with Postman/curl
4. Ensure n8n workflow is active
5. Check firewall/network restrictions

### Issue: Emails going to spam

**Symptoms**: Auto-responses landing in spam folder

**Solutions**:
1. ✅ Verify domain (SPF/DKIM records)
2. Reduce number of links in email
3. Avoid spam trigger words
4. Use plain text + HTML version
5. Warm up new domain (gradually increase volume)
6. Check sender reputation at mail-tester.com

### Issue: CRM duplicate leads

**Symptoms**: Same lead created multiple times in CRM

**Solutions**:
1. Enable duplicate detection in workflow
2. Use email as unique identifier
3. Implement upsert logic (update if exists, create if not)
4. Add deduplication node in n8n

### Issue: Slow response time

**Symptoms**: Response takes >5 minutes

**Solutions**:
1. Check n8n server resources
2. Optimize CRM API calls (batch if possible)
3. Use asynchronous processing
4. Scale n8n instance (more CPU/RAM)
5. Check email service rate limits

### Issue: Intermittent failures

**Symptoms**: Some leads don't receive responses

**Solutions**:
1. Implement retry queue
2. Add email fallback service
3. Monitor API rate limits
4. Check error logs for patterns
5. Implement dead-letter queue

---

## Rate Limits & Scaling

### Email Service Limits

**SendGrid:**
- Free: 100 emails/day
- Essentials: 40,000 emails/month ($19.95)
- Pro: 100,000 emails/month ($89.95)

**Mailgun:**
- Free: 5,000 emails/month (first 3 months)
- Foundation: 50,000 emails/month ($35)
- Growth: 100,000 emails/month ($80)

### CRM API Limits

**Zoho CRM:**
- Free/Standard: 10,000 API calls/day
- Professional: 10,000 API calls/day
- Enterprise: 10,000 API calls/day
- Self-Client OAuth: No refresh token expiry

**Salesforce:**
- Essentials: 15,000 API calls/day
- Professional: 15,000 API calls/day
- Enterprise: 100,000 API calls/day

### Scaling Recommendations

**Low Volume (< 100 leads/day):**
- SendGrid Free tier
- Single n8n instance
- Manual monitoring

**Medium Volume (100-1,000 leads/day):**
- SendGrid Essentials
- Dedicated n8n instance (2 CPU, 4GB RAM)
- Automated monitoring
- Duplicate detection

**High Volume (> 1,000 leads/day):**
- SendGrid Pro or Mailgun Growth
- Load-balanced n8n cluster
- Real-time monitoring dashboard
- Advanced error handling
- Alternative email service fallback

---

## Post-Implementation

### Week 1: Monitor Closely

- [ ] Check execution logs daily
- [ ] Review email delivery rates
- [ ] Monitor CRM sync errors
- [ ] Collect user feedback

### Week 2-4: Optimize

- [ ] Analyze response time patterns
- [ ] Optimize email template (A/B test)
- [ ] Refine CRM field mapping
- [ ] Adjust error thresholds

### Monthly: Review & Improve

- [ ] Generate performance report
- [ ] Review error patterns
- [ ] Update email templates
- [ ] Check rate limit usage
- [ ] Plan capacity upgrades if needed

---

## Success Criteria

✅ **Auto-response sent within 2-5 minutes** for 95%+ of leads
✅ **Email delivery rate > 95%** (not in spam)
✅ **CRM sync success rate > 98%**
✅ **Zero data loss** (all leads captured)
✅ **Error notification system** working
✅ **Fallback mechanism** tested and functional

---

## Support & Resources

### Documentation Links

- **SendGrid**: https://docs.sendgrid.com/
- **Mailgun**: https://documentation.mailgun.com/
- **Zoho CRM API**: https://www.zoho.com/crm/developer/docs/api/v2/
- **n8n Workflows**: https://docs.n8n.io/
- **SPF/DKIM Setup**: https://www.dmarcanalyzer.com/spf/checker/

### Common Tools

- **Webhook Testing**: https://webhook.site/
- **Email Testing**: https://www.mail-tester.com/
- **DNS Checker**: https://dnschecker.org/
- **API Testing**: Postman, Insomnia

---

**Document Version**: 1.0
**Last Updated**: 2025-01-09
**Service ID**: auto-lead-response
**Category**: Automations
