# Zoho Backend API Implementation Guide

## סקירה כללית

מסמך זה מפרט את יישום ה-Backend API הנדרש כדי לתמוך בתכונות החדשות של האפליקציה - רשימת לקוחות מ-Zoho וסנכרון מלא.

---

## שדות חדשים נדרשים ב-Zoho Module: `Potentials1`

יש להוסיף את השדות הבאים במודול `Potentials1` ב-Zoho CRM:

### 1. **Current_Phase** (Pick List)
- **Values:** `Discovery`, `Implementation_Spec`, `Development`, `Completed`
- **Default:** `Discovery`
- **Description:** השלב הנוכחי של הפרויקט

### 2. **Implementation_Spec_Data** (Multi Line - Large)
- **Description:** JSON של כל נתוני Phase 2 (Implementation Specification)
- **Max Length:** 32000 characters

### 3. **Development_Tracking_Data** (Multi Line - Large)
- **Description:** JSON של כל נתוני Phase 3 (Development Tracking)
- **Max Length:** 32000 characters

### 4. **Phase_History** (Multi Line - Large)
- **Description:** JSON של היסטוריית מעברים בין phases
- **Max Length:** 32000 characters

### 5. **Overall_Progress_Percent** (Number)
- **Description:** אחוז התקדמות כללי (0-100)
- **Default:** 0

### 6. **Phase2_Progress_Percent** (Number)
- **Description:** אחוז התקדמות Phase 2
- **Default:** 0

### 7. **Phase3_Progress_Percent** (Number)
- **Description:** אחוז התקדמות Phase 3
- **Default:** 0

### 8. **Last_Sync_Timestamp** (DateTime)
- **Description:** חותמת זמן של הסנכרון האחרון
- **Auto-populated:** Yes

### 9. **Sync_Status** (Pick List)
- **Values:** `Synced`, `Pending`, `Error`
- **Default:** `Pending`
- **Description:** סטטוס הסנכרון האחרון

### 10. **Meeting_Data_JSON** (Multi Line - Large)
- **Description:** גיבוי מלא של כל ה-Meeting object
- **Max Length:** 32000 characters

---

## Backend API Endpoints

### Base URL
```
/api/zoho
```

### Authentication
כל הבקשות דורשות authentication token תקף של Zoho.

---

## 1. GET `/potentials/list`

**תיאור:** מחזיר רשימה של כל ה-Potentials (לקוחות) מהמודול Potentials1.

### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `phase` | string | No | סינון לפי phase: `all`, `discovery`, `implementation_spec`, `development`, `completed` |
| `status` | string | No | סינון לפי status |
| `limit` | number | No | מקסימום תוצאות (default: 100) |
| `offset` | number | No | offset לpagination (default: 0) |
| `sort` | string | No | מיון: `name`, `date`, `progress` (default: `date`) |

### Response
```json
{
  "success": true,
  "potentials": [
    {
      "recordId": "1234567890",
      "clientName": "שם הלקוח",
      "companyName": "שם החברה",
      "phase": "discovery",
      "status": "discovery_in_progress",
      "overallProgress": 45,
      "phase2Progress": 0,
      "phase3Progress": 0,
      "lastModified": "2025-10-02T10:30:00Z",
      "lastSync": "2025-10-02T10:25:00Z",
      "syncStatus": "synced",
      "owner": "John Doe",
      "email": "client@example.com",
      "phone": "+972-50-1234567",
      "discoveryDate": "2025-09-15T00:00:00Z",
      "discoveryModulesCompleted": 5
    }
  ],
  "total": 150
}
```

### Implementation Notes
- טען רשימה מ-Zoho CRM דרך REST API
- Map את השדות הקיימים לפורמט הנדרש
- Parse JSON fields אם קיימים
- החזר רק שדות בסיסיים (לא את כל ה-Meeting data)

### Code Example (Node.js)
```javascript
app.get('/api/zoho/potentials/list', async (req, res) => {
  try {
    const { phase, status, limit = 100, offset = 0, sort = 'date' } = req.query;

    // Build Zoho query
    let criteria = [];
    if (phase && phase !== 'all') {
      criteria.push(`(Current_Phase:equals:${phase})`);
    }
    if (status && status !== 'all') {
      criteria.push(`(Discovery_Status:equals:${status})`);
    }

    const params = {
      module: 'Potentials1',
      fields: 'id,Name,Company_s_Name,Current_Phase,Discovery_Status,Overall_Progress_Percent,Phase2_Progress_Percent,Phase3_Progress_Percent,Modified_Time,Last_Sync_Timestamp,Sync_Status,Owner,Email,Phone,Discovery_Date,Discovery_Modules_Completed',
      per_page: limit,
      page: Math.floor(offset / limit) + 1,
      sort_by: sort === 'name' ? 'Name' : sort === 'progress' ? 'Overall_Progress_Percent' : 'Modified_Time',
      sort_order: 'desc'
    };

    if (criteria.length > 0) {
      params.criteria = criteria.join(' and ');
    }

    const zohoResponse = await zohoClient.get('/Potentials1', { params });

    const potentials = zohoResponse.data.data.map(record => ({
      recordId: record.id,
      clientName: record.Name,
      companyName: record.Company_s_Name,
      phase: record.Current_Phase || 'discovery',
      status: record.Discovery_Status || 'discovery_in_progress',
      overallProgress: record.Overall_Progress_Percent || 0,
      phase2Progress: record.Phase2_Progress_Percent,
      phase3Progress: record.Phase3_Progress_Percent,
      lastModified: record.Modified_Time,
      lastSync: record.Last_Sync_Timestamp,
      syncStatus: record.Sync_Status || 'pending',
      owner: record.Owner?.name,
      email: record.Email,
      phone: record.Phone,
      discoveryDate: record.Discovery_Date,
      discoveryModulesCompleted: record.Discovery_Modules_Completed
    }));

    res.json({
      success: true,
      potentials,
      total: zohoResponse.data.info.count
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});
```

---

## 2. GET `/potentials/:recordId/full`

**תיאור:** מחזיר נתונים מלאים של לקוח ספציפי, כולל כל ה-Meeting data.

### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `recordId` | string | Yes | Zoho Record ID |

### Response
```json
{
  "success": true,
  "potential": {
    "recordId": "1234567890",
    "clientName": "שם הלקוח",
    "companyName": "שם החברה",
    ...
  },
  "meetingData": {
    "meetingId": "abc123",
    "clientName": "שם הלקוח",
    "date": "2025-09-15T10:00:00Z",
    "modules": { ... },
    "phase": "discovery",
    "status": "discovery_in_progress",
    "zohoIntegration": {
      "recordId": "1234567890",
      "module": "Potentials1",
      "lastSyncTime": "2025-10-02T10:25:00Z",
      "syncEnabled": true
    },
    ...
  }
}
```

### Implementation Notes
- טען record מלא מ-Zoho
- Parse את השדה `Meeting_Data_JSON` ל-Meeting object
- אם אין JSON, צור Meeting object חדש מהשדות הבסיסיים
- החזר גם metadata וגם Meeting data מלא

### Code Example
```javascript
app.get('/api/zoho/potentials/:recordId/full', async (req, res) => {
  try {
    const { recordId } = req.params;

    const zohoResponse = await zohoClient.get(`/Potentials1/${recordId}`);
    const record = zohoResponse.data.data[0];

    // Parse Meeting Data JSON
    let meetingData = null;
    if (record.Meeting_Data_JSON) {
      try {
        meetingData = JSON.parse(record.Meeting_Data_JSON);
      } catch (e) {
        console.error('Failed to parse Meeting_Data_JSON:', e);
      }
    }

    // If no meeting data, create from basic fields
    if (!meetingData) {
      meetingData = {
        meetingId: generateId(),
        clientName: record.Name,
        date: record.Discovery_Date || new Date(),
        modules: {
          overview: {},
          leadsAndSales: {},
          customerService: {},
          operations: {},
          reporting: {},
          aiAgents: {},
          systems: {},
          roi: {},
          planning: {}
        },
        painPoints: [],
        phase: record.Current_Phase || 'discovery',
        status: record.Discovery_Status || 'discovery_in_progress',
        phaseHistory: [],
        zohoIntegration: {
          recordId: record.id,
          module: 'Potentials1',
          lastSyncTime: record.Last_Sync_Timestamp,
          syncEnabled: true
        }
      };
    }

    res.json({
      success: true,
      potential: {
        recordId: record.id,
        clientName: record.Name,
        companyName: record.Company_s_Name,
        phase: record.Current_Phase,
        status: record.Discovery_Status,
        overallProgress: record.Overall_Progress_Percent || 0
      },
      meetingData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});
```

---

## 3. POST `/potentials/sync-full`

**תיאור:** מסנכרן Meeting data מלא ל-Zoho CRM (יוצר או מעדכן record).

### Request Body
```json
{
  "meeting": {
    "meetingId": "abc123",
    "clientName": "שם הלקוח",
    "modules": { ... },
    "phase": "discovery",
    "status": "discovery_in_progress",
    ...
  },
  "recordId": "1234567890",
  "fullSync": true
}
```

### Response
```json
{
  "success": true,
  "recordId": "1234567890",
  "message": "Sync successful"
}
```

### Implementation Notes
- אם `recordId` לא קיים - צור record חדש
- אם `recordId` קיים - עדכן record קיים
- שמור את כל ה-Meeting object ב-`Meeting_Data_JSON`
- עדכן שדות metadata: `Overall_Progress_Percent`, `Current_Phase`, `Discovery_Status`, וכו'
- Parse phase-specific data ל-JSON fields נפרדים (`Implementation_Spec_Data`, `Development_Tracking_Data`)
- עדכן `Last_Sync_Timestamp` ו-`Sync_Status`

### Code Example
```javascript
app.post('/api/zoho/potentials/sync-full', async (req, res) => {
  try {
    const { meeting, recordId, fullSync } = req.body;

    // Calculate progress
    const overallProgress = calculateProgress(meeting);

    // Prepare data for Zoho
    const zohoData = {
      Name: meeting.clientName,
      Company_s_Name: meeting.clientName,
      Current_Phase: meeting.phase,
      Discovery_Status: meeting.status,
      Overall_Progress_Percent: overallProgress,
      Meeting_Data_JSON: JSON.stringify(meeting),
      Last_Sync_Timestamp: new Date().toISOString(),
      Sync_Status: 'Synced',
      Discovery_Modules_Completed: countCompletedModules(meeting)
    };

    // Phase-specific data
    if (meeting.implementationSpec) {
      zohoData.Implementation_Spec_Data = JSON.stringify(meeting.implementationSpec);
      zohoData.Phase2_Progress_Percent = meeting.implementationSpec.completionPercentage;
    }

    if (meeting.developmentTracking) {
      zohoData.Development_Tracking_Data = JSON.stringify(meeting.developmentTracking);
      zohoData.Phase3_Progress_Percent = meeting.developmentTracking.progress?.progressPercentage;
    }

    let response;
    if (recordId) {
      // Update existing record
      response = await zohoClient.put(`/Potentials1/${recordId}`, { data: [zohoData] });
    } else {
      // Create new record
      response = await zohoClient.post('/Potentials1', { data: [zohoData] });
    }

    const newRecordId = recordId || response.data.data[0].details.id;

    res.json({
      success: true,
      recordId: newRecordId,
      message: 'Sync successful'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});
```

---

## 4. PUT `/potentials/:recordId/phase`

**תיאור:** מעדכן phase ו-status של potential בלבד (לא את כל הנתונים).

### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `recordId` | string | Yes | Zoho Record ID |

### Request Body
```json
{
  "phase": "implementation_spec",
  "status": "spec_in_progress",
  "notes": "Phase changed to Implementation Spec"
}
```

### Response
```json
{
  "success": true,
  "message": "Phase updated successfully"
}
```

### Implementation Notes
- עדכן רק את השדות `Current_Phase` ו-`Discovery_Status`
- הוסף הערה ל-`Phase_History` JSON field
- עדכן `Last_Sync_Timestamp`

### Code Example
```javascript
app.put('/api/zoho/potentials/:recordId/phase', async (req, res) => {
  try {
    const { recordId } = req.params;
    const { phase, status, notes } = req.body;

    // Get current record to update Phase_History
    const currentRecord = await zohoClient.get(`/Potentials1/${recordId}`);
    const record = currentRecord.data.data[0];

    let phaseHistory = [];
    if (record.Phase_History) {
      try {
        phaseHistory = JSON.parse(record.Phase_History);
      } catch (e) {
        console.error('Failed to parse Phase_History');
      }
    }

    // Add new phase transition
    phaseHistory.push({
      fromPhase: record.Current_Phase,
      toPhase: phase,
      timestamp: new Date(),
      notes
    });

    const updateData = {
      Current_Phase: phase,
      Discovery_Status: status,
      Phase_History: JSON.stringify(phaseHistory),
      Last_Sync_Timestamp: new Date().toISOString()
    };

    await zohoClient.put(`/Potentials1/${recordId}`, { data: [updateData] });

    res.json({
      success: true,
      message: 'Phase updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});
```

---

## 5. GET `/potentials/search`

**תיאור:** חיפוש לקוחות לפי query string.

### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `q` | string | Yes | מחרוזת חיפוש |

### Response
```json
{
  "success": true,
  "results": [
    {
      "recordId": "1234567890",
      "clientName": "שם הלקוח",
      "companyName": "שם החברה",
      ...
    }
  ]
}
```

### Implementation Notes
- חפש ב-`Name`, `Company_s_Name`, `Email`, `Phone`
- החזר עד 50 תוצאות
- מיין לפי relevance

### Code Example
```javascript
app.get('/api/zoho/potentials/search', async (req, res) => {
  try {
    const { q } = req.query;

    const criteria = [
      `(Name:contains:${q})`,
      `(Company_s_Name:contains:${q})`,
      `(Email:contains:${q})`
    ].join(' or ');

    const zohoResponse = await zohoClient.get('/Potentials1', {
      params: {
        criteria,
        per_page: 50,
        fields: 'id,Name,Company_s_Name,Current_Phase,Discovery_Status,Overall_Progress_Percent,Email,Phone'
      }
    });

    const results = zohoResponse.data.data.map(record => ({
      recordId: record.id,
      clientName: record.Name,
      companyName: record.Company_s_Name,
      phase: record.Current_Phase || 'discovery',
      status: record.Discovery_Status,
      overallProgress: record.Overall_Progress_Percent || 0,
      email: record.Email,
      phone: record.Phone
    }));

    res.json({
      success: true,
      results
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});
```

---

## Environment Variables Required

```env
ZOHO_CLIENT_ID=your_client_id
ZOHO_CLIENT_SECRET=your_client_secret
ZOHO_REFRESH_TOKEN=your_refresh_token
ZOHO_REDIRECT_URI=http://localhost:3000/auth/callback
ZOHO_API_DOMAIN=https://www.zohoapis.com
```

---

## Error Handling

כל ה-endpoints צריכים להחזיר errors בפורמט הבא:

```json
{
  "success": false,
  "message": "Error description",
  "code": "ERROR_CODE"
}
```

### Common Error Codes
- `ZOHO_AUTH_ERROR` - בעיית authentication
- `RECORD_NOT_FOUND` - Record לא נמצא
- `INVALID_DATA` - נתונים לא תקינים
- `SYNC_FAILED` - סנכרון נכשל
- `RATE_LIMIT_EXCEEDED` - חריגה ממגבלת API calls

---

## Testing

### Manual Testing
1. השתמש ב-Postman/Insomnia לבדיקת כל endpoint
2. ודא שהנתונים מסתנכרנים נכון ל-Zoho
3. בדוק pagination, filtering, sorting

### Automated Testing
```javascript
describe('Zoho API', () => {
  test('GET /potentials/list returns clients', async () => {
    const response = await request(app).get('/api/zoho/potentials/list');
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.potentials)).toBe(true);
  });

  test('POST /potentials/sync-full creates/updates record', async () => {
    const meeting = createTestMeeting();
    const response = await request(app)
      .post('/api/zoho/potentials/sync-full')
      .send({ meeting, fullSync: true });
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.recordId).toBeDefined();
  });
});
```

---

## Performance Optimization

1. **Caching:** השתמש ב-Redis לcaching של רשימות לקוחות (5 דקות TTL)
2. **Batch Operations:** אפשר batch sync של מספר לקוחות
3. **Rate Limiting:** הגבל API calls מהclient ל-10 requests/minute
4. **Compression:** דחוס JSON fields גדולים לפני שמירה ב-Zoho

---

## Security Considerations

1. **Never expose Zoho credentials in client-side code**
2. **Validate all input data**
3. **Use HTTPS only**
4. **Implement request signing/verification**
5. **Rate limiting per user/IP**

---

## סיכום

לאחר יישום כל ה-endpoints הללו, האפליקציה תוכל:
- ✅ לטעון רשימת לקוחות מ-Zoho
- ✅ לבחור לקוח ספציפי ולטעון את כל הנתונים שלו
- ✅ לסנכרן שינויים ל-Zoho בזמן אמת
- ✅ לעקוב אחר phases ו-progress
- ✅ לעבוד offline עם localStorage cache

**הצלחה! 🚀**
