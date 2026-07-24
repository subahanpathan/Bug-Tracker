# Phase 3: Testing & Verification Guide

## 🧪 Complete Testing Checklist for Phase 3

### Prerequisites Before Testing

- [ ] Run database migration: `docs/migrations/003_add_email_and_activity.sql`
- [ ] Configure `.env`:
  ```env
  SENDGRID_API_KEY=your_actual_sendgrid_api_key
  SENDGRID_FROM_EMAIL=noreply@bugtracker.com
  SENDGRID_TEMPLATE_TICKET_CREATED=d-xxxxx
  SENDGRID_TEMPLATE_TICKET_ASSIGNED=d-xxxxx
  SENDGRID_TEMPLATE_TICKET_UPDATED=d-xxxxx
  SENDGRID_TEMPLATE_COMMENT=d-xxxxx
  SENDGRID_TEMPLATE_TEAM_INVITE=d-xxxxx
  ACTIVITY_LOG_RETENTION_DAYS=90
  ```
- [ ] Restart backend server
- [ ] Backend running on http://localhost:5000
- [ ] Frontend running on http://localhost:3000

---

## 1️⃣ Email Preferences Testing

### Test Case 1.1: Get Email Preferences
**Steps:**
1. Open browser DevTools → Network tab
2. Navigate to User Settings
3. Click Email Preferences section
4. Observe network request: `GET /api/user/email-preferences`

**Expected Result:**
- Status 200
- Response shows 7 preference types (all true by default)
- UI shows all toggles enabled

**Verify:**
```json
{
  "ticket_created": true,
  "ticket_assigned": true,
  "ticket_updated": true,
  "comment_added": true,
  "team_updates": true,
  "daily_digest": false,
  "weekly_summary": false
}
```

### Test Case 1.2: Disable Email Preference
**Steps:**
1. In Email Preferences UI, toggle OFF: "New Tickets"
2. Observe network request: `PUT /api/user/email-preferences`
3. Verify success toast appears
4. Refresh page
5. Verify preference is still OFF

**Expected Result:**
- Preference saved to database
- UI reflects disabled state
- Persists after refresh

### Test Case 1.3: Enable All Preferences
**Steps:**
1. Click "Disable All" button
2. Verify all toggles switch OFF
3. Click "Enable All" button
4. Verify all toggles switch ON
5. Verify save happens automatically

**Expected Result:**
- Bulk enable/disable works
- UI and database stay in sync

---

## 2️⃣ Activity Logging Testing

### Test Case 2.1: Log Activity on Ticket Create
**Steps:**
1. Create new ticket: "Test Activity Logging"
2. Check backend logs for activity service calls
3. Navigate to Activity Feed (project page)
4. Observe activity appears

**Expected Result:**
```
Activity logged:
- User: Current user
- Action: "created"
- Entity: "ticket"
- Details: "Created ticket: Test Activity Logging"
- Timestamp: Recent
```

**Verify in Database:**
```sql
SELECT * FROM activity_logs 
WHERE entity_type = 'ticket' AND action = 'created'
ORDER BY created_at DESC LIMIT 1;
```

### Test Case 2.2: Track Changes on Ticket Update
**Steps:**
1. Open ticket created in 2.1
2. Change Status: open → in-progress
3. Change Priority: medium → high
4. Click Update
5. Check Activity Feed

**Expected Result:**
Activity shows:
```
"Updated ticket: Test Activity Logging (status: open → in-progress, priority: medium → high)"
```

With expandable "View changes" showing:
```
status: open → in-progress
priority: medium → high
```

### Test Case 2.3: Log Activity on Assignment
**Steps:**
1. Open a ticket
2. Assign to team member
3. Check Activity Feed

**Expected Result:**
```
"Assigned ticket to [Team Member Name]: Test Activity Logging"
```

### Test Case 2.4: Activity Pagination
**Steps:**
1. Create 30+ activities (multiple tickets/updates)
2. Go to Activity Feed
3. Scroll to bottom
4. Click "Load more activities"

**Expected Result:**
- First 30 activities load
- Click Load More → next batch loads
- Total activity count correct

---

## 3️⃣ Email Notification Testing

### Test Case 3.1: Email on Ticket Creation
**Steps:**
1. Ensure your email preference `ticket_created` is ENABLED
2. Have 2+ team members in project
3. One member creates ticket
4. Other members wait 5-10 seconds

**Expected Result:**
- All team members receive email from SendGrid
- Email contains ticket title, description, priority
- Email shows ticket details

**Verify:**
- Check email inbox/spam folder
- Verify sender is `SENDGRID_FROM_EMAIL`
- Verify template renders correctly

### Test Case 3.2: Respect Email Preferences
**Steps:**
1. Team Member A: Disable `ticket_created` in preferences
2. Team Member B: Keep `ticket_created` enabled
3. Create new ticket
4. Wait 5-10 seconds

**Expected Result:**
- Team Member B receives email
- Team Member A does NOT receive email
- Backend logs show preference check

### Test Case 3.3: Email on Ticket Assignment
**Steps:**
1. Ensure `ticket_assigned` preference is ENABLED
2. Create ticket without assignment
3. Assign to team member
4. Wait 5-10 seconds

**Expected Result:**
- Assignee receives email
- Email says: "You've been assigned to ticket: [title]"

**Verify Email Contains:**
- Ticket title
- Ticket description
- Assigned by (who assigned)
- Project name
- Link to ticket

### Test Case 3.4: Email on Ticket Update
**Steps:**
1. Ensure `ticket_updated` preference is ENABLED
2. Create ticket (reporter = User A)
3. Assign to User B
4. Have User C update ticket status
5. Wait 5-10 seconds

**Expected Result:**
- User A (reporter) receives email
- User B (assignee) receives email
- User C (updater) does NOT receive (they did it)
- Email shows what changed

### Test Case 3.5: Email on Comment
**Steps:**
1. Create ticket (Creator = User A)
2. Assign to User B
3. User C adds comment
4. Wait 5-10 seconds

**Expected Result:**
- User A (creator) receives email
- User B (assignee) receives email
- User C (commenter) does NOT receive
- Email shows comment text

**Not Emailed:**
- Other team members (only direct stakeholders)
- Users with `comment_added` disabled

---

## 4️⃣ Activity Feed Component Testing

### Test Case 4.1: Activity Feed Display
**Steps:**
1. Go to project dashboard/page
2. Scroll to Activity Feed section
3. Observe list of recent activities

**Expected Result:**
- Activities display in chronological order (newest first)
- Each activity shows:
  - User avatar/name
  - Action type with icon
  - Description
  - Relative time (e.g., "5 minutes ago")
  - Colored border by action type

### Test Case 4.2: Color Coding & Icons
**Steps:**
1. Look at various activity types in feed
2. Verify color mapping:
   - Created: Green
   - Updated: Blue
   - Deleted: Red
   - Commented: Purple
   - Assigned: Orange

**Expected Result:**
All activities have correct color and icon

### Test Case 4.3: View Changes
**Steps:**
1. Find updated ticket activity
2. Click "View changes"
3. Observe details expand

**Expected Result:**
Shows which fields changed and old/new values:
```
title: Old Title → New Title
priority: medium → high
status: open → in-progress
```

### Test Case 4.4: Mobile Responsive
**Steps:**
1. Open Activity Feed on mobile (DevTools 375px width)
2. Verify layout adjusts
3. Verify text readable
4. Verify "Load more" button works

**Expected Result:**
- Single column layout
- No horizontal scroll
- Touch-friendly button (44px+ tall)
- Text readable on small screen

---

## 5️⃣ API Endpoint Testing

### Test Case 5.1: Get Project Activity
**Endpoint:** `GET /api/projects/{projectId}/activity?limit=10&offset=0`

**Steps:**
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:5000/api/projects/project-123/activity?limit=10&offset=0"
```

**Expected Response:**
```json
{
  "activities": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "project_id": "uuid",
      "action": "created",
      "entity_type": "ticket",
      "entity_id": "uuid",
      "details": "Created ticket: ...",
      "changes": null,
      "created_at": "2026-04-18T...",
      "user": {
        "id": "uuid",
        "first_name": "John",
        "last_name": "Doe"
      }
    }
  ],
  "total": 42,
  "limit": 10,
  "offset": 0
}
```

### Test Case 5.2: Get Ticket Activity
**Endpoint:** `GET /api/tickets/{ticketId}/activity`

**Steps:**
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:5000/api/tickets/ticket-123/activity"
```

**Expected Result:**
- Only activities for this ticket
- All action types represented
- Chronological order

### Test Case 5.3: Activity Summary
**Endpoint:** `GET /api/projects/{projectId}/activity/summary?days=7`

**Expected Response:**
```json
{
  "period": "7 days",
  "total_activities": 125,
  "breakdown": {
    "created": 30,
    "updated": 60,
    "deleted": 5,
    "commented": 20,
    "assigned": 10
  }
}
```

### Test Case 5.4: Most Active Users
**Endpoint:** `GET /api/projects/{projectId}/activity/active-users?days=30&limit=10`

**Expected Response:**
```json
[
  {
    "user_id": "uuid",
    "first_name": "John",
    "last_name": "Doe",
    "activity_count": 45
  },
  ...
]
```

---

## 6️⃣ Database Verification

### Test Case 6.1: Email Preferences Table
```sql
-- Verify table exists
SELECT * FROM email_preferences LIMIT 1;

-- Verify RLS is enabled
SELECT tablename FROM pg_tables 
WHERE tablename='email_preferences';

-- Verify trigger works (auto-creates prefs on signup)
SELECT * FROM email_preferences WHERE user_id = 'specific-user-id';
```

### Test Case 6.2: Activity Logs Table
```sql
-- Verify table has data
SELECT COUNT(*) FROM activity_logs;

-- Verify indexes exist
SELECT indexname FROM pg_indexes 
WHERE tablename = 'activity_logs';

-- Verify RLS policies
SELECT * FROM activity_logs LIMIT 1;
```

### Test Case 6.3: Activity Retention
```sql
-- Manually cleanup old activities (test)
SELECT * FROM activity_logs 
WHERE created_at < NOW() - INTERVAL '90 days';

-- Call cleanup function
SELECT activityService.deleteOldActivities('project-id', 90);
```

---

## 7️⃣ Error Handling Testing

### Test Case 7.1: Email Service Failure
**Steps:**
1. Temporarily set invalid `SENDGRID_API_KEY`
2. Create ticket
3. Observe: Ticket created successfully (email fails gracefully)
4. Check backend logs for error message

**Expected Result:**
- Ticket created (core function not blocked)
- Error logged: "Failed to send emails: ..."
- User doesn't see error (graceful)

### Test Case 7.2: Activity Logging Failure
**Steps:**
1. Temporarily remove `activity_logs` table
2. Create ticket
3. Observe: Ticket created (activity fails gracefully)
4. Restore table

**Expected Result:**
- Ticket created
- Error logged: "Failed to log activity: ..."

### Test Case 7.3: Permission Testing
**Steps:**
1. Regular user (not project member) tries to view activity
2. Observe 403 error (RLS policy blocks)

**Expected Result:**
```json
{
  "status": "error",
  "message": "Insufficient permissions"
}
```

---

## 8️⃣ Integration Testing

### Test Case 8.1: Full Ticket Lifecycle
**Steps:**
1. Create ticket as User A
2. Assign to User B
3. User B updates status to in-progress
4. User A adds comment
5. Check Activity Feed
6. Check email inboxes
7. Verify all logs in database

**Expected Result:**
- 5 activities logged
- 5+ emails sent (depending on preferences)
- All data consistent in database

### Test Case 8.2: Concurrent Operations
**Steps:**
1. Open project in 2 browser tabs
2. Tab 1: Create ticket
3. Tab 2: Simultaneously update different ticket
4. Check Activity Feed refreshes (if using real-time)
5. Check database for both activities

**Expected Result:**
- Both activities logged
- No race conditions
- Both appear in feed

---

## 📊 Test Summary Form

```
Testing Date: __________
Tester Name: __________
Environment: Development / Staging / Production

PASSED TESTS:
- [ ] 1.1 Get Email Preferences
- [ ] 1.2 Disable Email Preference
- [ ] 1.3 Enable All Preferences
- [ ] 2.1 Log Activity on Ticket Create
- [ ] 2.2 Track Changes on Ticket Update
- [ ] 2.3 Log Activity on Assignment
- [ ] 2.4 Activity Pagination
- [ ] 3.1 Email on Ticket Creation
- [ ] 3.2 Respect Email Preferences
- [ ] 3.3 Email on Ticket Assignment
- [ ] 3.4 Email on Ticket Update
- [ ] 3.5 Email on Comment
- [ ] 4.1 Activity Feed Display
- [ ] 4.2 Color Coding & Icons
- [ ] 4.3 View Changes
- [ ] 4.4 Mobile Responsive
- [ ] 5.1-5.4 API Endpoints
- [ ] 6.1-6.3 Database Verification
- [ ] 7.1-7.3 Error Handling
- [ ] 8.1-8.2 Integration

Issues Found:
1. ___________________________
2. ___________________________
3. ___________________________

Overall Status: ✅ PASS / ⚠️ PARTIAL / ❌ FAIL
```

---

## 🚀 Production Deployment Checklist

After all tests pass:

- [ ] Database migration applied to production
- [ ] SendGrid account configured with verified sender
- [ ] Environment variables set correctly
- [ ] All email templates created in SendGrid
- [ ] Error monitoring configured (Sentry, Logrocket, etc.)
- [ ] Email logs enabled in SendGrid dashboard
- [ ] Activity retention policy set (90 days default)
- [ ] Backup plan for failed emails documented
- [ ] Performance tested with 1000+ activities
- [ ] Load testing completed
- [ ] Security review completed
- [ ] Documentation updated
- [ ] Monitoring/alerts configured

---

## 📞 Troubleshooting Guide

### Issue: Emails Not Sending
**Solutions:**
1. Verify `SENDGRID_API_KEY` is correct
2. Verify sender email is verified in SendGrid
3. Check email preference is enabled
4. Check backend logs: `grep "Failed to send" logs.txt`
5. Test SendGrid API key directly

### Issue: Activities Not Logging
**Solutions:**
1. Verify database migration ran
2. Check `activity_logs` table exists: `SELECT * FROM activity_logs LIMIT 1;`
3. Check user has permission to project
4. Check backend logs for activity service errors

### Issue: Activity Feed Not Loading
**Solutions:**
1. Verify routes registered in server.js
2. Check JWT token is valid
3. Verify user is project member (RLS)
4. Check network tab for 403 errors

### Issue: Emails Go to Spam
**Solutions:**
1. Add SPF/DKIM records for SendGrid
2. Use professional domain email
3. Adjust SendGrid settings for authentication
4. Monitor SendGrid reputation

---

**Phase 3 Testing Complete** ✅

All tests should pass before deploying to production.
